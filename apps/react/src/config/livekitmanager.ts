/**
 * livekitManager.ts
 *
 * Room-based media engine using livekit-client.
 *
 * LiveKit handles:
 *   - ICE / TURN / STUN (no manual ICE servers needed)
 *   - Room-based track publishing / subscription
 *   - Bluetooth headphone routing (via AudioSession on iOS/Android SDK)
 *   - Web → Android / iOS cross-platform rendering
 *   - Adaptive bitrate, simulcast, VP8/H.264 codec negotiation
 *
 * Our custom WebSocket handles:
 *   - Session join / leave / end signaling
 *   - Chat messages
 *   - Media state broadcast (mic/cam on-off)
 *   - Peer presence events
 *
 * LiveKit Server token is fetched from YOUR backend via REST.
 * Set LIVEKIT_TOKEN_ENDPOINT to your token endpoint URL.
 */

import {
    Room,
    RoomEvent,
    Track,
    TrackEvent,
    LocalTrack,
    RemoteTrack,
    RemoteParticipant,
    LocalParticipant,
    Participant,
    ParticipantEvent,
    ConnectionState,
    VideoPresets,
    
    createLocalTracks,
    createLocalAudioTrack,
    createLocalVideoTrack,
    LocalAudioTrack,
    LocalVideoTrack,
    RemoteAudioTrack,
    RemoteVideoTrack,
    TrackPublication,
    RemoteTrackPublication,
} from 'livekit-client';
import {
  AudioPresets,
} from 'livekit-client';
import { fetchLiveKitToken } from './livekit-token';

// ─── Configuration ──────────────────────────────────────────────────────────

/**
 * Your LiveKit server URL (ws:// or wss://)
 * Example: 'wss://your-app.livekit.cloud'
 */
const LIVEKIT_URL = 'wss://elma-ig1ydbt3.livekit.cloud';

/**
 * Your backend endpoint that mints a LiveKit JWT for the participant.
 * POST { roomName, participantName, participantIdentity } → { token: string }
 */
const LIVEKIT_TOKEN_ENDPOINT = 'https://elma-dsb6fne7c0bqezaj.centralindia-01.azurewebsites.net/api/livekit/token';

/** Your existing signaling WebSocket */
const WEBSOCKET_URL = 'wss://elma-dsb6fne7c0bqezaj.centralindia-01.azurewebsites.net/';

// ─── Types ───────────────────────────────────────────────────────────────────

export type Role = 'patient' | 'therapist';

export interface MediaState {
    micEnabled: boolean;
    cameraEnabled: boolean;
}

export interface ChatMessage {
    text: string;
    senderName: string;
    role: Role;
    userId: string;
    createdAt: number;
}

export interface RemoteMedia {
    audioTrack: RemoteAudioTrack | null;
    videoTrack: RemoteVideoTrack | null;
    participant: RemoteParticipant | null;
}

export type ConnectionStatus =
    | 'disconnected'
    | 'connecting'
    | 'connected'
    | 'reconnecting'
    | 'failed';

// ─── Callbacks ───────────────────────────────────────────────────────────────

export interface LiveKitManagerCallbacks {
    onLocalVideoTrack?: (track: LocalVideoTrack | null) => void;
    onLocalAudioTrack?: (track: LocalAudioTrack | null) => void;
    onRemoteMedia?: (media: RemoteMedia) => void;
    onMessages?: (messages: ChatMessage[]) => void;
    onConnectionStatus?: (status: ConnectionStatus) => void;
    onRemoteMediaState?: (state: MediaState) => void;
    onPeerJoined?: () => void;
    onPeerLeft?: () => void;
    onSessionEnded?: () => void;
    onError?: (err: Error) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeRole(role: unknown): Role {
    const v = String(role ?? '').trim().toLowerCase();
    if (
        ['therapist', 'expert', 'psych', 'psychologist', 'doctor',
            'provider', 'counsellor', 'counselor', 'professional'].includes(v)
    ) return 'therapist';
    return 'patient';
}

function log(tag: string, ...args: unknown[]) {
    console.log(`[LK][${new Date().toISOString().slice(11, 23)}][${tag}]`, ...args);
}



// ─── LiveKitManager ──────────────────────────────────────────────────────────

class LiveKitManager {
    // ── LiveKit ────────────────────────────────────────────────────────────────
    private room: Room | null = null;
    private localAudio: LocalAudioTrack | null = null;
    private localVideo: LocalVideoTrack | null = null;

