const WEBSOCKET_URL = 'wss://elma-wellness.onrender.com'; // Replace with your WebSocket server URL
const ICE_SERVERS = [
  {
        urls: "stun:stun.relay.metered.ca:80",
      },
      {
        urls: "turn:global.relay.metered.ca:80",
        username: "84190094f65f8a6f5db0b231",
        credential: "Cb5GBx3J1vw8vtEp",
      },
      {
        urls: "turn:global.relay.metered.ca:80?transport=tcp",
        username: "84190094f65f8a6f5db0b231",
        credential: "Cb5GBx3J1vw8vtEp",
      },
      {
        urls: "turn:global.relay.metered.ca:443",
        username: "84190094f65f8a6f5db0b231",
        credential: "Cb5GBx3J1vw8vtEp",
      },
      {
        urls: "turns:global.relay.metered.ca:443?transport=tcp",
        username: "84190094f65f8a6f5db0b231",
        credential: "Cb5GBx3J1vw8vtEp",
      },
];
type Role = 'patient' | 'therapist';
type StreamCallback = (stream: MediaStream | null) => void;
type MessagesCallback = (messages: any[]) => void;

class WebRTCManager {
  pc: RTCPeerConnection | null = null;
  ws: WebSocket | null = null;
  localStream: MediaStream | null = null;
  remoteStream: MediaStream | null = null;
  sessionCode: string | null = null;
  userId: string | null = null;
  role: Role = 'patient';
  messages: any[] = [];

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

  // ─── Callbacks with replay-on-assign pattern ──────────────────────────────
  // When a listener is assigned, it is immediately called with the current
  // value so components that register late never miss an update.

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

  private _onConnectionStateChanged: ((state: string) => void) | null = null;
  get onConnectionStateChanged() { return this._onConnectionStateChanged; }
  set onConnectionStateChanged(cb: ((state: string) => void) | null) {
    this._onConnectionStateChanged = cb;
  }

  // Fires when remote peer leaves/disconnects. (Used by live screens to show UI)
  onPeerDisconnect: (() => void) | null = null;

  // ─── Public API ───────────────────────────────────────────────────────────

  async initialize(sessionCode: string='69a54abd29c99c56303ea5f6', userId: string='696f408b2ff51b82b1cee0e6', role: Role='patient'): Promise<void> {
    // Prevent double-initialization
    if (this.localStream) {
      console.warn('[WebRTC] Already initialized. Call hangup() first.');
      return;
    }

    this._intentionalClose = false;
    this.sessionCode = sessionCode;
    this.userId = userId;
    this.role = role;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { width: 640, height: 480, frameRate: 30 },
      });
      this.localStream = stream;
      this._onLocalStreamChanged?.(stream);
    } catch (err) {
      console.error('[WebRTC] getUserMedia failed:', err);
      throw err;
    }

    this._connectWebSocket();
  }

  toggleMute(isMuted: boolean) {
    this.localStream?.getAudioTracks().forEach(t => { t.enabled = !isMuted; });
  }

  toggleCamera(isOff: boolean) {
    this.localStream?.getVideoTracks().forEach(t => { t.enabled = !isOff; });
  }

  sendChatMessage(text: string) {
    this._sendWS({ type: 'chat_message', text });
  }

  /** Call this to end the session from the local side. */
  hangup(navigate = false) {
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

    if (navigate) {
      if(this.role==='patient'){
     // router.replace('/experts/sessionend');
      }
      else{
       // router.replace('/experts/drsessionend')
      }
    }
  }

  // ─── Private: WebSocket ───────────────────────────────────────────────────

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

    // Use a simple, widely compatible config: only iceServers.
    this.pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    // Attach local media using modern addTrack API (supported by react-native-webrtc).
    if (this.localStream) {
      const tracks = this.localStream.getTracks();
      console.log('[PC] Adding local tracks:', tracks.map(t => `${t.kind}:${t.id}`));
      tracks.forEach(track => {
        try {
          this.pc?.addTrack(track, this.localStream!);
        } catch (err) {
          console.error('[PC] addTrack error:', err);
        }
      });
    }

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

    // Remote track received (modern API). Some versions of react-native-webrtc
    // populate event.streams[0]; when not, we assemble a MediaStream manually.
    this.pc.ontrack = (event) => {
      const track = event.track;
      // if (!track) return;

      console.log('[PC] Remote track (ontrack):', track.kind, track.id);

      let stream = event.streams && event.streams[0];
      if (stream) {
        console.log('[PC] ontrack event.streams[0] tracks:', stream.getTracks().length);
        this.remoteStream = stream as MediaStream;
      } else {
        // Fallback: assemble our own MediaStream from incoming tracks.
        if (!this.remoteStream) {
          this.remoteStream = new MediaStream();
        }
        const exists = this.remoteStream.getTracks().some(t => t.id === track.id);
        if (!exists) {
          this.remoteStream.addTrack(track);
        }
      }

      this._onRemoteStreamChanged?.(this.remoteStream);
    };
  }

  // ─── Private: Signaling message handler ───────────────────────────────────

  private async _handleWSMessage(msg: any) {
    switch (msg.type) {

      case 'session_ready': {
        // Therapist is the offerer
        if (this.role === 'therapist') {
          await this._safeCreateAndSendOffer('session_ready');
        }
        break;
      }

      case 'webrtc_offer': {
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

      case 'peer_left':
      case 'peer_disconnected': {
        // Remote peer is gone (temporary). Keep local media alive and wait for rejoin.
        console.log('[WS] Peer disconnected/left');
        
        this.remoteStream?.getTracks().forEach(t => t.stop());
        this.remoteStream = null;
        this._onRemoteStreamChanged?.(null);
        this.onPeerDisconnect?.();

        // Reset PC so next session_ready triggers a clean offer/answer.
        // (Safer than trying to keep old transceivers around across reconnects)
        this._buildPeerConnection();
        break;
      }

      case 'peer-unavailable':{
        
        
        break;
      }

      case 'peer_joined': {
       
        break;
      }

      case 'session_ended': {
        this.hangup(true);
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