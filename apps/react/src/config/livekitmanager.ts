/**
 * livekitManager.ts
 *
 * Room-based media engine using livekit-client (web).
 *
 * This is the WEB counterpart of the mobile `livekitSessionManager`. It mirrors
 * the same edge-case handling so the connection + live updates are seamless:
 *
 *   - Presence is derived from the LiveKit room (re-enumerated on connect /
 *     reconnect / participant events), NOT only from one-shot events — so a peer
 *     who joined while we were connecting (or whose event we missed) is detected
 *     and never strands the other party on the waiting screen.
 *
 *   - A peer turning their camera OFF MUTES the track (LiveKit does NOT
 *     unpublish). The raw subscribed track therefore stays alive and non-null;
 *     rendering it paints a frozen/black frame. We keep the raw track separately
 *     and only expose a *renderable* track while the camera is actually live,
 *     driven by the track's own mute lifecycle (TrackMuted/TrackUnmuted).
 *
 *   - The signaling WebSocket media broadcast is a SUPPLEMENTARY hint: it may
 *     only SUPPRESS remote video (turn it off early), never force it on. Camera
 *     truth is owned by the LiveKit track lifecycle.
 *
 *   - Acquiring the local mic/camera on join is NON-FATAL (with a one-shot
 *     camera retry) so a transient device error can never reject the join.
 *
 *   - Toggling a device MUTES/UNMUTES an already-published track (no
 *     re-publish), so turning a camera off then on again works repeatedly.
 *
 *   - Assigning `callbacks` REPLAYS the current state to the new listeners, so a
 *     screen that mounts after the peer already joined / toggled media picks up
 *     reality immediately instead of a stale default.
 *
 * LiveKit Server token is fetched from YOUR backend via REST.
 */