    // ── Custom WS ─────────────────────────────────────────────────────────────
    private ws: WebSocket | null = null;
    private _intentionalClose = false;
    private _wsReconnectAttempts = 0;
    private _maxReconnectAttempts = 8;
    private _reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    // ── Session meta ──────────────────────────────────────────────────────────
    sessionCode: string | null = null;
    userId: string | null = null;
    role: Role = 'patient';
    private _userName: string = 'User';
    private _micEnabled = false;
    private _cameraEnabled = false;

    // ── State ─────────────────────────────────────────────────────────────────
    messages: ChatMessage[] = [];
    private _remoteMedia: RemoteMedia = { audioTrack: null, videoTrack: null, participant: null };
    private _peerReady = false;
    private _connectionStatus: ConnectionStatus = 'disconnected';

    // ── Callbacks ─────────────────────────────────────────────────────────────
    callbacks: LiveKitManagerCallbacks = {};

    // ── Signaling queue ───────────────────────────────────────────────────────
    private _signalingChain: Promise<void> = Promise.resolve();

    // ─── Public API ────────────────────────────────────────────────────────────

    /**
     * Initialize a session: acquire media → connect LiveKit → join WS session.
     *
     * @param sessionCode   Your session/booking ID (used as LiveKit room name)
     * @param userId        Current user's ID
     * @param role          'patient' | 'therapist'
     * @param userName      Display name for chat / participant identity
     * @param micEnabled    Start with microphone on?
     * @param cameraEnabled Start with camera on?
     */
    async initialize(
        sessionCode: string,
        userId: string,
        role: Role,
        userName: string,
        micEnabled = false,
        cameraEnabled = false,
    ): Promise<void> {
        if (this.room?.state === ConnectionState.Connected) {
            console.warn('[LK] Already initialized. Call hangup() first.');
            return;
        }

        this._intentionalClose = false;
        this.sessionCode = sessionCode;
        this.userId = userId;
        this.role = normalizeRole(role);
        this._userName = userName || userId;
        this._micEnabled = micEnabled;
        this._cameraEnabled = cameraEnabled;

        this._setConnectionStatus('connecting');

        try {
            // 1. Acquire local tracks (before room connect for faster preview)
            await this._acquireLocalTracks(micEnabled, cameraEnabled);

            // 2. Fetch LiveKit JWT from your backend
            const { url, token } = await fetchLiveKitToken(sessionCode, userId, role);

            // 3. Build and connect the Room
            await this._buildRoom(token);

            // 4. Connect custom WebSocket for chat/signaling
            this._connectWebSocket();
        } catch (err: any) {
            this._setConnectionStatus('failed');
            this.callbacks.onError?.(err);
            throw err;
        }
    }

    async setMicrophoneEnabled(enabled: boolean): Promise<void> {
        this._micEnabled = enabled;
        if (!this.room) return;

        if (enabled) {
            if (!this.localAudio) {
                this.localAudio = await createLocalAudioTrack({
                    // Bluetooth headphone support: echoCancellation + noiseSuppression
                    // are set to true; iOS AudioSession will route through BT automatically
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                });
                this.callbacks.onLocalAudioTrack?.(this.localAudio);
            }
            
            await this.room.localParticipant.publishTrack(this.localAudio, {
                audioBitrate: AudioPresets.speech.maxBitrate,
            });
            await this.localAudio.unmute();
        } else {
            if (this.localAudio) {
                await this.localAudio.mute();
            }
        }
        this._broadcastMediaState();
    }

