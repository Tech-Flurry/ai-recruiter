# Interview Hooks

This directory contains shared React hooks for the interview functionality.

## useAudioRecording

Manages audio recording, transcription, and timer functionality.

**Parameters:**
- `apiKey`: OpenAI API key for transcription
- `onTranscriptionComplete`: Callback when transcription succeeds
- `onTranscriptionFailed`: Callback when transcription fails

**Returns:**
- `isRecording`: Boolean indicating if recording is active
- `recordingSeconds`: Number of seconds recorded
- `isTranscribing`: Boolean indicating if transcription is in progress
- `formatTimer`: Function to format seconds as HH:MM:SS or MM:SS
- `startRecording`: Function to start recording
- `stopRecording`: Function to stop recording
- `toggleRecording`: Function to toggle recording state
- `cleanup`: Function to cleanup resources

## useAudioPlayback

Manages text-to-speech audio playback using OpenAI.

**Parameters:**
- `apiKey`: OpenAI API key for text-to-speech

**Returns:**
- `playAudioMessage`: Function to play text as audio

## useTypingAnimation

Manages typing animation effects for text display.

**Returns:**
- `isTyping`: Boolean indicating if typing animation is active
- `currentText`: Current text being displayed during animation
- `startTypingAnimation`: Function to start typing animation for given text
- `cleanup`: Function to cleanup timers

## Usage Example

```typescript
import { useAudioRecording, useAudioPlayback, useTypingAnimation } from '../../hooks';

const { playAudioMessage } = useAudioPlayback({ apiKey });
const { isTyping, currentText, startTypingAnimation } = useTypingAnimation();
const { isRecording, startRecording, stopRecording } = useAudioRecording({
  apiKey,
  onTranscriptionComplete: (text) => console.log('Transcribed:', text),
  onTranscriptionFailed: () => console.log('Transcription failed')
});
```