import { FC, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAudioRecording } from "../../hooks/useAudioRecording";
import { useAudioPlayback } from "../../hooks/useAudioPlayback";
import { useTypingAnimation } from "../../hooks/useTypingAnimation";

interface InterviewControlsProps {
	jobId: string;
	candidateId: string;
	onInterviewId?: (id: string) => void;
	onTerminate?: (interviewId: string) => void;
	onSpeakingChange?: (isSpeaking: boolean) => void;
	onRecordingChange?: (isRecording: boolean) => void;
}

const InterviewControls: FC<InterviewControlsProps> = ({
	jobId,
	candidateId,
	onInterviewId,
	onTerminate,
	onSpeakingChange,
	onRecordingChange,
}) => {
	const [interviewId, setInterviewId] = useState<string>("");
	const [isTerminated, setIsTerminated] = useState(false);
	const [apiKey, setApiKey] = useState<string>("");
	const [interviewGenerated, setInterviewGenerated] = useState(false);
	const [showRetryMessage, setShowRetryMessage] = useState(false);
	const [currentQuestion, setCurrentQuestion] = useState<string>("");
	
	const { playAudioMessage } = useAudioPlayback({ apiKey });
	const { isTyping, currentText, startTypingAnimation, cleanup: cleanupTyping } = useTypingAnimation();
	
	const {
		isRecording,
		recordingSeconds,
		isTranscribing,
		formatTimer,
		startRecording,
		stopRecording,
		toggleRecording,
		cleanup: cleanupRecording
	} = useAudioRecording({
		apiKey,
		onTranscriptionComplete: async (text: string) => {
			setShowRetryMessage(false);
			await sendMessage(text);
		},
		onTranscriptionFailed: () => {
			setShowRetryMessage(true);
		}
	});

	// Update parent components when states change
	useEffect(() => {
		if (onRecordingChange) onRecordingChange(isRecording);
	}, [isRecording, onRecordingChange]);

	useEffect(() => {
		if (onSpeakingChange) onSpeakingChange(isTyping);
	}, [isTyping, onSpeakingChange]);

	// Update current question when typing animation text changes
	useEffect(() => {
		setCurrentQuestion(currentText);
	}, [currentText]);

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
	}, [isRecording, isTerminated, interviewId, startRecording, stopRecording]);

	const generateInterview = useCallback(async () => {
		if (interviewGenerated) return;
		
		setInterviewGenerated(true);
		
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
				`${(import.meta as any).env.VITE_APP_API_BASE_URL}/Interviews/generate-interview/${candidateId}/${jobId}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (res.data?.success) {
				const data = res.data.data;
				setInterviewId(data.interviewId);
				if (onInterviewId) onInterviewId(data.interviewId);

				await Promise.all([
					playAudioMessage(data.interviewStarter),
					startTypingAnimation(data.interviewStarter)
				]);
			} else {
				console.error("Error starting interview:", res.data?.message || "Unknown error");
				setInterviewGenerated(false);
			}
		} catch (error: any) {
			console.error("Interview generation error:", error);
			setInterviewGenerated(false);
		}
	}, [candidateId, jobId, onInterviewId, interviewGenerated, playAudioMessage, startTypingAnimation]);

	useEffect(() => {
		if (candidateId && jobId && !interviewGenerated) {
			generateInterview();
		}
	}, [candidateId, jobId, generateInterview, interviewGenerated]);

	const sendMessage = useCallback(async (messageText: string) => {
		if (!messageText.trim() || !interviewId || isTerminated) return;

		setShowRetryMessage(false);

		try {
			const body = {
				text: currentQuestion,
				answer: messageText,
			};

			const token = localStorage.getItem("kt-auth-react-v");
			if (!token) throw new Error("Missing auth token");

			const res = await axios.post(
				`${(import.meta as any).env.VITE_APP_API_BASE_URL}/Interviews/next-question/${interviewId}`,
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
					await Promise.all([
						playAudioMessage(data.question),
						startTypingAnimation(data.question)
					]);
				}
			} else {
				console.error("Error retrieving next question:", res.data.message);
			}
		} catch (error: any) {
			console.error("Error sending message:", error);
		}
	}, [currentQuestion, interviewId, isTerminated, onTerminate, playAudioMessage, startTypingAnimation]);

	useEffect(() => {
		return () => {
			cleanupRecording();
			cleanupTyping();
		};
	}, [cleanupRecording, cleanupTyping]);

	return (
		<div className="interview-controls">
			<div className="controls-container">
				{currentQuestion && (
					<div className="question-display">
						<div className="question-text">
							{currentQuestion}
							{isTyping && (
								<span className="typing-cursor">|</span>
							)}
						</div>
					</div>
				)}

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

			<style>{`
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

				.question-display {
					background: rgba(255, 255, 255, 0.1);
					border-radius: 12px;
					padding: 20px;
					max-width: 600px;
					text-align: center;
					backdrop-filter: blur(10px);
					border: 1px solid rgba(255, 255, 255, 0.2);
				}

				.question-text {
					color: white;
					font-size: 1.2rem;
					font-weight: 500;
					line-height: 1.5;
				}

				.typing-cursor {
					animation: blink 1s infinite;
					font-weight: normal;
				}

				@keyframes blink {
					0%, 50% { opacity: 1; }
					51%, 100% { opacity: 0; }
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

					.question-display {
						padding: 16px;
						max-width: 90vw;
					}

					.question-text {
						font-size: 1.1rem;
					}
				}
			`}</style>
		</div>
	);
};

export default InterviewControls;