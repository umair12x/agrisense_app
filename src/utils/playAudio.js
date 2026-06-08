import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";

let activePlayer = null;

const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Could not read audio data"));
        return;
      }
      resolve(result.includes(",") ? result.split(",")[1] : result);
    };
    reader.onerror = () => reject(new Error("Could not read audio data"));
    reader.readAsDataURL(blob);
  });

export async function playAudioBlob(blob, extension = "mp3", { onPlaybackEnd } = {}) {
  const base64 = await blobToBase64(blob);
  const uri = `${FileSystem.cacheDirectory}tts-${Date.now()}.${extension}`;

  await FileSystem.writeAsStringAsync(uri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  await setAudioModeAsync({ playsInSilentMode: true });

  if (activePlayer) {
    try {
      if (typeof activePlayer.pause === "function") {
        activePlayer.pause();
      }
      activePlayer.release();
    } catch {
      // ignore cleanup errors
    }
    activePlayer = null;
  }

  const player = createAudioPlayer({ uri });
  activePlayer = player;
  player.play();

  if (onPlaybackEnd) {
    const poll = setInterval(() => {
      if (activePlayer !== player) {
        clearInterval(poll);
        return;
      }
      try {
        const status = player.currentStatus ?? player.status ?? {};
        const didFinish =
          status.didJustFinish ||
          (status.duration > 0 && status.currentTime >= status.duration - 0.2);
        if (didFinish) {
          clearInterval(poll);
          if (activePlayer === player) {
            onPlaybackEnd();
          }
        }
      } catch {
        clearInterval(poll);
      }
    }, 400);

    setTimeout(() => {
      clearInterval(poll);
      if (activePlayer === player) {
        onPlaybackEnd();
      }
    }, 120000);
  }

  return player;
}

export function releaseActiveAudio() {
  if (!activePlayer) return;
  try {
    if (typeof activePlayer.pause === "function") {
      activePlayer.pause();
    }
    activePlayer.release();
  } catch {
    // ignore
  }
  activePlayer = null;
}

export const stopActiveAudio = releaseActiveAudio;

export function isAudioPlaying() {
  return activePlayer != null;
}
