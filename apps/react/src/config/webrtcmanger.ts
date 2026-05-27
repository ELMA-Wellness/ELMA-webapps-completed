const WEBSOCKET_URL = 'wss://elma-dsb6fne7c0bqezaj.centralindia-01.azurewebsites.net/';
const ICE_SERVERS = [
  {
    urls: "stun:stun.relay.metered.ca:80",
  },
  {
    urls: "turn:global.relay.metered.ca:80",
    username: "cdc87cccc674b5cd95ddde9c",
    credential: "WnyJEhKDRKzCjJ7t",
  },
  {
    urls: "turn:global.relay.metered.ca:80?transport=tcp",
    username: "cdc87cccc674b5cd95ddde9c",
    credential: "WnyJEhKDRKzCjJ7t",
  },
  {
    urls: "turn:global.relay.metered.ca:443",
    username: "cdc87cccc674b5cd95ddde9c",
    credential: "WnyJEhKDRKzCjJ7t",
  },
  {
    urls: "turns:global.relay.metered.ca:443?transport=tcp",
    username: "cdc87cccc674b5cd95ddde9c",
    credential: "WnyJEhKDRKzCjJ7t",
  },
];
type Role = 'patient' | 'therapist';
type StreamCallback = (stream: MediaStream | null) => void;
type MessagesCallback = (messages: any[]) => void;
type MediaStateCallback = (state: { micEnabled: boolean, cameraEnabled: boolean }) => void;
type LocalMediaKind = 'audio' | 'video';

