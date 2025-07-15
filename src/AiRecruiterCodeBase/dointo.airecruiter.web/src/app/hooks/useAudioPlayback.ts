import { useCallback } from 'react';
import OpenAI from 'openai';

interface UseAudioPlaybackProps {
  apiKey: string;
}

export const useAudioPlayback = ({ apiKey }: UseAudioPlaybackProps) => {
  const playAudioMessage = useCallback(async (text: string) => {
    if (!apiKey) return;

    try {
      const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
      const audio = await openai.audio.speech.create({
        model: "tts-1",
        voice: "nova",
        input: text,
      });
      
      let audioBlob: Blob;
      if (audio.body && typeof audio.body.getReader === "function") {
        const response = audio as Response;
        audioBlob = await response.blob();
      } else if ((audio as any).blob) {
        audioBlob = await (audio as any).blob();
      } else {
        throw new Error("Unsupported audio response format");
      }

      const url = URL.createObjectURL(audioBlob);
      const audioElement = new Audio(url);
      audioElement.play();
      audioElement.onended = () => URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  }, [apiKey]);

  return {
    playAudioMessage
  };
};