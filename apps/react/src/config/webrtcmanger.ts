/**
 * WebRTC manager built on the WebRTC "Perfect Negotiation" pattern.
 *
 * Both peers handle `onnegotiationneeded` and may originate offers.
 * Patient is the polite peer (rolls back on glare); therapist is impolite
 * (ignores incoming offers during their own offer). This removes the
 * asymmetric "only therapist may offer" rule that previously meant a
 * patient who toggled their camera on after answering had no way to
 * publish the new track — the m-line had been negotiated without an
 * SSRC and Chrome/Safari refused to upgrade it from a plain replaceTrack.
 *
 * Public API (`initialize`, `setCameraEnabled`, etc.) is preserved so
 * the React layer (SessionLobby / SessionWaiting / SessionLive) is
 * unchanged.
 */

const WEBSOCKET_URL = 'wss://elma-dsb6fne7c0bqezaj.centralindia-01.azurewebsites.net/';
const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.relay.metered.ca:80' },
  { urls: 'turn:global.relay.metered.ca:80', username: 'cdc87cccc674b5cd95ddde9c', credential: 'WnyJEhKDRKzCjJ7t' },
  { urls: 'turn:global.relay.metered.ca:80?transport=tcp', username: 'cdc87cccc674b5cd95ddde9c', credential: 'WnyJEhKDRKzCjJ7t' },
  { urls: 'turn:global.relay.metered.ca:443', username: 'cdc87cccc674b5cd95ddde9c', credential: 'WnyJEhKDRKzCjJ7t' },
  { urls: 'turns:global.relay.metered.ca:443?transport=tcp', username: 'cdc87cccc674b5cd95ddde9c', credential: 'WnyJEhKDRKzCjJ7t' },
];

type Role = 'patient' | 'therapist';
type StreamCallback = (stream: MediaStream | null) => void;
type MessagesCallback = (messages: any[]) => void;
type MediaStateCallback = (state: { micEnabled: boolean, cameraEnabled: boolean }) => void;
type LocalMediaKind = 'audio' | 'video';

const SIGNALING_TYPES = new Set([
  'webrtc_offer',
  'webrtc_answer',
  'webrtc_ice_candidate',
  'renegotiation_request',
  'media_state_updated',
]);

function normalizeRole(role: unknown): Role {
  const value = String(role ?? '').trim().toLowerCase();
  if (['therapist', 'expert', 'psych', 'psychologist', 'doctor', 'provider', 'counsellor', 'counselor', 'professional'].includes(value)) {
    return 'therapist';
  }
  return 'patient';
}

function log(tag: string, ...args: any[]) {
  const ts = new Date().toISOString().slice(11, 23); // HH:MM:SS.mmm
  console.log(`[WebRTC][${ts}][${tag}]`, ...args);
}

/**
 * Summarize an SDP for safe console logging without dumping the whole blob.
 * Captures presence of m=audio / m=video, their direction attribute, and
 * whether any SSRC is bound. This is what we need to diagnose the exact
 * "audio-only negotiation is broken" symptom.
 */
function summarizeSdp(sdp: string | undefined | null) {
  if (!sdp) return { audio: null, video: null };
  const sections: Record<string, any> = { audio: null, video: null };
  const mLines = sdp.split(/^m=/m).slice(1); // first chunk is session-level
  for (const block of mLines) {
    const kind = block.startsWith('audio') ? 'audio' : block.startsWith('video') ? 'video' : null;
    if (!kind) continue;
    const dir = ['sendrecv', 'sendonly', 'recvonly', 'inactive']
      .find(d => new RegExp(`^a=${d}`, 'm').test(block)) ?? 'sendrecv';
    const ssrcs = Array.from(block.matchAll(/^a=ssrc:(\d+)/gm)).map(m => m[1]);
    const msid = block.match(/^a=msid:(\S+(?:\s+\S+)?)/m)?.[1] ?? null;
    sections[kind] = { dir, ssrcs: ssrcs.slice(0, 4), msid };
  }
  return sections;
}

class WebRTCManager {
  pc: RTCPeerConnection | null = null;
  ws: WebSocket | null = null;
  localStream: MediaStream | null = null;
  remoteStream: MediaStream | null = null;
  sessionCode: string | null = null;
  userId: string | null = null;
  role: Role = 'patient';
  messages: any[] = [];

