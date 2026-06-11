// audio.ts

let sessionStartAudio: HTMLAudioElement | null = null;
let hasPlayed = false;

const SESSION_START_URL =
  "https://firebasestorage.googleapis.com/v0/b/elma-react-native-app.firebasestorage.app/o/app-sounds%2Fcall_start.mp3?alt=media&token=020e5286-650c-4987-9f7b-bb0201a8d821";

export const playSessionStartSoundOnce = async (
  needPlayAgain = false
) => {
  if (hasPlayed && !needPlayAgain) return;

  hasPlayed = true;

  try {
    // Cleanup old instance
    if (sessionStartAudio) {
      sessionStartAudio.pause();
      sessionStartAudio.currentTime = 0;
      sessionStartAudio = null;
    }

    sessionStartAudio = new Audio(SESSION_START_URL);

    sessionStartAudio.loop = false;
    sessionStartAudio.volume = 0.6;
    sessionStartAudio.preload = "auto";

    sessionStartAudio.onended = () => {
      sessionStartAudio = null;
    };

    await sessionStartAudio.play();
  } catch (error) {
    console.error("Failed to play session start sound:", error);
  }
};

export const stopSessionStartSound = () => {
  if (sessionStartAudio) {
    sessionStartAudio.pause();
    sessionStartAudio.currentTime = 0;
    sessionStartAudio = null;
  }
};

export const resetCelebrationSound = () => {
  hasPlayed = false;
};

// sessionEndAudio.ts

let splashSound: HTMLAudioElement | null = null;

const SESSION_END_URL =
  "https://firebasestorage.googleapis.com/v0/b/elma-react-native-app.firebasestorage.app/o/app-sounds%2Fcall_end.mp3?alt=media&token=3447793a-48a7-4746-9282-eb91abccdd69";

export const playSessionEndMusic = async () => {
  if (splashSound) return;

  try {
    splashSound = new Audio(SESSION_END_URL);

    splashSound.loop = true;
    splashSound.volume = 0.5;
    splashSound.preload = "auto";

    await splashSound.play();
  } catch (error) {
    console.error("Failed to play session end music:", error);
    splashSound = null;
  }
};

export const stopSessionEndMusic = async () => {
  if (!splashSound) return;

  try {
    splashSound.pause();
    splashSound.currentTime = 0;

    splashSound.src = "";
    splashSound.load();
  } catch (e) {
    // ignore errors during fast navigation
  }

  splashSound = null;
};