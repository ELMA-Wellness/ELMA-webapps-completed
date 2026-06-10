export type SessionRole = 'patient' | 'therapist';

export type ConnectionPhase = 'connected' | 'unstable' | 'reconnecting' | 'disconnected';

export interface ConnectionQuality {
  phase: ConnectionPhase;
  localWeak: boolean;
  remoteWeak: boolean;
  rttMs: number | null;
  packetLoss: number | null;
}

export type ChatSignalMessage = {
  type: string;
  sessionCode?: string | null;
  userId?: string | null;
  role?: SessionRole;
  text?: string;
  messageId?: string | number;
  messages?: ChatSignalMessage[];
  micEnabled?: boolean;
  cameraEnabled?: boolean;
  message?: string;
  // ── Client-side delivery bookkeeping (never sent to the server) ──────────────
  // `pending` marks a locally-echoed message that has not yet been confirmed by
  // a server broadcast/history. `sentAt` is the local send timestamp used for
  // ordering and reconciliation. `failed` marks a send the server never
  // acknowledged within the delivery timeout (surfaces undelivered messages in
  // the UI instead of silently pretending they were delivered). All three are
  // stripped from any outgoing payload.
  pending?: boolean;
  sentAt?: number;
  failed?: boolean;
};

export type MessagesCallback = (messages: ChatSignalMessage[]) => void;
export type SessionErrorCallback = (message: string) => void;
export type PeerDisconnectCallback = () => void;