function normalizeRole(role: unknown): Role {
  const value = String(role ?? '').trim().toLowerCase();
  if (['therapist', 'expert', 'psych', 'psychologist', 'doctor', 'provider', 'counsellor', 'counselor', 'professional'].includes(value)) {
    return 'therapist';
  }
  return 'patient';
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
  private _micEnabled = false;
  private _cameraEnabled = false;
  private _audioTransceiver: RTCRtpTransceiver | null = null;
  private _videoTransceiver: RTCRtpTransceiver | null = null;

  // ─── ICE candidate queue (buffer until remoteDescription is set) ──────────
  private _pendingCandidates: RTCIceCandidate[] = [];
  private _remoteDescSet = false;

  // ─── Reconnection state ───────────────────────────────────────────────────
  private _wsReconnectAttempts = 0;
  private _maxReconnectAttempts = 5;
  private _reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private _intentionalClose = false;

  // ─── Offer/answer state (avoid glare + renegotiate cleanly) ───────────────
  private _isMakingOffer = false;
  private _awaitingAnswer = false;
  private _peerReady = false;
  private _onPeerReady: (() => void) | null = null;

  // ─── Callbacks with replay-on-assign pattern ──────────────────────────────
  // When a listener is assigned, it is immediately called with the current
  // value so components that register late never miss an update.


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
    if (cb) cb(this.remoteStream); // replay current value
  }

  private _onLocalStreamChanged: StreamCallback | null = null;
  get onLocalStreamChanged() { return this._onLocalStreamChanged; }
  set onLocalStreamChanged(cb: StreamCallback | null) {
    this._onLocalStreamChanged = cb;
    if (cb) cb(this.localStream); // replay current value
  }

  private _onMessagesChanged: MessagesCallback | null = null;
  get onMessagesChanged() { return this._onMessagesChanged; }
  set onMessagesChanged(cb: MessagesCallback | null) {
    this._onMessagesChanged = cb;
    if (cb) cb(this.messages); // replay current value
  }

  private _onRemoteMediaStateChanged: MediaStateCallback | null = null;
  get onRemoteMediaStateChanged() { return this._onRemoteMediaStateChanged; }
  set onRemoteMediaStateChanged(cb: MediaStateCallback | null) {
    this._onRemoteMediaStateChanged = cb;
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

  // Fires when remote peer leaves/disconnects. (Used by live screens to show UI)
  onPeerDisconnect: (() => void) | null = null;

  // ─── Public API ───────────────────────────────────────────────────────────

  get peerConnection() {
    return this.pc;
  }

  async initialize(
    sessionCode: string = '69a54abd29c99c56303ea5f6',
    userId: string = '696f408b2ff51b82b1cee0e6',
    role: Role = 'patient',
    micEnabled = false,
    cameraEnabled = false,
    initialStream: MediaStream | null = null
  ): Promise<void> {
    // Prevent double-initialization
    if (this.pc || this.ws) {
      console.warn('[WebRTC] Already initialized. Call hangup() first.');
      return;
    }

    this._intentionalClose = false;
    this.sessionCode = sessionCode;
    this.userId = userId;
    this.role = normalizeRole(role);
    this._micEnabled = micEnabled;
    this._cameraEnabled = cameraEnabled;
    this.localStream = new MediaStream();
    this._adoptInitialTracks(initialStream, micEnabled, cameraEnabled);

    try {
      if (micEnabled && !this._getLiveLocalTrack('audio')) {
        await this._enableLocalKind('audio');
      }
      if (cameraEnabled && !this._getLiveLocalTrack('video')) {
        await this._enableLocalKind('video');
      }
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
    this._onLocalStreamChanged?.(this.localStream);
    this._broadcastMediaState();
  }

  sendChatMessage(text: string) {
    this._sendWS({ type: 'chat_message', text });
  }

  /** Call this to end the session from the local side. */
  hangup(navigate = false, cb = () => { }) {
    this._intentionalClose = true;

    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer);
      this._reconnectTimer = null;
    }

    // Tell server explicitly (so the other peer gets peer_left/session_ended reliably)
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
    this._remoteDescSet = false;
    this._wsReconnectAttempts = 0;
    this._isMakingOffer = false;
    this._awaitingAnswer = false;
    this._peerReady = false;
    this._micEnabled = false;
    this._cameraEnabled = false;
    this._audioTransceiver = null;
    this._videoTransceiver = null;
    this._onPeerReady = null;

    // Notify listeners of null streams
    this._onLocalStreamChanged?.(null);
    this._onRemoteStreamChanged?.(null);
    this._onMessagesChanged?.([]);

    // Clear listeners
    this._onRemoteStreamChanged = null;
    this._onLocalStreamChanged = null;
    this._onMessagesChanged = null;
    this._onConnectionStateChanged = null;
    this.onPeerDisconnect = null;
    cb()

    if (navigate) {
      if (this.role === 'patient') {

        // router.replace('/experts/sessionend');
      }
      else {
        // router.replace('/experts/drsessionend')
      }
    }
  }

  // ─── Private: WebSocket ───────────────────────────────────────────────────

  private _isSessionActive() {
    return Boolean(this.pc || this.ws || this.sessionCode);
  }

  private _ensureLocalStream() {
    if (!this.localStream) {
      this.localStream = new MediaStream();
    }
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

  private async _enableLocalKind(kind: LocalMediaKind) {
    const existingTrack = this._getLiveLocalTrack(kind);
    if (existingTrack) {
      existingTrack.enabled = true;
      await this._replaceSenderTrack(kind, existingTrack);
      return;
    }

    const mediaStream = kind === 'audio'
      ? await navigator.mediaDevices.getUserMedia({ audio: true })
      : await this._getCameraStreamWithFallback();

    const track = kind === 'audio'
      ? mediaStream.getAudioTracks()[0]
      : mediaStream.getVideoTracks()[0];

    if (!track) {
      mediaStream.getTracks().forEach(t => t.stop());
      throw new Error(`No ${kind} track was returned by getUserMedia.`);
    }

    this._removeLocalTracks(kind, true);
    track.enabled = true;
    this._ensureLocalStream().addTrack(track);
    mediaStream.getTracks().forEach(t => {
      if (t !== track) t.stop();
    });
    await this._replaceSenderTrack(kind, track);
  }

  private async _disableLocalKind(kind: LocalMediaKind) {
    await this._replaceSenderTrack(kind, null);
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

  private _getLocalTransceiver(kind: LocalMediaKind) {
    return kind === 'audio' ? this._audioTransceiver : this._videoTransceiver;
  }

  private _setLocalTransceiver(kind: LocalMediaKind, transceiver: RTCRtpTransceiver) {
    if (kind === 'audio') {
      this._audioTransceiver = transceiver;
    } else {
      this._videoTransceiver = transceiver;
    }
  }

  private _findTransceiverForKind(kind: LocalMediaKind) {
    return this.pc?.getTransceivers().find(transceiver => {
      const senderTrack = transceiver.sender.track;
      const receiverTrack = transceiver.receiver.track;
      return senderTrack?.kind === kind || receiverTrack?.kind === kind;
    }) ?? null;
  }

  private _createLocalTransceiver(kind: LocalMediaKind, track: MediaStreamTrack | null) {
    if (!this.pc) return null;

    if (track && this.localStream) {
      const sender = this.pc.addTrack(track, this.localStream);
      const transceiver = this.pc.getTransceivers().find(t => t.sender === sender) ?? null;
      if (transceiver) {
        transceiver.direction = 'sendrecv';
        this._setLocalTransceiver(kind, transceiver);
      }
      return transceiver;
    }

    const transceiver = this.pc.addTransceiver(kind, { direction: 'sendrecv' });
    this._setLocalTransceiver(kind, transceiver);
    return transceiver;
  }

  private async _syncLocalTracksToTransceivers() {
    if (!this.pc) return;

    for (const kind of ['audio', 'video'] as LocalMediaKind[]) {
      const track = this._getLiveLocalTrack(kind);
      const transceiver =
        this._getLocalTransceiver(kind) ??
        this._findTransceiverForKind(kind) ??
        this._createLocalTransceiver(kind, null);

      if (!transceiver) continue;

      transceiver.direction = 'sendrecv';
      this._setLocalTransceiver(kind, transceiver);

      if (track && transceiver.sender.track !== track) {
        await transceiver.sender.replaceTrack(track);
      }
    }
  }

  private async _replaceSenderTrack(kind: LocalMediaKind, track: MediaStreamTrack | null) {
    if (!this.pc) return;

    const transceiver =
      this._getLocalTransceiver(kind) ??
      this._findTransceiverForKind(kind) ??
      this._createLocalTransceiver(kind, track);
    if (!transceiver) return;

    transceiver.direction = 'sendrecv';
    this._setLocalTransceiver(kind, transceiver);
    await transceiver.sender.replaceTrack(track);
  }

  private _broadcastMediaState() {
    if (this.ws?.readyState !== WebSocket.OPEN) return;

    this._sendWS({
      type: 'media_state_updated',
      micEnabled: this._micEnabled,
      cameraEnabled: this._cameraEnabled,
    });
  }

  private _connectWebSocket() {
    if (!this.sessionCode) return;

    this.ws = new WebSocket(`${WEBSOCKET_URL}?sessionCode=${this.sessionCode}`);

    this.ws.onopen = () => {
      console.log('[WS] Connected');
      this._wsReconnectAttempts = 0;
      // Build peer connection once WS is open
      this._buildPeerConnection();
      this._sendWS({
        type: 'join_session',
        sessionCode: this.sessionCode,
        userId: this.userId,
        role: this.role,
      });
      this._broadcastMediaState();
    };

    this.ws.onmessage = async (event) => {
      try {
        const msg = JSON.parse(event.data);
        console.log('[WS] ←', msg.type);
        await this._handleWSMessage(msg);
      } catch (err) {
        console.error('[WS] Message parse error:', err);
      }
    };

    this.ws.onerror = (err) => {
      console.error('[WS] Error:', err);
    };

    this.ws.onclose = (event) => {
      console.log('[WS] Closed. Code:', event.code);
      if (!this._intentionalClose) {
        this._scheduleReconnect();
      }
    };
  }

  private _scheduleReconnect() {
    if (this._wsReconnectAttempts >= this._maxReconnectAttempts) {
      console.error('[WS] Max reconnect attempts reached.');
      return;
    }
    const delay = Math.min(1000 * 2 ** this._wsReconnectAttempts, 16000);
    console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this._wsReconnectAttempts + 1})`);
    this._wsReconnectAttempts++;
    this._reconnectTimer = setTimeout(() => {
      this._connectWebSocket();
    }, delay);
  }

  private _sendWS(message: object) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ ...message, sessionCode: this.sessionCode }));
    } else {
      console.warn('[WS] Tried to send but socket not open:', message);
    }
  }

  private _markPeerReady() {
    if (this._peerReady) return;
    this._peerReady = true;
    this._onPeerReady?.();
  }

  sendMessage(message: object) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ ...message, sessionCode: this.sessionCode }));
    } else {
      console.warn('[WS] Tried to send but socket not open:', message);
    }
  }

  // ─── Private: PeerConnection ──────────────────────────────────────────────

  private _buildPeerConnection() {
    if (this.pc) {
      this.pc.close();
    }

    this._remoteDescSet = false;
    this._pendingCandidates = [];
    this._isMakingOffer = false;
    this._awaitingAnswer = false;
    this._audioTransceiver = null;
    this._videoTransceiver = null;

    // Use a simple, widely compatible config: only iceServers.
    this.pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    const audioTrack = this._getLiveLocalTrack('audio');
    const videoTrack = this._getLiveLocalTrack('video');
    console.log('[PC] Local media state:', {
      micEnabled: this._micEnabled,
      cameraEnabled: this._cameraEnabled,
      audioTrack: audioTrack?.id ?? null,
      videoTrack: videoTrack?.id ?? null,
    });
    this._createLocalTransceiver('audio', audioTrack);
    this._createLocalTransceiver('video', videoTrack);

    // ICE candidate → send to remote
    this.pc.onicecandidate = (event) => {
      if (event.candidate && this.ws?.readyState === WebSocket.OPEN) {
        console.log("REMOTE ICE", event.candidate);
        this._sendWS({ type: 'webrtc_ice_candidate', candidate: event.candidate });
      }
    };

    // Renegotiation hook (therapist is the only offerer)
    this.pc.onnegotiationneeded = async () => {
      if (this.role !== 'therapist') return;
      if (!this.pc) return;
      if (!this._peerReady) return;
      if (this.pc.signalingState !== 'stable') return;
      await this._safeCreateAndSendOffer('negotiationneeded');
    };

    // ICE connection state
    this.pc.oniceconnectionstatechange = () => {
      const state = this.pc?.iceConnectionState;
      console.log('[ICE] Connection state:', state);
      this._onConnectionStateChanged?.(state ?? 'unknown');

      if (state === 'failed') {
        console.warn('[ICE] Failed — attempting ICE restart');
        this.pc?.restartIce?.();
      }
    };

    // Signaling state
    this.pc.onsignalingstatechange = () => {
      console.log('[PC] Signaling state:', this.pc?.signalingState);
    };

    // Remote track received. We always build our own MediaStream and snapshot
    // it to a NEW object on every ontrack event. This guarantees React sees a
    // reference change even when audio and video tracks arrive sequentially
    // from the same remote stream (event.streams[0] would be the same object
    // both times, causing React to bail out and never re-attach srcObject).
    this.pc.ontrack = (event) => {
      const track = event.track;
      console.log('[PC] Remote track (ontrack):', track.kind, track.id, 'muted:', track.muted);

      if (!this.remoteStream) {
        this.remoteStream = new MediaStream();
      }

      if (!this.remoteStream.getTracks().some(t => t.id === track.id)) {
        this.remoteStream.addTrack(track);
      }

      // Snapshot to a new MediaStream so React always sees a changed reference
      // and re-runs the srcObject attachment effect in the UI layer.
      this.remoteStream = new MediaStream(this.remoteStream.getTracks());
      this._onRemoteStreamChanged?.(this.remoteStream);

      // Browsers often deliver tracks in a muted (no-data) state initially.
      // Re-fire when the track first produces data so the UI re-attaches if needed.
      track.onunmute = () => {
        console.log('[PC] Track unmuted:', track.kind, track.id);
        if (this.remoteStream?.getTracks().some(t => t.id === track.id)) {
          this.remoteStream = new MediaStream(this.remoteStream.getTracks());
          this._onRemoteStreamChanged?.(this.remoteStream);
        }
      };

      // Remove ended tracks from our stream snapshot.
      track.onended = () => {
        console.log('[PC] Track ended:', track.kind, track.id);
        if (this.remoteStream) {
          this.remoteStream.removeTrack(track);
          this.remoteStream = new MediaStream(this.remoteStream.getTracks());
          this._onRemoteStreamChanged?.(this.remoteStream);
        }
      };
    };
  }

  // ─── Private: Signaling message handler ───────────────────────────────────

  private async _handleWSMessage(msg: any) {
    switch (msg.type) {

      case 'session_ready': {
        this._markPeerReady();
        // Therapist is the offerer
        if (this.role === 'therapist') {
          await this._safeCreateAndSendOffer('session_ready');
        }
        break;
      }

      case 'webrtc_offer': {
        this._markPeerReady();
        // Patient handles the offer
        if (this.role === 'patient') {
          await this._handleRemoteOffer(msg);
        }
        break;
      }

      case 'webrtc_answer': {
        // Therapist handles the answer
        if (this.role === 'therapist' && this.pc) {
          try {
            if (this.pc.signalingState === 'have-local-offer') {
              await this.pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
              this._remoteDescSet = true;
              this._awaitingAnswer = false;
              await this._drainCandidateQueue();
            } else {
              console.warn('[Signaling] Ignoring answer in state:', this.pc.signalingState);
            }
          } catch (err) {
            console.error('[Signaling] setRemoteDescription (answer) error:', err);
          }
        }
        break;
      }

      case 'webrtc_ice_candidate': {
        if (!msg.candidate) break;
        const candidate = new RTCIceCandidate(msg.candidate);
        if (this._remoteDescSet && this.pc) {
          try {
            await this.pc.addIceCandidate(candidate);
          } catch (err) {
            console.error('[ICE] addIceCandidate error:', err);
          }
        } else {
          // Buffer until remote description is set
          console.log('[ICE] Buffering candidate (no remoteDesc yet)');
          this._pendingCandidates.push(candidate);
        }
        break;
      }

      case 'chat_message': {
        this.messages = [...this.messages, msg];
        this._onMessagesChanged?.(this.messages);
        break;
      }

      case 'chat_history': {
        this.messages = [...msg.messages];
        this._onMessagesChanged?.(this.messages);
        break;
      }

      case 'media_state_updated': {
        if (msg.userId && msg.userId === this.userId) break;
        console.log("case falling")
        this._onRemoteMediaStateChanged?.({
          micEnabled: msg.micEnabled,
          cameraEnabled: msg.cameraEnabled
        });
        break;
      }

      case 'peer_left':
      case 'peer_disconnected': {
        // Remote peer is gone (temporary). Keep local media alive and wait for rejoin.
        console.log('[WS] Peer disconnected/left');

        this.remoteStream?.getTracks().forEach(t => t.stop());
        this.remoteStream = null;
        this._peerReady = false;
        this._onRemoteStreamChanged?.(null);
        this.onPeerDisconnect?.();

        // Reset PC so next session_ready triggers a clean offer/answer.
        // (Safer than trying to keep old transceivers around across reconnects)
        this._buildPeerConnection();
        break;
      }

      case 'peer-unavailable': {


        break;
      }

      case 'peer_joined': {
        this._markPeerReady();
        if (this.role === 'therapist') {
          await this._safeCreateAndSendOffer('peer_joined');
        }
        break;
      }

      case 'session_ended': {


        this.hangup(true);
        this.emitRemoteSessionChanged();
        break;
      }

      default:
        console.log('[WS] Unhandled message type:', msg);
    }
  }

  private async _safeCreateAndSendOffer(reason: string) {
    if (!this.pc) return;
    if (this.role !== 'therapist') return;
    if (this._isMakingOffer) return;
    if (this.pc.signalingState !== 'stable') return;


    this._isMakingOffer = true;
    try {
      const offer = await this.pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await this.pc.setLocalDescription(offer);
      this._awaitingAnswer = true;
      this._sendWS({ type: 'webrtc_offer', sdp: this.pc.localDescription });
    } catch (err) {
      console.error('[Signaling] createOffer error:', reason, err);
    } finally {
      this._isMakingOffer = false;
    }
  }

  private async _handleRemoteOffer(msg: any) {
    if (!this.pc) return;
    try {
      // If we ever get an offer while not stable, reset to avoid "glare" issues.
      if (this.pc.signalingState !== 'stable') {
        console.warn('[Signaling] Offer received while not stable; resetting PC.');
        this._buildPeerConnection();
      }
      if (!this.pc) return;

      await this.pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
      this._remoteDescSet = true;
      await this._drainCandidateQueue();
      await this._syncLocalTracksToTransceivers();

      const answer = await this.pc.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await this.pc.setLocalDescription(answer);
      this._sendWS({ type: 'webrtc_answer', sdp: this.pc.localDescription });
    } catch (err) {
      console.error('[Signaling] setRemoteDescription (offer) error:', err);
    }
  }

  // Drain buffered ICE candidates after remote description is set
  private async _drainCandidateQueue() {
    if (!this.pc || this._pendingCandidates.length === 0) return;
    console.log(`[ICE] Draining ${this._pendingCandidates.length} buffered candidates`);
    for (const candidate of this._pendingCandidates) {
      try {
        await this.pc.addIceCandidate(candidate);
      } catch (err) {
        console.error('[ICE] Drain addIceCandidate error:', err);
      }
    }
    this._pendingCandidates = [];
  }
}

// Singleton — shared across all screens
export const webRTCManager = new WebRTCManager();
