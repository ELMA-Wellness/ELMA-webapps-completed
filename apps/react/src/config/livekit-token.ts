import axios from 'axios';

export type SessionRole = 'patient' | 'therapist';

export interface LiveKitCredentials {
 
  url: string;
  token: string;
  
}

const LIVEKIT_URL = 'wss://elma-ig1ydbt3.livekit.cloud';

/**
 * Your backend endpoint that mints a LiveKit JWT for the participant.
 * POST { roomName, participantName, participantIdentity } → { token: string }
 */
const LIVEKIT_TOKEN_ENDPOINT = 'https://elma-dsb6fne7c0bqezaj.centralindia-01.azurewebsites.net/api/livekit/token';

/** Your existing signaling WebSocket */

export class LiveKitTokenError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'LiveKitTokenError';
    this.status = status;
  }
}

/**
 * Fetches a LiveKit room JWT from the backend token API.
 */
export async function fetchLiveKitToken(
  sessionCode: string,
  userId: string,
  role: SessionRole,
): Promise<LiveKitCredentials> {
  console.log("params",sessionCode,userId,role)
  const tokenApi = LIVEKIT_TOKEN_ENDPOINT?.trim();
  const fallbackUrl = LIVEKIT_URL?.trim();

  if (!tokenApi) {
    throw new LiveKitTokenError(
      'LiveKit token API is not configured. Set EXPO_PUBLIC_LIVEKIT_TOKEN_API on the server and in app config.',
    );
  }

  try {
    const response = await axios.post(
      tokenApi,
      { sessionCode, userId, role },
      { timeout: 15000 },
    );

    const data=response.data.data

    if (!data?.token) {
      throw new LiveKitTokenError('Token API returned an empty token.');
    }

    return {
      url: data.url?.trim() || fallbackUrl || '',
      token: data.token,
    };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const msg =
        (err.response?.data as { message?: string })?.message ||
        err.message ||
        'Failed to fetch LiveKit token';
      throw new LiveKitTokenError(msg, status);
    }
    throw err;
  }
}
