import { useState, useRef, useCallback } from 'react';
import OpenAI from 'openai';

interface UseAudioRecordingProps {
  apiKey: string;
  onTranscriptionComplete: (text: string) => void;
  onTranscriptionFailed: () => void;
}

export const useAudioRecording = ({ apiKey, onTranscriptionComplete, onTranscriptionFailed }: UseAudioRecordingProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const formatTimer = useCallback((totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setRecordingSeconds(0);
      chunksRef.current = [];
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        await transcribeAudio(audioBlob);
        
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
          mediaStreamRef.current = null;
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      timerRef.current = window.setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    if (!apiKey) return;
    
    setIsTranscribing(true);
    
    try {
      const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
      
      const audioFile = new File([audioBlob], "recording.wav", {
        type: "audio/wav",
      });
      
      const transcription = await openai.audio.transcriptions.create({
        model: "whisper-1",
        file: audioFile,
        response_format: "text",
      });
      
      const transcribedText = transcription || "";
      
      if (transcribedText.trim()) {
        onTranscriptionComplete(transcribedText);
      } else {
        onTranscriptionFailed();
      }
    } catch (error) {
      console.error("Error transcribing audio:", error);
      onTranscriptionFailed();
    } finally {
      setIsTranscribing(false);
    }
  }, [apiKey, onTranscriptionComplete, onTranscriptionFailed]);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
  }, []);

  return {
    isRecording,
    recordingSeconds,
    isTranscribing,
    formatTimer,
    startRecording,
    stopRecording,
    toggleRecording,
    cleanup
  };
};