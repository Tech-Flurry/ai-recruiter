import * as React from "react";
import { FC, useState, useRef, useEffect } from "react";
import clsx from "clsx";
import axios from "axios";
import { toAbsoluteUrl } from "../../../_metronic/helpers";
import OpenAI from "openai";

type Message = {
	user: "riki" | "candidate";
	text: string;
	time: string;
};

const rikiAvatar = "avatars/300-12.jpg";
const candidateAvatar = "avatars/blank.png";

interface InterviewChatProps {
	jobId: string;
	candidateId: string;
	onInterviewId?: (id: string) => void;
	onTerminate?: (interviewId: string) => void;
}

const InterviewChat: FC<InterviewChatProps> = (props) => {
	const {
		jobId,
		candidateId,
		onInterviewId,
		onTerminate,
	} = props;
	const [messages, setMessages] = useState<Message[]>([]);
	const [message, setMessage] = useState("");
	const [interviewId, setInterviewId] = useState<string>("");
	const [isTerminated, setIsTerminated] = useState(false);
	const [apiKey, setApiKey] = useState<string>("");
	
	// Recording states
	const [isRecording, setIsRecording] = useState(false);
	const [recordingSeconds, setRecordingSeconds] = useState(0);
	const [isTranscribing, setIsTranscribing] = useState(false);
	const [showTextArea, setShowTextArea] = useState(false);
	const [isTyping, setIsTyping] = useState(false);
	const [typingText, setTypingText] = useState("");
	
	// Recording refs
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const mediaStreamRef = useRef<MediaStream | null>(null);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const chunksRef = useRef<Blob[]>([]);
	const timerRef = useRef<number | null>(null);
	const typingIntervalRef = useRef<number | null>(null);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

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
		setTypingText("");
		
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
					setTypingText(currentText);
					
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
					setTypingText("");
					resolve();
				}
			}, typeSpeed);
		});
	};

	const sendMessage = async (messageText: string) => {
		if (!messageText.trim() || !interviewId || isTerminated) return;

		let lastRikiMsg: Message | undefined;
		setMessages(prevMessages => {
			lastRikiMsg = [...prevMessages].reverse().find((m) => m.user === "riki");
			return [
				...prevMessages,
				{ user: "candidate", text: messageText, time: "Just now" },
			];
		});
		setMessage("");
		setShowTextArea(false);

		// Wait for setMessages to complete before using lastRikiMsg
		const body = {
			text: lastRikiMsg?.text || "",
			answer: messageText,
		};

		try {
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

	const onEnterPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage(message);
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
				setMessage(transcribedText);
				// Automatically send the transcribed message
				await sendMessage(transcribedText);
			} else {
				// Show text area if transcription is empty
				setShowTextArea(true);
			}
		} catch (error) {
			console.error("Error transcribing audio:", error);
			// Show text area if transcription fails
			setShowTextArea(true);
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
		<div className="card-body" id="kt_interview_chat_body">
			<div
				className={clsx("scroll-y me-n5 pe-5")}
				style={{ maxHeight: 400, minHeight: 200, overflowY: "auto" }}
				data-kt-element="messages"
			>
				{messages.map((msg, idx) => {
					const isRiki = msg.user === "riki";
					const avatar = isRiki ? rikiAvatar : candidateAvatar;
					const name = isRiki ? "Riki" : "You";
					const state = isRiki ? "info" : "primary";
					const isCurrentlyTyping = isRiki && isTyping && idx === messages.length - 1;
					
					return (
						<div
							key={idx}
							className={clsx(
								"d-flex",
								isRiki ? "justify-content-start" : "justify-content-end",
								"mb-10"
							)}
						>
							<div
								className={clsx(
									"d-flex flex-column align-items",
									isRiki ? "align-items-start" : "align-items-end"
								)}
							>
								<div className="d-flex align-items-center mb-2">
									{isRiki ? (
										<>
											<div className="symbol symbol-35px symbol-circle">
												<img
													alt="Riki"
													src={toAbsoluteUrl(`media/${avatar}`)}
												/>
											</div>
											<div className="ms-3">
												<span className="fs-5 fw-bolder text-gray-900 me-1">
													{name}
												</span>
												<span className="text-muted fs-7 mb-1">{msg.time}</span>
											</div>
										</>
									) : (
										<>
											<div className="me-3">
												<span className="text-muted fs-7 mb-1">{msg.time}</span>
												<span className="fs-5 fw-bolder text-gray-900 ms-1">
													{name}
												</span>
											</div>
											<div className="symbol symbol-35px symbol-circle">
												<img alt="You" src={toAbsoluteUrl(`media/${avatar}`)} />
											</div>
										</>
									)}
								</div>
								<div
									className={clsx(
										"p-5 rounded",
										`bg-light-${state}`,
										"text-gray-900 fw-bold mw-lg-400px",
										isRiki ? "text-start" : "text-end"
									)}
									data-kt-element="message-text"
								>
									{msg.text}
									{isCurrentlyTyping && (
										<span className="typing-cursor ms-1">|</span>
									)}
								</div>
							</div>
						</div>
					);
				})}
				<div ref={messagesEndRef} />
			</div>

			<div className="card-footer pt-4" id="kt_interview_chat_footer">
				{showTextArea && (
					<textarea
						className="form-control form-control-flush mb-3"
						rows={1}
						data-kt-element="input"
						placeholder="Type your answer..."
						value={message}
						onChange={(e) => setMessage(e.target.value)]
						onKeyDown={onEnterPress}
						disabled={!interviewId || isTerminated || isRecording}
					/>
				)}
				<div className="d-flex flex-stack align-items-center">
					<div className="d-flex align-items-center">
						{isRecording && (
							<div className="me-3">
								<span className="badge badge-light-primary fs-7">
									<i className="fas fa-circle text-danger me-1" style={{ fontSize: '8px' }}></i>
									Recording {formatTimer(recordingSeconds)}
								</span>
							</div>
						)}
						{isTranscribing && (
							<div className="me-3">
								<span className="badge badge-light-info fs-7">
									<i className="fas fa-spinner fa-spin me-1"></i>
									Transcribing...
								</span>
							</div>
						)}
					</div>
					<div className="d-flex align-items-center">
						<button
							className="btn btn-sm btn-light-primary me-2"
							type="button"
							onClick={toggleRecording}
							disabled={!interviewId || isTerminated || isTranscribing}
						>
							{isRecording ? (
								<>
									<i className="fas fa-stop me-1"></i>
									Stop
								</>
							) : (
								<>
									<i className="fas fa-microphone me-1"></i>
									Record (Space)
								</>
							)}
						</button>
						{showTextArea && (
							<button
								className="btn btn-primary"
								type="button"
								data-kt-element="send"
								onClick={() => sendMessage(message)}
								disabled={!message.trim() || !interviewId || isTerminated || isRecording}
							>
								Send
							</button>
						)}
					</div>
				</div>
			</div>

			<style jsx>{`
				.typing-cursor {
					animation: blink 1s infinite;
				}
				
				@keyframes blink {
					0%, 50% { opacity: 1; }
					51%, 100% { opacity: 0; }
				}
			`}</style>
		</div>
	);
};

export default InterviewChat;