  // ── Perfect Negotiation state ────────────────────────────────────────────
  // polite=true → rollback on glare. polite=false → ignore colliding offer.
  // We make the patient polite and the therapist impolite.
  private polite = true;
  private makingOffer = false;
  private ignoreOffer = false;
  private isSettingRemoteAnswerPending = false;

  // ── Media state ──────────────────────────────────────────────────────────
  private _micEnabled = false;
  private _cameraEnabled = false;
  private _audioTransceiver: RTCRtpTransceiver | null = null;
  private _videoTransceiver: RTCRtpTransceiver | null = null;
  // Stable stream-id we advertise as the m-line msid for both audio and
  // video. Without this, sender.setStreams() is never called and Chromium
  // emits "a=msid:- <track-id>" — many remote stacks then either drop the
  // RTP into a phantom MediaStream or refuse to flow until renegotiation
  // rewrites the line. This single string is the lifeline that keeps the
  // audio sender wired to the same logical stream across re-offers.
  private _localStreamId = `elma-${Math.random().toString(36).slice(2, 10)}`;

  // ── ICE candidate queue ──────────────────────────────────────────────────
  private _pendingCandidates: RTCIceCandidateInit[] = [];

  // ── Serial signaling queue ───────────────────────────────────────────────
  // WebSocket onmessage fires for each frame, but the handlers are async and
  // run concurrently. That lets an ICE candidate begin processing while a
  // preceding offer is still inside `await setRemoteDescription`, so
  // addIceCandidate throws "InvalidStateError: remote description was null"
  // and the candidate is lost. We chain every handler through this promise
  // so signaling state transitions stay strictly ordered.
  private _signalingChain: Promise<void> = Promise.resolve();

  // ── WS reconnection ──────────────────────────────────────────────────────
  private _wsReconnectAttempts = 0;
  private _maxReconnectAttempts = 8;
  private _reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private _intentionalClose = false;

  // ── Peer readiness ───────────────────────────────────────────────────────
  private _peerReady = false;
  private _onPeerReady: (() => void) | null = null;
  private _lastRemoteMediaState: { micEnabled: boolean; cameraEnabled: boolean } | null = null;

  // ── Callbacks ────────────────────────────────────────────────────────────
  private _onRemoteSessionChanged: any;
  private remoteSessionListeners: Array<() => void> = [];

  onRemoteSessionChanged(cb: () => void) {
    this.remoteSessionListeners.push(cb);
    return () => {
      this.remoteSessionListeners = this.remoteSessionListeners.filter(fn => fn !== cb);
    };
  }
  private emitRemoteSessionChanged() {
    this.remoteSessionListeners.forEach(cb => cb());
  }

  private _onRemoteStreamChanged: StreamCallback | null = null;
  get onRemoteStreamChanged() { return this._onRemoteStreamChanged; }
  set onRemoteStreamChanged(cb: StreamCallback | null) {
    this._onRemoteStreamChanged = cb;
    if (cb) cb(this.remoteStream);
  }

  private _onLocalStreamChanged: StreamCallback | null = null;
  get onLocalStreamChanged() { return this._onLocalStreamChanged; }
  set onLocalStreamChanged(cb: StreamCallback | null) {
    this._onLocalStreamChanged = cb;
    if (cb) cb(this.localStream);
  }

  private _onMessagesChanged: MessagesCallback | null = null;
  get onMessagesChanged() { return this._onMessagesChanged; }
  set onMessagesChanged(cb: MessagesCallback | null) {
    this._onMessagesChanged = cb;
    if (cb) cb(this.messages);
  }

  private _onRemoteMediaStateChanged: MediaStateCallback | null = null;
  get onRemoteMediaStateChanged() { return this._onRemoteMediaStateChanged; }
  set onRemoteMediaStateChanged(cb: MediaStateCallback | null) {
    this._onRemoteMediaStateChanged = cb;
    if (cb && this._lastRemoteMediaState) cb(this._lastRemoteMediaState);
  }

  private _onConnectionStateChanged: ((state: string) => void) | null = null;
  get onConnectionStateChanged() { return this._onConnectionStateChanged; }
  set onConnectionStateChanged(cb: ((state: string) => void) | null) {
    this._onConnectionStateChanged = cb;
  }

  get onPeerReady() { return this._onPeerReady; }
  set onPeerReady(cb: (() => void) | null) {
    this._onPeerReady = cb;
    if (cb && this._peerReady) cb();
  }

