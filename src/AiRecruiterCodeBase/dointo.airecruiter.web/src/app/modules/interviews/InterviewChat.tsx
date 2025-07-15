import React, { FC, useState, useRef, useEffect } from "react";
import clsx from "clsx";
import axios from "axios";
import { toAbsoluteUrl } from "../../../_metronic/helpers";
import OpenAI from "openai";

type Message = {
	user: "riki" | "candidate";
	text: string;
	time: string;
};

const rikiAvatar = "avatars/300-1.jpg";
const candidateAvatar = "avatars/blank.png";

interface InterviewChatProps {
	jobId: string;
	candidateId: string;
	onInterviewId?: (id: string) => void;
	onTerminate?: (interviewId: string) => void;
}

const InterviewChat: FC<InterviewChatProps> = ({
	jobId,
	candidateId,
	onInterviewId,
	onTerminate,
}) => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [message, setMessage] = useState("");
	const [interviewId, setInterviewId] = useState<string>("");
	const [isTerminated, setIsTerminated] = useState(false);
	const [apiKey, setApiKey] = useState<string>("");
	
	// Recording states
	const [isRecording, setIsRecording] = useState(false);
	const [recordingSeconds, setRecordingSeconds] = useState(0);
	const [recordedUrl, setRecordedUrl] = useState<string>("");
	const [isTranscribing, setIsTranscribing] = useState(false);
	
	// Recording refs
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const mediaStreamRef = useRef<MediaStream | null>(null);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const chunksRef = useRef<Blob[]>([]);
	const timerRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

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
					`${import.meta.env.VITE_APP_API_BASE_URL}/Interviews/get-api-key`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);
				setApiKey(keyRes.data || "");
				const res = await axios.get(
					`${import.meta.env.VITE_APP_API_BASE_URL
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

					setMessages([
						{
							user: "riki",
							text: data.interviewStarter,
							time: "Just now",
						},
					]);
					await playAudioMessage(data.interviewStarter);
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

	const sendMessage = async (messageText: string) => {
		if (!messageText.trim() || !interviewId || isTerminated) return;

		const newMessages: Message[] = [
			...messages,
			{ user: "candidate", text: messageText, time: "Just now" },
			{ user: "riki", text: "...", time: "Processing" },
		];
		setMessages(newMessages);
		setMessage("");

		const lastrikiMsg = [...messages].reverse().find((m) => m.user === "riki");

		try {
			const body = {
				text: lastrikiMsg?.text || "",
				answer: messageText,
			};

			const token = localStorage.getItem("kt-auth-react-v");
			if (!token) throw new Error("Missing auth token");

			const res = await axios.post(
				`${import.meta.env.VITE_APP_API_BASE_URL
				}/Interviews/next-question/${interviewId}`,
				body,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);

			const withoutLoading = [...newMessages];
			withoutLoading.pop();

			if (res.data?.success) {
				const data = res.data.data;
				if (data.terminate) {
					setIsTerminated(true);
					const terminationMessage = "Interview has ended. Thank you!";
					setMessages([
						...withoutLoading,
						{
							user: "riki",
							text: terminationMessage,
							time: "Just now",
						},
					]);
					await playAudioMessage(terminationMessage);
					if (onTerminate && interviewId) {
						onTerminate(interviewId);
					}
				} else {
					setMessages([
						...withoutLoading,
						{ user: "riki", text: data.question, time: "Just now" },
					]);
					await playAudioMessage(data.question);
				}
			} else {
				setMessages([
					...withoutLoading,
					{
						user: "riki",
						text: res.data.message || "Error retrieving next question.",
						time: "Just now",
					},
				]);
			}
		} catch (error: any) {
			const withoutLoading = [...newMessages];
			withoutLoading.pop();
			setMessages([
				...withoutLoading,
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

	const onEnterPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage(message);
		}
	};

	const formatTimer = (totalSeconds: number): string => {
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;
		
		if (hours > 0) {
			return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
		}
		return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
				const url = URL.createObjectURL(audioBlob);
				setRecordedUrl(url);
				
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
			timerRef.current = setInterval(() => {
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
			} else if (audio.blob) {
				audioBlob = await audio.blob();
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
			}
		} catch (error) {
			console.error("Error transcribing audio:", error);
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
			if (mediaStreamRef.current) {
				mediaStreamRef.current.getTracks().forEach(track => track.stop());
			}
			if (recordedUrl) {
				URL.revokeObjectURL(recordedUrl);
			}
		};
	}, [recordedUrl]);

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
									dangerouslySetInnerHTML={{ __html: msg.text }}
								></div>
							</div>
						</div>
					);
				})}
				<div ref={messagesEndRef} />
			</div>

			<div className="card-footer pt-4" id="kt_interview_chat_footer">
				<textarea
					className="form-control form-control-flush mb-3"
					rows={1}
					data-kt-element="input"
					placeholder="Type your answer or use voice recording..."
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					onKeyDown={onEnterPress}
					disabled={!interviewId || isTerminated || isRecording}
				/>
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
						{recordedUrl && !isTranscribing && (
							<div className="me-3">
								<audio controls src={recordedUrl} style={{ height: '30px' }} />
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
									Record
								</>
							)}
						</button>
						<button
							className="btn btn-primary"
							type="button"
							data-kt-element="send"
							onClick={() => sendMessage(message)}
							disabled={!message.trim() || !interviewId || isTerminated || isRecording}
						>
							Send
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default InterviewChat;
