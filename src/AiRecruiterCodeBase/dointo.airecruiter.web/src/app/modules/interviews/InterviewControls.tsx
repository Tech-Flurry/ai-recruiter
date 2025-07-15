import * as React from "react";
import { FC, useState, useRef, useEffect } from "react";
import axios from "axios";
import OpenAI from "openai";

type Message = {
	user: "riki" | "candidate";
	text: string;
	time: string;
};

interface InterviewControlsProps {
	jobId: string;
	candidateId: string;
	onInterviewId?: (id: string) => void;
	onTerminate?: (interviewId: string) => void;
	onSpeakingChange?: (isSpeaking: boolean) => void;
	onRecordingChange?: (isRecording: boolean) => void;
	onMessagesChange?: (messages: Message[]) => void;
}

const InterviewControls: FC<InterviewControlsProps> = ({
	jobId,
	candidateId,
	onInterviewId,
	onTerminate,
	onSpeakingChange,
	onRecordingChange,
	onMessagesChange,
}) => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [interviewId, setInterviewId] = useState<string>("");
	const [isTerminated, setIsTerminated] = useState(false);
	const [apiKey, setApiKey] = useState<string>("");
	
	// Recording states
	const [isRecording, setIsRecording] = useState(false);
	const [recordingSeconds, setRecordingSeconds] = useState(0);
	const [isTranscribing, setIsTranscribing] = useState(false);
	const [isTyping, setIsTyping] = useState(false);
	const [showRetryMessage, setShowRetryMessage] = useState(false);
	
	// Recording refs
	const mediaStreamRef = useRef<MediaStream | null>(null);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const chunksRef = useRef<Blob[]>([]);
	const timerRef = useRef<number | null>(null);
	const typingIntervalRef = useRef<number | null>(null);

	// Update parent components when states change
	useEffect(() => {
		if (onRecordingChange) onRecordingChange(isRecording);
	}, [isRecording, onRecordingChange]);

	useEffect(() => {
		if (onSpeakingChange) onSpeakingChange(isTyping);
	}, [isTyping, onSpeakingChange]);

	useEffect(() => {
		if (onMessagesChange) onMessagesChange(messages);
	}, [messages, onMessagesChange]);

	// Space bar event listeners
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.code === "Space" && !isRecording && !isTerminated && interviewId) {
				e.preventDefault();
				startRecording();
			}
		};

		const handleKeyUp = (e: KeyboardEvent) => {
			if (e.code === "Space" && isRecording) {
				e.preventDefault();
				stopRecording();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		document.addEventListener("keyup", handleKeyUp);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("keyup", handleKeyUp);
		};
	}, [isRecording, isTerminated, interviewId]);

	useEffect(() => {
		const generateInterview = async () => {
			const loadingMsg: Message = {
				user: "riki",
				text: "...",
				time: "Loading",
			};
			setMessages([loadingMsg]);

			try {
				const token = localStorage.getItem("kt-auth-react-v");
				if (!token) throw new Error("Missing auth token");
				const keyRes = await axios.get(
					`${(import.meta as any).env.VITE_APP_API_BASE_URL}/Interviews/get-api-key`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);
				setApiKey(keyRes.data || "");
				const res = await axios.get(
					`${(import.meta as any).env.VITE_APP_API_BASE_URL
					}/Interviews/generate-interview/${candidateId}/${jobId}`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				setMessages([]);

				if (res.data?.success) {
					const data = res.data.data;
					setInterviewId(data.interviewId);
					if (onInterviewId) onInterviewId(data.interviewId);

					// Start typing animation and play audio simultaneously
					await Promise.all([
						playAudioMessage(data.interviewStarter),
						startTypingAnimation(data.interviewStarter)
					]);
				} else {
					setMessages([
						{
							user: "riki",
							text: res.data?.message || "Error starting interview.",
							time: "Just now",
						},
					]);
				}
			} catch (error: any) {
				console.error("Interview generation error:", error);
				setMessages([
					{
						user: "riki",
						text: axios.isAxiosError(error)
							? error.response?.data?.message || "Server error"
							: "Internal server error",
						time: "Just now",
					},
				]);
			}
		};

		if (candidateId && jobId) {
			generateInterview();
		}
	}, [candidateId, jobId, onInterviewId]);

	const startTypingAnimation = async (text: string) => {
		setIsTyping(true);
		
		// Add typing message
		const typingMessage: Message = {
			user: "riki",
			text: "",
			time: "Just now",
		};
		setMessages(prev => [...prev, typingMessage]);

		return new Promise<void>((resolve) => {
			let currentIndex = 0;
			const typeSpeed = 50; // milliseconds per character
			
			typingIntervalRef.current = window.setInterval(() => {
				if (currentIndex < text.length) {
					const currentText = text.substring(0, currentIndex + 1);
					
					// Update the last message with current typing text
					setMessages(prev => {
						const updated = [...prev];
						updated[updated.length - 1] = {
							...updated[updated.length - 1],
							text: currentText
						};
						return updated;
					});
					
					currentIndex++;
				} else {
					if (typingIntervalRef.current) {
						clearInterval(typingIntervalRef.current);
						typingIntervalRef.current = null;
					}
					setIsTyping(false);
					resolve();
				}
			}, typeSpeed);
		});
	};

	const sendMessage = async (messageText: string) => {
		if (!messageText.trim() || !interviewId || isTerminated) return;

		const newMessages: Message[] = [
			...messages,
			{ user: "candidate", text: messageText, time: "Just now" },
		];
		setMessages(newMessages);
		setShowRetryMessage(false);

		const lastrikiMsg = [...messages].reverse().find((m) => m.user === "riki");

		try {
			const body = {
				text: lastrikiMsg?.text || "",
				answer: messageText,
			};

			const token = localStorage.getItem("kt-auth-react-v");
			if (!token) throw new Error("Missing auth token");

			const res = await axios.post(
				`${(import.meta as any).env.VITE_APP_API_BASE_URL
				}/Interviews/next-question/${interviewId}`,
				body,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);

			if (res.data?.success) {
				const data = res.data.data;
				if (data.terminate) {
					setIsTerminated(true);
					const terminationMessage = "Interview has ended. Thank you!";
					await Promise.all([
						playAudioMessage(terminationMessage),
						startTypingAnimation(terminationMessage)
					]);
					if (onTerminate && interviewId) {
						onTerminate(interviewId);
					}
				} else {
					// Start typing animation and play audio simultaneously
					await Promise.all([
						playAudioMessage(data.question),
						startTypingAnimation(data.question)
					]);
				}
			} else {
				const errorMessage = res.data.message || "Error retrieving next question.";
				await startTypingAnimation(errorMessage);
			}
		} catch (error: any) {
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "Server error"
				: "Internal server error";
			await startTypingAnimation(errorMessage);
		}
	};

	const padStart = (str: string, targetLength: number, padString: string) => {
		if (str.length >= targetLength) return str;
		const padLength = targetLength - str.length;
		const fullPad = padString.repeat(Math.ceil(padLength / padString.length));
		return fullPad.slice(0, padLength) + str;
	};

	const formatTimer = (totalSeconds: number): string => {
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;
		
		if (hours > 0) {
			return `${padStart(hours.toString(), 2, '0')}:${padStart(minutes.toString(), 2, '0')}:${padStart(seconds.toString(), 2, '0')}`;
		}
		return `${padStart(minutes.toString(), 2, '0')}:${padStart(seconds.toString(), 2, '0')}`;
	};

	const startRecording = async () => {
		try {
			setRecordingSeconds(0);
			chunksRef.current = [];
			setShowRetryMessage(false);
			
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
				
				// Transcribe the audio
				await transcribeAudio(audioBlob);
				
				// Clean up
				if (mediaStreamRef.current) {
					mediaStreamRef.current.getTracks().forEach(track => track.stop());
					mediaStreamRef.current = null;
				}
			};
			
			mediaRecorder.start();
			setIsRecording(true);
			
			// Start timer
			timerRef.current = window.setInterval(() => {
				setRecordingSeconds(prev => prev + 1);
			}, 1000);
			
		} catch (error) {
			console.error("Error starting recording:", error);
		}
	};

	const stopRecording = () => {
		if (mediaRecorderRef.current && isRecording) {
			mediaRecorderRef.current.stop();
			setIsRecording(false);
			
			// Stop timer
			if (timerRef.current) {
				clearInterval(timerRef.current);
				timerRef.current = null;
			}
		}
	};

	const toggleRecording = () => {
		if (isRecording) {
			stopRecording();
		} else {
			startRecording();
		}
	};

	const playAudioMessage = async (text: string) => {
		if (!apiKey) return;

		try {
			const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
			const audio = await openai.audio.speech.create({
				model: "gpt-4o-mini-tts",
				voice: "nova",
				input: text,
				instructions: "Speak like you're a professional recruiter but you should sound friendly to keep the candidate at ease",
			});
			
			// Convert the response to a Blob and play it in the browser
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
	};

	const transcribeAudio = async (audioBlob: Blob) => {
		if (!apiKey) return;
		
		setIsTranscribing(true);
		
		try {
			const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
			
			// Create a File object from the Blob
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
				// Automatically send the transcribed message
				await sendMessage(transcribedText);
			} else {
				// Show retry message if transcription is empty
				setShowRetryMessage(true);
			}
		} catch (error) {
			console.error("Error transcribing audio:", error);
			// Show retry message if transcription fails
			setShowRetryMessage(true);
		} finally {
			setIsTranscribing(false);
		}
	};

	// Clean up on unmount
	useEffect(() => {
		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
			if (typingIntervalRef.current) {
				clearInterval(typingIntervalRef.current);
			}
			if (mediaStreamRef.current) {
				mediaStreamRef.current.getTracks().forEach(track => track.stop());
			}
		};
	}, []);

	return (
		<div className="interview-controls">
			<div className="controls-container">
				{/* Status indicators */}
				<div className="status-indicators">
					{isRecording && (
						<div className="status-badge recording">
							<div className="status-dot"></div>
							<span>Recording {formatTimer(recordingSeconds)}</span>
						</div>
					)}
					{isTranscribing && (
						<div className="status-badge transcribing">
							<div className="spinner"></div>
							<span>Transcribing...</span>
						</div>
					)}
					{showRetryMessage && (
						<div className="status-badge retry">
							<i className="fas fa-exclamation-triangle"></i>
							<span>Please speak again</span>
						</div>
					)}
				</div>

				{/* Main controls */}
				<div className="main-controls">
					<button
						className={`control-btn record-btn ${isRecording ? 'recording' : ''}`}
						onClick={toggleRecording}
						disabled={!interviewId || isTerminated || isTranscribing}
					>
						<div className="btn-content">
							<i className={`fas ${isRecording ? 'fa-stop' : 'fa-microphone'}`}></i>
							<span>{isRecording ? 'Stop' : 'Record'}</span>
						</div>
						<div className="btn-subtitle">Hold Space</div>
					</button>
				</div>
			</div>

			<style jsx>{`
				.interview-controls {
					display: flex;
					flex-direction: column;
					align-items: center;
					gap: 16px;
				}

				.controls-container {
					display: flex;
					flex-direction: column;
					align-items: center;
					gap: 16px;
				}

				.status-indicators {
					display: flex;
					gap: 12px;
					flex-wrap: wrap;
					justify-content: center;
				}

				.status-badge {
					display: flex;
					align-items: center;
					gap: 8px;
					padding: 8px 16px;
					border-radius: 20px;
					font-size: 0.9rem;
					font-weight: 500;
					color: white;
				}

				.status-badge.recording {
					background: rgba(239, 68, 68, 0.9);
					border: 1px solid #ef4444;
				}

				.status-badge.transcribing {
					background: rgba(59, 130, 246, 0.9);
					border: 1px solid #3b82f6;
				}

				.status-badge.retry {
					background: rgba(245, 158, 11, 0.9);
					border: 1px solid #f59e0b;
				}

				.status-dot {
					width: 8px;
					height: 8px;
					background: white;
					border-radius: 50%;
					animation: pulse 1s infinite;
				}

				.spinner {
					width: 12px;
					height: 12px;
					border: 2px solid transparent;
					border-top: 2px solid white;
					border-radius: 50%;
					animation: spin 1s linear infinite;
				}

				@keyframes pulse {
					0%, 100% { opacity: 1; }
					50% { opacity: 0.5; }
				}

				@keyframes spin {
					0% { transform: rotate(0deg); }
					100% { transform: rotate(360deg); }
				}

				.main-controls {
					display: flex;
					gap: 16px;
				}

				.control-btn {
					display: flex;
					flex-direction: column;
					align-items: center;
					gap: 4px;
					padding: 16px 24px;
					background: rgba(255, 255, 255, 0.1);
					border: 2px solid rgba(255, 255, 255, 0.2);
					border-radius: 12px;
					color: white;
					font-weight: 500;
					cursor: pointer;
					transition: all 0.3s ease;
					backdrop-filter: blur(10px);
				}

				.control-btn:hover {
					background: rgba(255, 255, 255, 0.2);
					border-color: rgba(255, 255, 255, 0.3);
					transform: translateY(-2px);
				}

				.control-btn:disabled {
					opacity: 0.5;
					cursor: not-allowed;
					transform: none;
				}

				.control-btn.recording {
					background: rgba(239, 68, 68, 0.2);
					border-color: #ef4444;
				}

				.control-btn.recording:hover {
					background: rgba(239, 68, 68, 0.3);
				}

				.btn-content {
					display: flex;
					align-items: center;
					gap: 8px;
					font-size: 1.1rem;
				}

				.btn-content i {
					font-size: 1.3rem;
				}

				.btn-subtitle {
					font-size: 0.8rem;
					opacity: 0.7;
				}

				@media (max-width: 768px) {
					.controls-container {
						gap: 12px;
					}

					.control-btn {
						padding: 12px 20px;
					}

					.btn-content {
						font-size: 1rem;
					}

					.btn-content i {
						font-size: 1.2rem;
					}
				}
			`}</style>
		</div>
	);
};

export default InterviewControls;