  onPeerDisconnect: (() => void) | null = null;

  get peerConnection() { return this.pc; }

  // ── Public API ───────────────────────────────────────────────────────────

  async initialize(
    sessionCode: string = '69a54abd29c99c56303ea5f6',
    userId: string = '696f408b2ff51b82b1cee0e6',
    role: Role = 'patient',
    micEnabled = false,
    cameraEnabled = false,
    initialStream: MediaStream | null = null,
  ): Promise<void> {
    if (this.pc || this.ws) {
      console.warn('[WebRTC] Already initialized. Call hangup() first.');
      return;
    }

    this._intentionalClose = false;
    this.sessionCode = sessionCode;
    this.userId = userId;
    this.role = normalizeRole(role);
    this.polite = this.role === 'patient';
    this._micEnabled = micEnabled;
    this._cameraEnabled = cameraEnabled;
    this.localStream = new MediaStream();
    this._adoptInitialTracks(initialStream, micEnabled, cameraEnabled);

    try {
      if (micEnabled && !this._getLiveLocalTrack('audio')) {
        await this._acquireLocalKind('audio');
      }
      if (cameraEnabled && !this._getLiveLocalTrack('video')) {
        await this._acquireLocalKind('video');
      }
      this._snapshotLocalStream();
      this._onLocalStreamChanged?.(this.localStream);
    } catch (err) {
      console.error('[WebRTC] getUserMedia failed:', err);
      this.localStream?.getTracks().forEach(t => t.stop());
      this.localStream = null;
      throw err;
    }

    this._connectWebSocket();
  }

  async toggleMute(isMuted: boolean) {
    await this.setMicrophoneEnabled(!isMuted);
  }

  async toggleCamera(isOff: boolean) {
    await this.setCameraEnabled(!isOff);
  }

  async setMicrophoneEnabled(enabled: boolean) {
    if (!this._isSessionActive()) {
      this._micEnabled = enabled;
      return;
    }
    if (enabled) {
      await this._enableLocalKind('audio');
    } else {
      await this._disableLocalKind('audio');
    }
    this._micEnabled = enabled;
    this._snapshotLocalStream();
    this._onLocalStreamChanged?.(this.localStream);
    this._broadcastMediaState();
  }

  async setCameraEnabled(enabled: boolean) {
    if (!this._isSessionActive()) {
      this._cameraEnabled = enabled;
      return;
    }
    if (enabled) {
      await this._enableLocalKind('video');
    } else {
      await this._disableLocalKind('video');
    }
    this._cameraEnabled = enabled;
    this._snapshotLocalStream();
    this._onLocalStreamChanged?.(this.localStream);
    this._broadcastMediaState();
  }

  sendChatMessage(text: string) {
    this._sendWS({ type: 'chat_message', text });
  }