    async setCameraEnabled(enabled: boolean): Promise<void> {
        this._cameraEnabled = enabled;
        if (!this.room) return;

        if (enabled) {
            if (!this.localVideo) {
                this.localVideo = await createLocalVideoTrack({
                    resolution: VideoPresets.h720.resolution,
                    facingMode: 'user',
                });
                this.callbacks.onLocalVideoTrack?.(this.localVideo);
            }
            await this.room.localParticipant.publishTrack(this.localVideo, {
                simulcast: true,
                videoSimulcastLayers: [VideoPresets.h180, VideoPresets.h360],
            });
            await this.localVideo.unmute();
        } else {
            if (this.localVideo) {
                await this.localVideo.mute();
            }
        }
        this._broadcastMediaState();
    }

    async toggleMute(isMuted: boolean): Promise<void> {
        await this.setMicrophoneEnabled(!isMuted);
    }

    async toggleCamera(isOff: boolean): Promise<void> {
        await this.setCameraEnabled(!isOff);
    }

    sendChatMessage(text: string): void {
        this._sendWS({
            type: 'chat_message',
            text,
            senderName: this._userName,
            role: this.role,
        });
    }

    sendMessage(message: object): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                ...message,
                sessionCode: this.sessionCode,
                userId: this.userId,
            }));
        }
    }

    /**
     * Attach the local video track to an <video> or <div> element.
     * LiveKit renders into a container element — pass a wrapper <div>.
     */
    attachLocalVideo(container: HTMLElement | null): void {
        if (!container || !this.localVideo) return;
        const el = this.localVideo.attach();
        el.style.width = '100%';
        el.style.height = '100%';
        el.style.objectFit = 'cover';
        el.style.transform = 'scaleX(-1)'; // mirror self-view
        container.innerHTML = '';
        container.appendChild(el);
    }

    /**
     * Attach the remote video track to a container element.
     */
    attachRemoteVideo(container: HTMLElement | null): void {
        if (!container || !this._remoteMedia.videoTrack) return;
        const el = this._remoteMedia.videoTrack.attach();
        el.style.width = '100%';
        el.style.height = '100%';
        el.style.objectFit = 'cover';
        container.innerHTML = '';
        container.appendChild(el);
    }

    /**
     * Detach a track from all DOM elements (call before unmount).
     */
    detachLocalVideo(): void {
        this.localVideo?.detach();
    }

    detachRemoteVideo(): void {
        this._remoteMedia.videoTrack?.detach();
    }

    get localVideoTrack(): LocalVideoTrack | null { return this.localVideo; }
    get localAudioTrack(): LocalAudioTrack | null { return this.localAudio; }
    get remoteMedia(): RemoteMedia { return this._remoteMedia; }
    get micEnabled(): boolean { return this._micEnabled; }
    get cameraEnabled(): boolean { return this._cameraEnabled; }
    get connectionStatus(): ConnectionStatus { return this._connectionStatus; }
    get peerReady(): boolean { return this._peerReady; }

    hangup(cb?: () => void): void {
        this._intentionalClose = true;
        if (this._reconnectTimer) { clearTimeout(this._reconnectTimer); this._reconnectTimer = null; }

        // Send leave/end signal
        if (this.ws?.readyState === WebSocket.OPEN) {
            const type = this.role === 'therapist' ? 'end_session' : 'leave_session';
            try {
                this.ws.send(JSON.stringify({ type, sessionCode: this.sessionCode, userId: this.userId, role: this.role }));
            } catch { /* ignore */ }
        }

        // Detach all tracks
        this.localVideo?.stop();
        this.localAudio?.stop();
        this.localVideo?.detach();
        this.localAudio?.detach();

        // Disconnect from LiveKit room
        this.room?.disconnect();

        // Close WS
        this.ws?.close();

        // Reset
        this.room = null;
        this.ws = null;
        this.localVideo = null;
        this.localAudio = null;
        this.sessionCode = null;
        this.userId = null;
        this.messages = [];
        this._peerReady = false;
        this._micEnabled = false;
        this._cameraEnabled = false;
        this._remoteMedia = { audioTrack: null, videoTrack: null, participant: null };
        this._setConnectionStatus('disconnected');

        // Clear callbacks
        this.callbacks = {};
        cb?.();
    }

    // ─── Private: local media ──────────────────────────────────────────────────

    private async _acquireLocalTracks(micEnabled: boolean, cameraEnabled: boolean): Promise<void> {
        if (!micEnabled && !cameraEnabled) return;

        const tracks = await createLocalTracks({
            audio: micEnabled ? {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                // Bluetooth: let browser/OS pick the best audio device
                // On mobile, AudioSession routing handles BT headphones automatically
            } : false,
            video: cameraEnabled ? {
                resolution: VideoPresets.h720.resolution,
                facingMode: 'user',
            } : false,
        });

        for (const track of tracks) {
            if (track.kind === Track.Kind.Audio) {
                this.localAudio = track as LocalAudioTrack;
                this.callbacks.onLocalAudioTrack?.(this.localAudio);
            } else if (track.kind === Track.Kind.Video) {
                this.localVideo = track as LocalVideoTrack;
                this.callbacks.onLocalVideoTrack?.(this.localVideo);
            }
        }
    }

    // ─── Private: LiveKit Room ─────────────────────────────────────────────────

    private async _buildRoom(token: string): Promise<void> {
        const room = new Room({
            // Adaptive streaming — reduces bitrate on poor connections
            adaptiveStream: true,
            // Dynacast — only publish at the resolution subscribers need
            dynacast: true,
            // Audio options for Bluetooth headphone support
            audioCaptureDefaults: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
            },
            // Video capture defaults
            videoCaptureDefaults: {
                resolution: VideoPresets.h720.resolution,
                facingMode: 'user',
            },
            // Publish defaults
            publishDefaults: {
                simulcast: true,
                videoSimulcastLayers: [VideoPresets.h180, VideoPresets.h360],
                videoCodec: 'vp8', // widely supported on web + mobile WebView
            },
        });

        this.room = room;

        // ── Room events ─────────────────────────────────────────────────────────

        room.on(RoomEvent.Connected, () => {
            log('ROOM', 'connected', room.name);
            this._setConnectionStatus('connected');
            this._publishLocalTracks();
        });

        room.on(RoomEvent.Reconnecting, () => {
            log('ROOM', 'reconnecting');
            this._setConnectionStatus('reconnecting');
        });

        room.on(RoomEvent.Reconnected, () => {
            log('ROOM', 'reconnected');
            this._setConnectionStatus('connected');
        });

        room.on(RoomEvent.Disconnected, () => {
            log('ROOM', 'disconnected');
            this._setConnectionStatus('disconnected');
        });

        room.on(RoomEvent.ConnectionStateChanged, (state) => {
            log('ROOM', 'connection state', state);
        });

        // ── Participant events ───────────────────────────────────────────────────

        room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
            log('ROOM', 'participant joined', participant.identity);
            this._peerReady = true;
            this.callbacks.onPeerJoined?.();
            this._bindParticipantEvents(participant);
        });

        room.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
            log('ROOM', 'participant left', participant.identity);
            this._peerReady = false;
            this._remoteMedia = { audioTrack: null, videoTrack: null, participant: null };
            this.callbacks.onRemoteMedia?.(this._remoteMedia);
            this.callbacks.onPeerLeft?.();
        });

        // ── Track events (subscription) ──────────────────────────────────────────

        room.on(RoomEvent.TrackSubscribed, (
            track: RemoteTrack,
            publication: RemoteTrackPublication,
            participant: RemoteParticipant,
        ) => {
            log('ROOM', 'track subscribed', track.kind, participant.identity);
            if (track.kind === Track.Kind.Video) {
                this._remoteMedia = {
                    ...this._remoteMedia,
                    videoTrack: track as RemoteVideoTrack,
                    participant,
                };
            } else if (track.kind === Track.Kind.Audio) {
                this._remoteMedia = {
                    ...this._remoteMedia,
                    audioTrack: track as RemoteAudioTrack,
                    participant,
                };
                // Attach audio to DOM automatically so it plays without a <video> element
                (track as RemoteAudioTrack).attach();
            }
            this.callbacks.onRemoteMedia?.({ ...this._remoteMedia });
            this._peerReady = true;
            this.callbacks.onPeerJoined?.();
        });

        room.on(RoomEvent.TrackUnsubscribed, (
            track: RemoteTrack,
            publication: RemoteTrackPublication,
            participant: RemoteParticipant,
        ) => {
            log('ROOM', 'track unsubscribed', track.kind);
            track.detach();
            if (track.kind === Track.Kind.Video) {
                this._remoteMedia = { ...this._remoteMedia, videoTrack: null };
            } else if (track.kind === Track.Kind.Audio) {
                this._remoteMedia = { ...this._remoteMedia, audioTrack: null };
            }
            this.callbacks.onRemoteMedia?.({ ...this._remoteMedia });
        });

        room.on(RoomEvent.TrackMuted, (publication: TrackPublication, participant: Participant) => {
            log('ROOM', 'track muted', publication.kind, participant.identity);
            if (participant.identity !== this.userId) {
                this._emitRemoteMediaState(participant as RemoteParticipant);
            }
        });

        room.on(RoomEvent.TrackUnmuted, (publication: TrackPublication, participant: Participant) => {
            log('ROOM', 'track unmuted', publication.kind, participant.identity);
            if (participant.identity !== this.userId) {
                this._emitRemoteMediaState(participant as RemoteParticipant);
            }
        });

        room.on(RoomEvent.ActiveSpeakersChanged, (speakers: Participant[]) => {
            // Optional: use for speaker highlight UI
        });

        // ── Handle already-present participants (e.g. we joined second) ──────────
        for (const [, participant] of room.remoteParticipants) {
            this._bindParticipantEvents(participant);
            for (const [, publication] of participant.trackPublications) {
                if (publication.isSubscribed && publication.track) {
                    const track = publication.track as RemoteTrack;
                    if (track.kind === Track.Kind.Video) {
                        this._remoteMedia = { ...this._remoteMedia, videoTrack: track as RemoteVideoTrack, participant };
                    } else if (track.kind === Track.Kind.Audio) {
                        this._remoteMedia = { ...this._remoteMedia, audioTrack: track as RemoteAudioTrack, participant };
                        (track as RemoteAudioTrack).attach();
                    }
                }
            }
            if (this._remoteMedia.videoTrack || this._remoteMedia.audioTrack) {
                this._peerReady = true;
                this.callbacks.onRemoteMedia?.({ ...this._remoteMedia });
                this.callbacks.onPeerJoined?.();
            }
        }

        // ── Connect ──────────────────────────────────────────────────────────────
        await room.connect(LIVEKIT_URL, token, {
            autoSubscribe: true,
        });
    }

    private async _publishLocalTracks(): Promise<void> {
        if (!this.room) return;
        const local = this.room.localParticipant;

        if (this.localAudio) {
            try {
                await local.publishTrack(this.localAudio, {
                   audioBitrate: AudioPresets.speech.maxBitrate,
                });
                if (!this._micEnabled) await this.localAudio.mute();
                log('ROOM', 'audio track published');
            } catch (err) { console.warn('[LK] audio publish failed', err); }
        }

        if (this.localVideo) {
            try {
                await local.publishTrack(this.localVideo, {
                    simulcast: true,
                    videoSimulcastLayers: [VideoPresets.h180, VideoPresets.h360],
                });
                if (!this._cameraEnabled) await this.localVideo.mute();
                log('ROOM', 'video track published');
            } catch (err) { console.warn('[LK] video publish failed', err); }
        }
    }

    private _bindParticipantEvents(participant: RemoteParticipant): void {
        participant.on(ParticipantEvent.TrackPublished, () => { });
        participant.on(ParticipantEvent.TrackUnpublished, () => { });
        participant.on(ParticipantEvent.IsSpeakingChanged, () => { });
    }

    private _emitRemoteMediaState(participant: RemoteParticipant): void {
        let micEnabled = false;
        let cameraEnabled = false;
        for (const [, pub] of participant.trackPublications) {
            if (pub.kind === Track.Kind.Audio) micEnabled = !pub.isMuted;
            if (pub.kind === Track.Kind.Video) cameraEnabled = !pub.isMuted;
        }
        this.callbacks.onRemoteMediaState?.({ micEnabled, cameraEnabled });
    }

    // ─── Private: connection status ────────────────────────────────────────────

    private _setConnectionStatus(status: ConnectionStatus): void {
        this._connectionStatus = status;
        this.callbacks.onConnectionStatus?.(status);
    }

    // ─── Private: WebSocket ────────────────────────────────────────────────────

    private _connectWebSocket(): void {
        if (!this.sessionCode) return;
        this.ws = new WebSocket(`${WEBSOCKET_URL}?sessionCode=${this.sessionCode}`);

        this.ws.onopen = () => {
            log('WS', 'connected');
            this._wsReconnectAttempts = 0;
            this._sendWS({ type: 'join_session', sessionCode: this.sessionCode, userId: this.userId, role: this.role });
            this._broadcastMediaState();
        };

        this.ws.onmessage = (event) => {
            let msg: any;
            try { msg = JSON.parse(event.data); } catch { return; }
            this._signalingChain = this._signalingChain
                .then(() => this._handleWSMessage(msg))
                .catch(err => console.error('[WS] handler error', msg.type, err));
        };

        this.ws.onerror = (err) => console.error('[WS] error', err);

        this.ws.onclose = (event) => {
            log('WS', 'closed', event.code);
            if (!this._intentionalClose) this._scheduleWsReconnect();
        };
    }

    private _scheduleWsReconnect(): void {
        if (this._wsReconnectAttempts >= this._maxReconnectAttempts) return;
        const delay = Math.min(1000 * 2 ** this._wsReconnectAttempts, 16000);
        this._wsReconnectAttempts++;
        this._reconnectTimer = setTimeout(() => this._connectWebSocket(), delay);
    }

    private _sendWS(message: object): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ userId: this.userId, sessionCode: this.sessionCode, ...message }));
        }
    }

    private _broadcastMediaState(): void {
        this._sendWS({
            type: 'media_state_updated',
            micEnabled: this._micEnabled,
            cameraEnabled: this._cameraEnabled,
            role: this.role,
        });
    }

    private async _handleWSMessage(msg: any): Promise<void> {
        // Filter self-echoes for media state / signaling types
        if (msg.userId && msg.userId === this.userId) {
            const selfFilterTypes = new Set(['media_state_updated', 'chat_message']);
            if (!selfFilterTypes.has(msg.type)) return;
            if (msg.type === 'media_state_updated') return; // always filter self
        }

        switch (msg.type) {
            case 'chat_message': {
                if (msg.userId === this.userId) break; // don't re-add own messages sent via WS echo
                const m: ChatMessage = {
                    text: msg.text,
                    senderName: msg.senderName || 'Unknown',
                    role: msg.role || 'patient',
                    userId: msg.userId,
                    createdAt: msg.createdAt || Date.now(),
                };
                this.messages = [...this.messages, m];
                this.callbacks.onMessages?.([...this.messages]);
                break;
            }

            case 'chat_history': {
                this.messages = Array.isArray(msg.messages) ? msg.messages : [];
                this.callbacks.onMessages?.([...this.messages]);
                break;
            }

            case 'media_state_updated': {
                if (msg.userId === this.userId) break;
                this.callbacks.onRemoteMediaState?.({
                    micEnabled: !!msg.micEnabled,
                    cameraEnabled: !!msg.cameraEnabled,
                });
                break;
            }

            case 'session_ready':
            case 'peer_joined': {
                // LiveKit room events handle actual media — WS event just marks peer present
                this._peerReady = true;
                break;
            }

            case 'peer_left':
            case 'peer_disconnected': {
                this._peerReady = false;
                this.callbacks.onPeerLeft?.();
                break;
            }

            case 'session_ended': {
                this.callbacks.onSessionEnded?.();
                break;
            }

            default:
                break;
        }
    }
}

// Singleton
export const livekitManager = new LiveKitManager();