import {
    Room,
    RoomEvent,
    Track,
    RemoteTrack,
    RemoteParticipant,
    Participant,
    ParticipantEvent,
    ConnectionState,
    VideoPresets,
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
 * Your LiveKit server URL (ws:// or wss://). Used as a fallback when the token
 * endpoint does not return its own `url`.
 */
const LIVEKIT_URL = 'wss://elma-ig1ydbt3.livekit.cloud';

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
    /**
     * The remote camera track the UI should RENDER. `null` whenever the remote
     * camera is off — INCLUDING the muted case — so callers never paint a frozen
     * frame. The raw subscribed track is tracked separately (see `_remoteVideo`).
     */
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
    onDeviceSwitched?: () => void;
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

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

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
    private _remoteParticipant: RemoteParticipant | null = null;
    private _remoteAudio: RemoteAudioTrack | null = null;
    /** Raw subscribed remote camera track, independent of its mute state. */
    private _remoteVideo: RemoteVideoTrack | null = null;
    private _remoteMicOn = false;
    private _remoteCameraOn = false;
    private _peerReady = false;
    private _connectionStatus: ConnectionStatus = 'disconnected';

    // ── Callbacks ─────────────────────────────────────────────────────────────
    private _callbacks: LiveKitManagerCallbacks = {};

    /**
     * Assigning callbacks REPLAYS the current state to the new listeners. A
     * screen that mounts after the peer already joined / toggled media (e.g. the
     * waiting→live handoff) immediately sees reality instead of a stale default.
     */
    get callbacks(): LiveKitManagerCallbacks {
        return this._callbacks;
    }
    set callbacks(cb: LiveKitManagerCallbacks) {
        this._callbacks = cb || {};
        this._replayState();
    }

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
        // Already connected to the SAME room → replay state instead of a wasteful
        // reconnect, and re-enumerate presence so a peer who joined while we were
        // away is detected on this re-entry.
        if (
            this.room?.state === ConnectionState.Connected &&
            this.sessionCode === sessionCode &&
            this.userId === userId
        ) {
            log('INIT', 'already connected to same room — replaying state');
            this._syncExistingParticipants();
            this._refreshPeerPresence('reinit-same-room');
            this._replayState();
            return;
        }

        // Different room or a dead/half-open room → tear down cleanly first.
        if (this.room) {
            this._teardown(false);
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
            // 1. Acquire local tracks (before room connect for faster preview).
            //    NON-FATAL: a device failure disables that device but never
            //    rejects the join.
            await this._acquireLocalTracks(micEnabled, cameraEnabled);

            // 2. Fetch LiveKit JWT from your backend.
            const { url, token } = await fetchLiveKitToken(sessionCode, userId, role);

            // 3. Build and connect the Room.
            await this._buildRoom(url || LIVEKIT_URL, token);

            // 4. Connect custom WebSocket for chat/signaling.
            this._connectWebSocket();
        } catch (err: any) {
            this._setConnectionStatus('failed');
            this._callbacks.onError?.(err);
            throw err;
        }
    }

    async setMicrophoneEnabled(enabled: boolean): Promise<void> {
        this._micEnabled = enabled;
        if (!this.room) return;

        if (enabled) {
            if (!this.localAudio) {
                this.localAudio = await createLocalAudioTrack({
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                });
                this._callbacks.onLocalAudioTrack?.(this.localAudio);
            }
            // Publish only once — re-publishing an already-published track throws,
            // which would break the 2nd "mic on" after a "mic off".
            if (!this.room.localParticipant.getTrackPublication(Track.Source.Microphone)) {
                await this.room.localParticipant.publishTrack(this.localAudio, {
                    audioBitrate: AudioPresets.speech.maxBitrate,
                });
            }
            await this.localAudio.unmute();
        } else if (this.localAudio) {
            await this.localAudio.mute();
        }
        this._broadcastMediaState();
    }

    async setCameraEnabled(enabled: boolean): Promise<void> {
        this._cameraEnabled = enabled;
        if (!this.room) return;

        if (enabled) {
            if (!this.localVideo) {
                this.localVideo = await this._createVideoTrackWithRetry();
                if (!this.localVideo) {
                    // Device failed even after retry — reflect reality and surface
                    // to the caller so the UI reverts its optimistic "camera on".
                    this._cameraEnabled = false;
                    this._broadcastMediaState();
                    throw new Error('Could not start the camera.');
                }
                this._callbacks.onLocalVideoTrack?.(this.localVideo);
            }
            if (!this.room.localParticipant.getTrackPublication(Track.Source.Camera)) {
                await this.room.localParticipant.publishTrack(this.localVideo, {
                    simulcast: true,
                    videoSimulcastLayers: [VideoPresets.h180, VideoPresets.h360],
                });
            }
            await this.localVideo.unmute();
            this._callbacks.onLocalVideoTrack?.(this.localVideo);
        } else if (this.localVideo) {
            await this.localVideo.mute();
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

    requestHistory() {
        this._sendWS({
            type: 'get_chat_history',
            sessionCode: this.sessionCode,
            userId: this.userId,
            role: this.role,
        });
    }

    /**
     * Attach the local video track to a container element (mirror self-view).
     */
    attachLocalVideo(container: HTMLElement | null): void {
        if (!container || !this.localVideo) return;
        const el = this.localVideo.attach();
        el.style.width = '100%';
        el.style.height = '100%';
        el.style.objectFit = 'cover';
        el.style.transform = 'scaleX(-1)';
        container.innerHTML = '';
        container.appendChild(el);
    }

    /**
     * Attach the renderable remote video track to a container element.
     */
    attachRemoteVideo(container: HTMLElement | null): void {
        const track = this.remoteMedia.videoTrack;
        if (!container || !track) return;
        const el = track.attach();
        el.style.width = '100%';
        el.style.height = '100%';
        el.style.objectFit = 'cover';
        container.innerHTML = '';
        container.appendChild(el);
    }

    detachLocalVideo(): void {
        this.localVideo?.detach();
    }

    detachRemoteVideo(): void {
        this._remoteVideo?.detach();
    }

    get localVideoTrack(): LocalVideoTrack | null { return this.localVideo; }
    get localAudioTrack(): LocalAudioTrack | null { return this.localAudio; }
    get remoteMedia(): RemoteMedia {
        return {
            audioTrack: this._remoteAudio,
            // Renderable track: null while the camera is off (incl. muted).
            videoTrack: this._remoteCameraOn ? this._remoteVideo : null,
            participant: this._remoteParticipant,
        };
    }
    get micEnabled(): boolean { return this._micEnabled; }
    get cameraEnabled(): boolean { return this._cameraEnabled; }
    get connectionStatus(): ConnectionStatus { return this._connectionStatus; }
    get peerReady(): boolean { return this._peerReady; }

    /**
     * Terminal exit (End call). Signals end_session/leave_session to the peer so
     * the booking is marked complete / the peer is moved to "session ended".
     */
    hangup(cb?: () => void): void {
        this._teardown(true);
        cb?.();
    }

    /**
     * Non-terminal exit (Back from the waiting room). Performs the SAME full
     * teardown but deliberately does NOT emit the terminal end/leave signal — so
     * leaving via Back never marks the booking complete nor kicks the remaining
     * participant. The peer is informed purely via LiveKit presence
     * (ParticipantDisconnected → "waiting to reconnect…"), keeping the session
     * rejoinable for both parties.
     */
    leaveSession(cb?: () => void): void {
        this._teardown(false);
        cb?.();
    }

    // ─── Private: local media ──────────────────────────────────────────────────

    /**
     * Acquire the local mic/camera independently. Each device is best-effort:
     * a failure disables only that device (and reconciles `_micEnabled` /
     * `_cameraEnabled`) so a transient device error can never reject the join.
     */
    private async _acquireLocalTracks(micEnabled: boolean, cameraEnabled: boolean): Promise<void> {
        if (micEnabled) {
            try {
                this.localAudio = await createLocalAudioTrack({
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                });
                this._callbacks.onLocalAudioTrack?.(this.localAudio);
            } catch (err) {
                console.warn('[LK] acquire mic on join failed (non-fatal)', err);
                this._micEnabled = false;
            }
        }

        if (cameraEnabled) {
            const track = await this._createVideoTrackWithRetry();
            if (track) {
                this.localVideo = track;
                this._callbacks.onLocalVideoTrack?.(this.localVideo);
            } else {
                console.warn('[LK] acquire camera on join failed (non-fatal)');
                this._cameraEnabled = false;
            }
        }
    }

    /**
     * Create the local camera track, retrying once after a short delay. The
     * common failure on a lobby→waiting handoff or a fast rejoin is the capturer
     * still being released by the previous owner, which clears within a few
     * hundred ms.
     */
    private async _createVideoTrackWithRetry(): Promise<LocalVideoTrack | null> {
        try {
            return await createLocalVideoTrack({
                resolution: VideoPresets.h720.resolution,
                facingMode: 'user',
            });
        } catch (err) {
            console.warn('[LK] create camera track failed — retrying once', err);
            await sleep(350);
            try {
                return await createLocalVideoTrack({
                    resolution: VideoPresets.h720.resolution,
                    facingMode: 'user',
                });
            } catch (retryErr) {
                console.error('[LK] create camera track retry failed (non-fatal)', retryErr);
                return null;
            }
        }
    }

    // ─── Private: LiveKit Room ─────────────────────────────────────────────────

    private async _buildRoom(url: string, token: string): Promise<void> {
        const room = new Room({
            adaptiveStream: true,
            dynacast: true,
            audioCaptureDefaults: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
            },
            videoCaptureDefaults: {
                resolution: VideoPresets.h720.resolution,
                facingMode: 'user',
            },
            publishDefaults: {
                simulcast: true,
                videoSimulcastLayers: [VideoPresets.h180, VideoPresets.h360],
                videoCodec: 'vp8', // widely supported on web + mobile WebView
            },
        });

        this.room = room;
        this._attachRoomListeners(room);

        await room.connect(url, token, { autoSubscribe: true });

        // Connect resolved → publish, then enumerate whoever is ALREADY here
        // (we may have joined second). Presence is derived from the room, never
        // assumed from a single event.
        this._setConnectionStatus('connected');
        await this._publishLocalTracks();
        this._syncExistingParticipants();
        this._refreshPeerPresence('post-connect');
    }

    private _attachRoomListeners(room: Room): void {
        room.on(RoomEvent.Connected, () => {
            log('ROOM', 'connected', room.name);
            this._setConnectionStatus('connected');
            this._refreshPeerPresence('connected');
        });

        room.on(RoomEvent.Reconnecting, () => {
            log('ROOM', 'reconnecting');
            this._setConnectionStatus('reconnecting');
        });

        room.on(RoomEvent.Reconnected, () => {
            log('ROOM', 'reconnected');
            this._setConnectionStatus('connected');
            // Tracks survive a reconnect — re-sync and re-emit so the UI repaints.
            this._syncExistingParticipants();
            this._refreshPeerPresence('reconnected');
            this._emitRemoteMedia();
            this._emitRemoteMediaState();
        });

        room.on(RoomEvent.Disconnected, () => {
            log('ROOM', 'disconnected');
            if (!this._intentionalClose) this._setConnectionStatus('disconnected');
        });

        room.on(RoomEvent.ConnectionStateChanged, (state) => {
            log('ROOM', 'connection state', state);
        });

        // ── Participant events ───────────────────────────────────────────────────

        room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
            log('ROOM', 'participant joined', participant.identity);
            this._bindParticipantEvents(participant);
            this._adoptParticipantTracks(participant);
            this._refreshPeerPresence('participant-connected');
        });

        room.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
            log('ROOM', 'participant left', participant.identity);
            if (this._remoteParticipant?.identity === participant.identity || this.room?.remoteParticipants.size === 0) {
                this._clearRemoteMedia();
            }
            this._refreshPeerPresence('participant-disconnected');
        });

        // ── Track events (subscription) ──────────────────────────────────────────

        room.on(RoomEvent.TrackSubscribed, (
            track: RemoteTrack,
            publication: RemoteTrackPublication,
            participant: RemoteParticipant,
        ) => {
            log('ROOM', 'track subscribed', track.kind, participant.identity);
            if (track.kind === Track.Kind.Video) {
                this._setRemoteVideo(track as RemoteVideoTrack, publication.isMuted, participant);
            } else if (track.kind === Track.Kind.Audio) {
                this._setRemoteAudio(track as RemoteAudioTrack, publication.isMuted, participant);
            }
            this._refreshPeerPresence('track-subscribed');
        });

        room.on(RoomEvent.TrackUnsubscribed, (
            track: RemoteTrack,
        ) => {
            log('ROOM', 'track unsubscribed', track.kind);
            track.detach();
            if (track.kind === Track.Kind.Video) {
                this._setRemoteVideo(null, false, null);
            } else if (track.kind === Track.Kind.Audio) {
                this._setRemoteAudio(null, true, null);
            }
        });

        // A peer toggling camera/mic MUTES the track — LiveKit does NOT unpublish
        // on disable. Without these handlers a muted camera track stays subscribed
        // and the remote view renders a frozen/black frame forever. Camera truth
        // is derived from the track's own mute lifecycle (the authoritative
        // source), not only the WS broadcast.
        room.on(RoomEvent.TrackMuted, (publication: TrackPublication, participant: Participant) => {
            if (participant.isLocal) return;
            this._applyRemoteMute(publication, true, participant as RemoteParticipant);
        });

        room.on(RoomEvent.TrackUnmuted, (publication: TrackPublication, participant: Participant) => {
            if (participant.isLocal) return;
            this._applyRemoteMute(publication, false, participant as RemoteParticipant);
        });
    }

    private async _publishLocalTracks(): Promise<void> {
        if (!this.room) return;
        const local = this.room.localParticipant;

        if (this.localAudio) {
            try {
                if (!local.getTrackPublication(Track.Source.Microphone)) {
                    await local.publishTrack(this.localAudio, {
                        audioBitrate: AudioPresets.speech.maxBitrate,
                    });
                }
                if (!this._micEnabled) await this.localAudio.mute();
                log('ROOM', 'audio track published');
            } catch (err) { console.warn('[LK] audio publish failed', err); }
        }

        if (this.localVideo) {
            try {
                if (!local.getTrackPublication(Track.Source.Camera)) {
                    await local.publishTrack(this.localVideo, {
                        simulcast: true,
                        videoSimulcastLayers: [VideoPresets.h180, VideoPresets.h360],
                    });
                }
                if (!this._cameraEnabled) await this.localVideo.mute();
                this._callbacks.onLocalVideoTrack?.(this.localVideo);
                log('ROOM', 'video track published');
            } catch (err) { console.warn('[LK] video publish failed', err); }
        }
    }

    private _bindParticipantEvents(participant: RemoteParticipant): void {
        participant.on(ParticipantEvent.TrackPublished, () => {
            this._adoptParticipantTracks(participant);
        });
        participant.on(ParticipantEvent.TrackUnpublished, () => { });
        participant.on(ParticipantEvent.IsSpeakingChanged, () => { });
    }

    /**
     * Enumerate every remote participant currently in the room and adopt their
     * already-subscribed tracks. Used after connect/reconnect so a peer who was
     * here before us (or whose subscription we missed) is picked up.
     */
    private _syncExistingParticipants(): void {
        if (!this.room) return;
        for (const participant of this.room.remoteParticipants.values()) {
            this._bindParticipantEvents(participant);
            this._adoptParticipantTracks(participant);
        }
    }

    private _adoptParticipantTracks(participant: RemoteParticipant): void {
        const camPub = participant.getTrackPublication(Track.Source.Camera);
        if (camPub?.videoTrack) {
            this._setRemoteVideo(camPub.videoTrack as RemoteVideoTrack, camPub.isMuted, participant);
        }
        const micPub = participant.getTrackPublication(Track.Source.Microphone);
        if (micPub?.audioTrack) {
            this._setRemoteAudio(micPub.audioTrack as RemoteAudioTrack, micPub.isMuted, participant);
        }
    }

    // ── Remote media bookkeeping ─────────────────────────────────────────────

    /**
     * Record the raw subscribed remote camera track (or null) together with its
     * muted state, then re-derive what the UI should render and the merged remote
     * media state. A non-null but MUTED track means the peer turned its camera
     * off (LiveKit mutes rather than unpublishes) → render as "no video".
     */
    private _setRemoteVideo(track: RemoteVideoTrack | null, muted: boolean, participant: RemoteParticipant | null): void {
        this._remoteVideo = track;
        if (participant) this._remoteParticipant = participant;
        this._remoteCameraOn = !!track && !muted;
        this._emitRemoteMedia();
        this._emitRemoteMediaState();
    }

    private _setRemoteAudio(track: RemoteAudioTrack | null, muted: boolean, participant: RemoteParticipant | null): void {
        this._remoteAudio = track;
        if (participant) this._remoteParticipant = participant;
        this._remoteMicOn = !!track && !muted;
        // Attach so audio plays without a <video> element.
        if (track) track.attach();
        this._emitRemoteMedia();
        this._emitRemoteMediaState();
    }

    /** Flip the remote camera/mic mute flag from a TrackMuted/TrackUnmuted event. */
    private _applyRemoteMute(pub: TrackPublication, muted: boolean, participant: RemoteParticipant): void {
        const isVideo = pub.kind === Track.Kind.Video || pub.source === Track.Source.Camera;
        if (isVideo) {
            log('MEDIA', 'remote camera', muted ? 'muted (camera off)' : 'unmuted (camera on)');
            // Keep the raw track reference so unmuting re-shows the SAME track.
            const raw = (pub.videoTrack as RemoteVideoTrack | undefined) ?? this._remoteVideo;
            this._setRemoteVideo(raw ?? null, muted, participant);
        } else {
            log('MEDIA', 'remote mic', muted ? 'muted' : 'unmuted');
            this._remoteMicOn = !muted;
            this._emitRemoteMediaState();
        }
    }

    private _clearRemoteMedia(): void {
        this._remoteAudio = null;
        this._remoteVideo = null;
        this._remoteParticipant = null;
        this._remoteMicOn = false;
        this._remoteCameraOn = false;
        this._emitRemoteMedia();
        this._emitRemoteMediaState();
    }

    private _emitRemoteMedia(): void {
        this._callbacks.onRemoteMedia?.(this.remoteMedia);
    }

    private _emitRemoteMediaState(): void {
        this._callbacks.onRemoteMediaState?.({
            micEnabled: this._remoteMicOn,
            cameraEnabled: this._remoteCameraOn,
        });
    }

    // ── Presence ─────────────────────────────────────────────────────────────

    /**
     * In a 1:1 session room every remote participant IS the other party, so
     * presence is simply "is there any remote participant?". Re-enumerating the
     * room (instead of trusting a single event) means a peer who joined while we
     * were connecting — or whose event we missed — is always detected.
     */
    private _refreshPeerPresence(reason: string): void {
        if (!this.room) return;
        const present = this.room.remoteParticipants.size > 0;
        log('PRESENCE', reason, { remoteCount: this.room.remoteParticipants.size, present });
        this._setPeerPresent(present);
    }

    private _setPeerPresent(present: boolean): void {
        if (this._peerReady === present) return;
        this._peerReady = present;
        log('PRESENCE', '->', present);
        if (present) this._callbacks.onPeerJoined?.();
        else this._callbacks.onPeerLeft?.();
    }

    // ─── Private: state replay ─────────────────────────────────────────────────

    private _replayState(): void {
        const cb = this._callbacks;
        cb.onConnectionStatus?.(this._connectionStatus);
        cb.onLocalAudioTrack?.(this.localAudio);
        cb.onLocalVideoTrack?.(this.localVideo);
        cb.onMessages?.([...this.messages]);
        cb.onRemoteMedia?.(this.remoteMedia);
        cb.onRemoteMediaState?.({ micEnabled: this._remoteMicOn, cameraEnabled: this._remoteCameraOn });
        if (this._peerReady) cb.onPeerJoined?.();
    }

    // ─── Private: connection status ────────────────────────────────────────────

    private _setConnectionStatus(status: ConnectionStatus): void {
        this._connectionStatus = status;
        this._callbacks.onConnectionStatus?.(status);
    }

    // ─── Private: teardown ─────────────────────────────────────────────────────

    private _teardown(sendTerminalSignal: boolean): void {
        this._intentionalClose = true;
        if (this._reconnectTimer) { clearTimeout(this._reconnectTimer); this._reconnectTimer = null; }

        // Terminal signal (End call only) — never sent on a Back/leave so the
        // session stays rejoinable.
        if (sendTerminalSignal && this.ws?.readyState === WebSocket.OPEN) {
            const type = this.role === 'therapist' ? 'end_session' : 'leave_session';
            try {
                this.ws.send(JSON.stringify({ type, sessionCode: this.sessionCode, userId: this.userId, role: this.role }));
            } catch { /* ignore */ }
        }

        // Stop + detach local tracks.
        this.localVideo?.stop();
        this.localAudio?.stop();
        this.localVideo?.detach();
        this.localAudio?.detach();

        // Detach remote tracks.
        this._remoteVideo?.detach();
        this._remoteAudio?.detach();

        // room.disconnect() unpublishes + stops local tracks, detaches remote
        // tracks, closes the peer connection and signals our leave to the SFU.
        try { this.room?.disconnect(); } catch (err) { console.warn('[LK] room disconnect error', err); }

        // Close WS without scheduling a reconnect.
        try { this.ws?.close(); } catch { /* ignore */ }

        // Reset.
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
        this._remoteParticipant = null;
        this._remoteAudio = null;
        this._remoteVideo = null;
        this._remoteMicOn = false;
        this._remoteCameraOn = false;
        this._connectionStatus = 'disconnected';

        // Let any still-mounted screen clear its rendered media.
        this._callbacks.onLocalVideoTrack?.(null);
        this._callbacks.onRemoteMedia?.(this.remoteMedia);
        this._callbacks.onRemoteMediaState?.({ micEnabled: false, cameraEnabled: false });
        this._callbacks.onConnectionStatus?.('disconnected');

        // Clear callbacks.
        this._callbacks = {};
    }

    // ─── Private: WebSocket ────────────────────────────────────────────────────

    private _connectWebSocket(): void {
        if (!this.sessionCode) return;
        this.ws = new WebSocket(`${WEBSOCKET_URL}?sessionCode=${this.sessionCode}`);

        this.ws.onopen = () => {
            log('WS', 'connected');
            this._wsReconnectAttempts = 0;
            this._sendWS({ type: 'join_session', sessionCode: this.sessionCode, userId: this.userId, role: this.role, deviceType: "web" });
            this._broadcastMediaState();
            this.requestHistory()

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
        this._reconnectTimer = setTimeout(() => {
            if (this._intentionalClose) return;
            this._connectWebSocket();
        }, delay);
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
        // Filter self-echoes for media state / signaling types.
        if (msg.userId && msg.userId === this.userId) {
            const selfFilterTypes = new Set(['media_state_updated', 'chat_message']);
            if (!selfFilterTypes.has(msg.type)) return;
            if (msg.type === 'media_state_updated') return; // always filter self
        }

        switch (msg.type) {
            case 'chat_message': {
                if (msg.userId === this.userId) break; // don't re-add own echoed messages
                const m: ChatMessage = {
                    text: msg.text,
                    senderName: msg.senderName || 'Unknown',
                    role: msg.role || 'patient',
                    userId: msg.userId,
                    createdAt: msg.createdAt || Date.now(),
                };
                this.messages = [...this.messages, m];
                this._callbacks.onMessages?.([...this.messages]);
                break;
            }

            case 'chat_history': {
                this.messages = Array.isArray(msg.messages) ? msg.messages : [];
                this._callbacks.onMessages?.([...this.messages]);
                break;
            }

            case 'media_state_updated': {
                if (msg.userId === this.userId) break;
                // SUPPLEMENTARY hint only. Mic has no black-frame failure mode, so
                // take it directly. Camera state is owned by the LiveKit track
                // lifecycle — the WS may only SUPPRESS remote video (turn it off
                // early), never force it on (which is exactly what paints a black
                // frame when the real track is muted/absent).
                this._remoteMicOn = !!msg.micEnabled;
                if (!msg.cameraEnabled && this._remoteCameraOn) {
                    this._remoteCameraOn = false;
                    this._emitRemoteMedia();
                }
                this._emitRemoteMediaState();
                break;
            }

            case 'session_ready':
            case 'peer_joined': {
                // Supplementary signaling hint — confirm against the LiveKit room.
                this._refreshPeerPresence('ws-peer-joined');
                break;
            }

            case 'peer_left':
            case 'peer_disconnected': {
                // Don't blindly drop presence: trust the LiveKit room. If the peer
                // is genuinely gone the room already fired ParticipantDisconnected.
                this._refreshPeerPresence('ws-peer-left');
                break;
            }

            case 'session_ended': {
                this._callbacks.onSessionEnded?.();
                break;
            }

            case "device_switched": {
                if (msg.toDevice === 'mobile' && msg.fromDevice === 'web') {
                    this.callbacks.onDeviceSwitched?.();
                }
                break;

            }

            default:
                break;
        }
    }
}

// Singleton
export const livekitManager = new LiveKitManager();