  sendMessage(message: object) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ ...message, sessionCode: this.sessionCode }));
    } else {
      console.warn('[WS] Tried to send but socket not open:', message);
    }
  }

  hangup(navigate = false, cb = () => {}) {
    this._intentionalClose = true;

    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer);
      this._reconnectTimer = null;
    }
    this._lastRemoteMediaState = null;

    if (this.ws?.readyState === WebSocket.OPEN) {
      const type = this.role === 'therapist' ? 'end_session' : 'leave_session';
      try {
        this.ws.send(JSON.stringify({ type, sessionCode: this.sessionCode, userId: this.userId, role: this.role }));
      } catch (err) {
        console.warn('[WS] Failed to send hangup message:', err);
      }
    }

    this.pc?.close();
    this.ws?.close();

    this.localStream?.getTracks().forEach(t => t.stop());
    this.remoteStream?.getTracks().forEach(t => t.stop());

    this.pc = null;
    this.ws = null;
    this.localStream = null;
    this.remoteStream = null;
    this.messages = [];
    this.sessionCode = null;
    this.userId = null;
    this._pendingCandidates = [];
    this._wsReconnectAttempts = 0;
    this.makingOffer = false;
    this.ignoreOffer = false;
    this.isSettingRemoteAnswerPending = false;
    this._peerReady = false;
    this._micEnabled = false;
    this._cameraEnabled = false;
    this._audioTransceiver = null;
    this._videoTransceiver = null;
    this._onPeerReady = null;

    this._onLocalStreamChanged?.(null);
    this._onRemoteStreamChanged?.(null);
    this._onMessagesChanged?.([]);

    this._onRemoteStreamChanged = null;
    this._onLocalStreamChanged = null;
    this._onMessagesChanged = null;
    this._onConnectionStateChanged = null;
    this.onPeerDisconnect = null;
    cb();

    if (navigate) {
      // routing handled at the page layer
    }
  }

  // ── Private: session checks ──────────────────────────────────────────────

  private _isSessionActive() {
    return Boolean(this.pc || this.ws || this.sessionCode);
  }

  // ── Private: local media ─────────────────────────────────────────────────

  private _ensureLocalStream() {
    if (!this.localStream) this.localStream = new MediaStream();
    return this.localStream;
  }

  private _adoptInitialTracks(stream: MediaStream | null, micEnabled: boolean, cameraEnabled: boolean) {
    if (!stream) return;
    const localStream = this._ensureLocalStream();
    const audioTrack = stream.getAudioTracks().find(t => t.readyState === 'live');
    const videoTrack = stream.getVideoTracks().find(t => t.readyState === 'live');
    if (micEnabled && audioTrack) {
      audioTrack.enabled = true;
      localStream.addTrack(audioTrack);
    }
    if (cameraEnabled && videoTrack) {
      videoTrack.enabled = true;
      localStream.addTrack(videoTrack);
    }
  }

  private _getLiveLocalTrack(kind: LocalMediaKind) {
    return this.localStream
      ?.getTracks()
      .find(t => t.kind === kind && t.readyState === 'live') ?? null;
  }

  /**
   * Acquire a local track via getUserMedia and add it to localStream.
   * Does not touch the peer connection.
   */
  private async _acquireLocalKind(kind: LocalMediaKind) {
    const existing = this._getLiveLocalTrack(kind);
    if (existing) {
      existing.enabled = true;
      return existing;
    }
    const mediaStream = kind === 'audio'
      ? await navigator.mediaDevices.getUserMedia({ audio: true })
      : await this._getCameraStreamWithFallback();

    const track = kind === 'audio'
      ? mediaStream.getAudioTracks()[0]
      : mediaStream.getVideoTracks()[0];

    if (!track) {
      mediaStream.getTracks().forEach(t => t.stop());
      throw new Error(`No ${kind} track returned by getUserMedia.`);
    }

    this._removeLocalTracks(kind, true);
    track.enabled = true;
    this._ensureLocalStream().addTrack(track);
    mediaStream.getTracks().forEach(t => { if (t !== track) t.stop(); });
    return track;
  }

  /**
   * Acquire a track and bind it to the corresponding RTCRtpSender. This
   * is what `setCameraEnabled(true)` / `setMicrophoneEnabled(true)` call
   * during an active session. After binding, the PC's negotiationneeded
   * event fires automatically and Perfect Negotiation takes over.
   */
  private async _enableLocalKind(kind: LocalMediaKind) {
    const track = await this._acquireLocalKind(kind);
    await this._bindSenderTrack(kind, track);
  }

  private async _disableLocalKind(kind: LocalMediaKind) {
    // Stop sending on the wire by clearing the sender's track. Stop the
    // physical track so the OS releases the camera/mic LED.
    await this._bindSenderTrack(kind, null);
    this._removeLocalTracks(kind, true);
  }

  private _removeLocalTracks(kind: LocalMediaKind, shouldStop: boolean) {
    if (!this.localStream) return;
    this.localStream.getTracks()
      .filter(t => t.kind === kind)
      .forEach(track => {
        this.localStream?.removeTrack(track);
        track.enabled = false;
        if (shouldStop) track.stop();
      });
  }

  private async _getCameraStreamWithFallback() {
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30 } },
      });
    } catch (err: any) {
      if (err?.name === 'OverconstrainedError' || err?.name === 'ConstraintNotSatisfiedError') {
        return await navigator.mediaDevices.getUserMedia({ video: true });
      }
      throw err;
    }
  }

  private _snapshotLocalStream() {
    if (!this.localStream) return;
    const tracks = this.localStream.getTracks();
    this.localStream = new MediaStream(tracks);
  }

  // ── Private: transceiver helpers ─────────────────────────────────────────

  private _getLocalTransceiver(kind: LocalMediaKind) {
    return kind === 'audio' ? this._audioTransceiver : this._videoTransceiver;
  }

  private _setLocalTransceiver(kind: LocalMediaKind, transceiver: RTCRtpTransceiver) {
    if (kind === 'audio') this._audioTransceiver = transceiver;
    else this._videoTransceiver = transceiver;
  }

  /**
   * Bind a track to the sender of the kind-specific transceiver. If the
   * transceiver doesn't exist yet (shouldn't happen after _buildPeerConnection
   * but defensive), create it sendrecv.
   *
   * After this call, the PC will fire `onnegotiationneeded` if the SDP
   * needs to change — which is exactly what we want.
   */
  private async _bindSenderTrack(kind: LocalMediaKind, track: MediaStreamTrack | null) {
    if (!this.pc) return;
    let transceiver = this._getLocalTransceiver(kind);
    if (!transceiver) {
      transceiver = this.pc.addTransceiver(kind, { direction: 'sendrecv' });
      this._setLocalTransceiver(kind, transceiver);
    }
    try {
      transceiver.direction = 'sendrecv';
    } catch { /* may throw on a closed PC; safe to ignore */ }
    await transceiver.sender.replaceTrack(track);
    // Bind / refresh the sender's streams whenever we attach a real track so
    // the msid matches across re-offers.
    if (track && typeof transceiver.sender.setStreams === 'function' && this.localStream) {
      try {
        transceiver.sender.setStreams(this.localStream);
      } catch (err) {
        console.warn('[PC] setStreams failed:', err);
      }
    }
    log('SENDER', `bound ${kind}`, {
      hasTrack: !!transceiver.sender.track,
      trackId: track?.id ?? null,
      direction: transceiver.direction,
    });
  }

  // ── Private: signaling ───────────────────────────────────────────────────

  private _broadcastMediaState() {
    if (this.ws?.readyState !== WebSocket.OPEN) return;
    this._sendWS({
      type: 'media_state_updated',
      userId: this.userId,
      role: this.role,
      micEnabled: this._micEnabled,
      cameraEnabled: this._cameraEnabled,
    });
  }

  private _sendWS(message: object) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      // Always tag with userId so the receiver can filter self-echoes.
      this.ws.send(JSON.stringify({
        userId: this.userId,
        sessionCode: this.sessionCode,
        ...message,
      }));
    } else {
      console.warn('[WS] Tried to send but socket not open:', message);
    }
  }

  private _connectWebSocket() {
    if (!this.sessionCode) return;
    this.ws = new WebSocket(`${WEBSOCKET_URL}?sessionCode=${this.sessionCode}`);

    this.ws.onopen = async () => {
      log('WS', 'connected');
      this._wsReconnectAttempts = 0;
      // _buildPeerConnection is now async: it awaits initial replaceTrack so
      // the first generated SDP truly reflects the bound audio sender.
      // Otherwise the offer could be generated while the operations queue
      // is still mid-swap and the m=audio section ends up without a usable
      // msid binding — the canonical "audio dead until renegotiation" bug.
      await this._buildPeerConnection();
      this._sendWS({
        type: 'join_session',
        sessionCode: this.sessionCode,
        userId: this.userId,
        role: this.role,
      });
      this._broadcastMediaState();
    };

    this.ws.onmessage = (event) => {
      let msg: any;
      try {
        msg = JSON.parse(event.data);
      } catch (err) {
        console.error('[WS] Message parse error:', err);
        return;
      }
      log('WS', '←', msg.type);
      // Strictly serialize message handling. Otherwise ICE candidates that
      // arrive while an offer is still inside `await setRemoteDescription`
      // hit a null remoteDescription, throw InvalidStateError, and are
      // silently dropped — starving the connection of half its candidate
      // pairs and leaving audio with no media path.
      this._signalingChain = this._signalingChain
        .then(() => this._handleWSMessage(msg))
        .catch(err => { console.error('[WS] Handler error for', msg.type, err); });
    };

    this.ws.onerror = (err) => { console.error('[WS] Error:', err); };

    this.ws.onclose = (event) => {
      log('WS', 'closed code=', event.code);
      if (!this._intentionalClose) this._scheduleReconnect();
    };
  }

  private _scheduleReconnect() {
    if (this._wsReconnectAttempts >= this._maxReconnectAttempts) {
      console.error('[WS] Max reconnect attempts reached.');
      return;
    }
    const delay = Math.min(1000 * 2 ** this._wsReconnectAttempts, 16000);
    log('WS', `reconnect in ${delay}ms (attempt ${this._wsReconnectAttempts + 1})`);
    this._wsReconnectAttempts++;
    this._reconnectTimer = setTimeout(() => this._connectWebSocket(), delay);
  }

  private _markPeerReady() {
    if (this._peerReady) return;
    this._peerReady = true;
    this._onPeerReady?.();
  }

  // ── Private: peer connection ─────────────────────────────────────────────

  private async _buildPeerConnection() {
    if (this.pc) this.pc.close();

    this._pendingCandidates = [];
    this.makingOffer = false;
    this.ignoreOffer = false;
    this.isSettingRemoteAnswerPending = false;
    this._audioTransceiver = null;
    this._videoTransceiver = null;

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    this.pc = pc;

    // Always create both transceivers up-front in sendrecv. This guarantees
    // the wire has m=audio and m=video lines from the first offer onward so
    // either side can populate them by replaceTrack later. Critically,
    // **audio comes first** so its m-line index is 0 — Chrome occasionally
    // misbehaves when an audio-only sender is appended at index 1 after a
    // disabled video index 0.
    this._audioTransceiver = pc.addTransceiver('audio', { direction: 'sendrecv' });
    this._videoTransceiver = pc.addTransceiver('video', { direction: 'sendrecv' });

    // Bind whatever live local tracks we already have. We AWAIT replaceTrack
    // here so that by the time _maybeOffer runs setLocalDescription() the
    // sender state is fully settled and the generated SDP carries the
    // correct SSRC + msid for the audio track. The old fire-and-forget
    // version made the first audio-only offer non-deterministic.
    const audioTrack = this._getLiveLocalTrack('audio');
    if (audioTrack) {
      try {
        await this._audioTransceiver.sender.replaceTrack(audioTrack);
        // Anchor the sender to our stable stream id so the remote ontrack
        // sees a consistent MediaStream and audio routes correctly.
        if (typeof this._audioTransceiver.sender.setStreams === 'function' && this.localStream) {
          this._audioTransceiver.sender.setStreams(this.localStream);
        }
      } catch (err) {
        console.warn('[PC] initial audio replaceTrack failed:', err);
      }
    }
    const videoTrack = this._getLiveLocalTrack('video');
    if (videoTrack) {
      try {
        await this._videoTransceiver.sender.replaceTrack(videoTrack);
        if (typeof this._videoTransceiver.sender.setStreams === 'function' && this.localStream) {
          this._videoTransceiver.sender.setStreams(this.localStream);
        }
      } catch (err) {
        console.warn('[PC] initial video replaceTrack failed:', err);
      }
    }

    log('PC', 'built', {
      role: this.role,
      polite: this.polite,
      audioTrack: audioTrack?.id ?? null,
      videoTrack: videoTrack?.id ?? null,
      audioSenderHasTrack: !!this._audioTransceiver.sender.track,
      videoSenderHasTrack: !!this._videoTransceiver.sender.track,
    });

    pc.onicecandidate = ({ candidate }) => {
      if (!candidate) return;
      this._sendWS({ type: 'webrtc_ice_candidate', candidate });
    };

    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      log('ICE', 'state=', state);
      this._onConnectionStateChanged?.(state);
      if (state === 'failed') {
        log('ICE', 'restartIce()');
        try { pc.restartIce(); } catch (err) { console.warn('[ICE] restartIce failed:', err); }
      }
    };

    pc.onsignalingstatechange = () => {
      log('PC', 'signaling state=', pc.signalingState);
    };

    pc.onconnectionstatechange = () => {
      log('PC', 'connection state=', pc.connectionState);
    };

    // Perfect Negotiation: the canonical onnegotiationneeded handler.
    // Fires whenever the PC needs a fresh SDP exchange (track added/removed,
    // transceiver direction changed, etc.).
    pc.onnegotiationneeded = async () => {
      if (!this._peerReady) {
        // No peer to negotiate with yet; the offerer side will fire this
        // again automatically once we have peer presence and the PC state
        // demands renegotiation. We also force it after _markPeerReady.
        log('PN', 'negotiationneeded but peer not ready yet, deferring');
        return;
      }
      try {
        this.makingOffer = true;
        await pc.setLocalDescription();
        if (!this.pc) return;
        this._sendWS({ type: 'webrtc_offer', sdp: pc.localDescription });
      } catch (err) {
        console.error('[PN] onnegotiationneeded error:', err);
      } finally {
        this.makingOffer = false;
      }
    };

    pc.ontrack = ({ track }) => {
      log('PC', 'ontrack', track.kind, track.id, 'muted=', track.muted);
      if (!this.remoteStream) this.remoteStream = new MediaStream();
      if (!this.remoteStream.getTracks().some(t => t.id === track.id)) {
        this.remoteStream.addTrack(track);
      }
      this.remoteStream = new MediaStream(this.remoteStream.getTracks());
      this._onRemoteStreamChanged?.(this.remoteStream);

      track.onunmute = () => {
        log('PC', 'track unmuted', track.kind, track.id);
        if (this.remoteStream?.getTracks().some(t => t.id === track.id)) {
          this.remoteStream = new MediaStream(this.remoteStream.getTracks());
          this._onRemoteStreamChanged?.(this.remoteStream);
        }
      };
      track.onended = () => {
        log('PC', 'track ended', track.kind, track.id);
        if (this.remoteStream) {
          this.remoteStream.removeTrack(track);
          this.remoteStream = new MediaStream(this.remoteStream.getTracks());
          this._onRemoteStreamChanged?.(this.remoteStream);
        }
      };
    };
  }

  // ── Private: WS message dispatch ─────────────────────────────────────────

  private async _handleWSMessage(msg: any) {
    // Self-echo filter — never process our own signaling messages even if
    // the server reflects them back.
    if (msg.userId && msg.userId === this.userId && SIGNALING_TYPES.has(msg.type)) {
      return;
    }

    // Any peer-originated signal is proof the remote is in the session.
    const peerProofs = [
      'webrtc_offer',
      'webrtc_answer',
      'webrtc_ice_candidate',
      'renegotiation_request',
      'media_state_updated',
      'chat_message',
      'chat_history',
      'peer_joined',
      'session_ready',
    ];
    if (peerProofs.includes(msg.type) && !this._peerReady) {
      this._markPeerReady();
      // Newly known peer → kick off negotiation if the PC has anything to
      // offer. setLocalDescription() will be a no-op if nothing has
      // changed since the last negotiation.
      void this._maybeOffer('peer_discovered');
    }

    switch (msg.type) {
      case 'session_ready':
      case 'peer_joined': {
        this._markPeerReady();
        void this._maybeOffer(msg.type);
        break;
      }

      case 'webrtc_offer':
      case 'webrtc_answer': {
        await this._handleRemoteDescription(msg.sdp);
        break;
      }

      case 'webrtc_ice_candidate': {
        if (!msg.candidate || !this.pc) break;
        // If the remote description hasn't been applied yet, queue the
        // candidate. addIceCandidate would otherwise throw and the
        // candidate would be lost forever — and ICE candidate loss is the
        // exact failure mode that produces "audio dies until something
        // triggers renegotiation," because re-offer prompts the remote
        // peer to ship its candidates again.
        if (!this.pc.remoteDescription || !this.pc.remoteDescription.type) {
          this._pendingCandidates.push(msg.candidate);
          log('ICE', 'buffered candidate (no remoteDescription yet)', { queued: this._pendingCandidates.length });
          break;
        }
        try {
          await this.pc.addIceCandidate(msg.candidate);
        } catch (err) {
          if (!this.ignoreOffer) {
            console.error('[ICE] addIceCandidate error:', err);
          }
        }
        break;
      }

      case 'renegotiation_request': {
        // Legacy from older clients — Perfect Negotiation no longer needs
        // this. Force a fresh offer just to be safe (will be a no-op SDP if
        // nothing actually changed).
        void this._maybeOffer('renegotiation_request');
        break;
      }

      case 'chat_message': {
        this.messages = [...this.messages, msg];
        this._onMessagesChanged?.(this.messages);
        break;
      }

      case 'chat_history': {
        this.messages = [...(msg.messages || [])];
        this._onMessagesChanged?.(this.messages);
        break;
      }

      case 'media_state_updated': {
        // Already filtered above for self-echo by userId, but defensive.
        if (msg.userId && msg.userId === this.userId) break;
        const state = {
          micEnabled: !!msg.micEnabled,
          cameraEnabled: !!msg.cameraEnabled,
        };
        this._lastRemoteMediaState = state;
        this._onRemoteMediaStateChanged?.(state);
        break;
      }

      case 'peer_left':
      case 'peer_disconnected': {
        log('WS', 'peer left/disconnected');
        this.remoteStream?.getTracks().forEach(t => t.stop());
        this.remoteStream = null;
        this._peerReady = false;
        this._pendingCandidates = [];
        this._lastRemoteMediaState = null;
        this._onRemoteStreamChanged?.(null);
        this.onPeerDisconnect?.();
        // Rebuild PC so the next session_ready / peer_joined produces a
        // clean offer/answer (including any local tracks we still hold).
        // Awaited so that subsequent signaling chain entries see a fully
        // initialized PC (transceivers + bound tracks).
        await this._buildPeerConnection();
        break;
      }

      case 'session_ended': {
        this.hangup(true);
        this.emitRemoteSessionChanged();
        break;
      }

      default:
        // ignore unknown
        break;
    }
  }

  /**
   * Perfect Negotiation: handle a remote description (offer or answer).
   * - On glare with an offer (we're already making one), impolite side
   *   ignores it; polite side rolls back via setRemoteDescription which
   *   handles rollback implicitly when readyForOffer is true.
   * - On an answer, just apply it.
   */
  private async _handleRemoteDescription(sdp: RTCSessionDescriptionInit) {
    const pc = this.pc;
    if (!pc) return;

    try {
      const readyForOffer = !this.makingOffer && (pc.signalingState === 'stable' || this.isSettingRemoteAnswerPending);
      const offerCollision = sdp.type === 'offer' && !readyForOffer;

      this.ignoreOffer = !this.polite && offerCollision;
      if (this.ignoreOffer) {
        log('PN', 'ignoring colliding offer (impolite)');
        return;
      }

      log('SDP', `remote ${sdp.type}`, summarizeSdp(sdp.sdp));
      this.isSettingRemoteAnswerPending = sdp.type === 'answer';
      // For the polite peer on an offer collision, setRemoteDescription
      // performs an implicit rollback of our in-flight local offer.
      await pc.setRemoteDescription(sdp);
      this.isSettingRemoteAnswerPending = false;

      // Drain any ICE that arrived before the remote description.
      if (this._pendingCandidates.length) {
        log('ICE', `draining ${this._pendingCandidates.length} buffered candidates`);
        const buffered = this._pendingCandidates;
        this._pendingCandidates = [];
        for (const c of buffered) {
          try { await pc.addIceCandidate(c); }
          catch (err) { console.warn('[ICE] drain addIceCandidate failed:', err); }
        }
      }

      if (sdp.type === 'offer') {
        await pc.setLocalDescription();
        if (!this.pc) return;
        this._sendWS({ type: 'webrtc_answer', sdp: pc.localDescription });
        // The other side now knows our current media state; re-broadcast
        // so any UI listening for media_state stays consistent post-renegotiation.
        this._broadcastMediaState();
      }
    } catch (err) {
      console.error('[PN] handleRemoteDescription error:', err);
    }
  }

  /**
   * Idempotently nudge the PC to renegotiate if it has pending changes.
   * setLocalDescription() with no argument is the safe Perfect-Negotiation
   * way to "offer if needed". Calling it when the PC is already stable
   * with no pending changes just rewrites the same local description.
   */
  private async _maybeOffer(reason: string) {
    const pc = this.pc;
    if (!pc) return;
    if (!this._peerReady) return;
    if (this.makingOffer) return;
    if (pc.signalingState !== 'stable') return;
    try {
      this.makingOffer = true;
      log('PN', 'offering', { reason, streamId: this._localStreamId });
      await pc.setLocalDescription();
      if (!this.pc) return;
      log('SDP', 'local offer', summarizeSdp(pc.localDescription?.sdp));
      log('TRANSCEIVER', 'snapshot', pc.getTransceivers().map(tx => ({
        mid: tx.mid,
        kind: tx.receiver?.track?.kind ?? tx.sender?.track?.kind ?? null,
        direction: tx.direction,
        currentDirection: tx.currentDirection,
        senderTrack: tx.sender.track?.id ?? null,
      })));
      this._sendWS({ type: 'webrtc_offer', sdp: pc.localDescription });
    } catch (err) {
      console.error('[PN] _maybeOffer error:', err);
    } finally {
      this.makingOffer = false;
    }
  }
}

// Singleton — shared across all screens
export const webRTCManager = new WebRTCManager();
