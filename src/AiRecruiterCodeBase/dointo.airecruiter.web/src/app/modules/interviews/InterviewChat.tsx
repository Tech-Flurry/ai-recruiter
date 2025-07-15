import { FC, useState, useRef, useEffect, useCallback } from "react";
import clsx from "clsx";
import axios from "axios";
import { toAbsoluteUrl } from "../../../_metronic/helpers";
import { useAudioRecording } from "../../hooks/useAudioRecording";
import { useAudioPlayback } from "../../hooks/useAudioPlayback";
import { useTypingAnimation } from "../../hooks/useTypingAnimation";

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
	const { jobId, candidateId, onInterviewId, onTerminate } = props;
	const [messages, setMessages] = useState<Message[]>([]);
	const [message, setMessage] = useState("");
	const [interviewId, setInterviewId] = useState<string>("");
	const [isTerminated, setIsTerminated] = useState(false);
	const [apiKey, setApiKey] = useState<string>("");
	const [showTextArea, setShowTextArea] = useState(false);

	const messagesEndRef = useRef<HTMLDivElement>(null);

	const { playAudioMessage } = useAudioPlayback({ apiKey });
	const { isTyping, startTypingAnimation, cleanup: cleanupTyping } = useTypingAnimation();
	
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
			setMessage(text);
			await sendMessage(text);
		},
		onTranscriptionFailed: () => {
			setShowTextArea(true);
		}
	});

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
	}, [isRecording, isTerminated, interviewId, startRecording, stopRecording]);

	const startTypingMessage = useCallback(async (text: string) => {
		const typingMessage: Message = {
			user: "riki",
			text: "",
			time: "Just now",
		};
		setMessages((prev) => [...prev, typingMessage]);

		await startTypingAnimation(text);
		
		// Update the last message with the complete text
		setMessages((prev) => {
			const newMessages = [...prev];
			if (newMessages.length > 0) {
				newMessages[newMessages.length - 1] = {
					...newMessages[newMessages.length - 1],
					text: text
				};
			}
			return newMessages;
		});
	}, [startTypingAnimation]);

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
					`${
						(import.meta as any).env.VITE_APP_API_BASE_URL
					}/Interviews/get-api-key`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);
				const fetchedApiKey = keyRes.data || "";
				setApiKey(fetchedApiKey);

				const res = await axios.get(
					`${
						(import.meta as any).env.VITE_APP_API_BASE_URL
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
					await playAudioMessage(data.interviewStarter);
					await startTypingMessage(data.interviewStarter);
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
	}, [candidateId, jobId, onInterviewId, playAudioMessage, startTypingMessage]);

	const sendMessage = useCallback(async (messageText: string) => {
		if (!messageText.trim() || !interviewId || isTerminated) return;

		let lastRikiMsg: Message | undefined;
		setMessages((prevMessages) => {
			lastRikiMsg = [...prevMessages].reverse().find((m) => m.user === "riki");
			return [
				...prevMessages,
				{ user: "candidate", text: messageText, time: "Just now" },
			];
		});
		setMessage("");
		setShowTextArea(false);
		const body = {
			text: lastRikiMsg?.text || "",
			answer: messageText,
		};

		try {
			const token = localStorage.getItem("kt-auth-react-v");
			if (!token) throw new Error("Missing auth token");

			const res = await axios.post(
				`${
					(import.meta as any).env.VITE_APP_API_BASE_URL
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
					await playAudioMessage(terminationMessage);
					await startTypingMessage(terminationMessage);
					if (onTerminate && interviewId) {
						onTerminate(interviewId);
					}
				} else {
					await playAudioMessage(data.question);
					await startTypingMessage(data.question);
				}
			} else {
				const errorMessage =
					res.data.message || "Error retrieving next question.";
				await startTypingMessage(errorMessage);
			}
		} catch (error: any) {
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "Server error"
				: "Internal server error";
			await startTypingMessage(errorMessage);
		}
	}, [interviewId, isTerminated, onTerminate, playAudioMessage, startTypingMessage]);

	const onEnterPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage(message);
		}
	};

	useEffect(() => {
		return () => {
			cleanupRecording();
			cleanupTyping();
		};
	}, [cleanupRecording, cleanupTyping]);

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
					const isCurrentlyTyping =
						isRiki && isTyping && idx === messages.length - 1;

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
						onChange={(e) => setMessage(e.target.value)}
						onKeyDown={onEnterPress}
						disabled={!interviewId || isTerminated || isRecording}
					/>
				)}
				<div className="d-flex flex-stack align-items-center">
					<div className="d-flex align-items-center">
						{isRecording && (
							<div className="me-3">
								<span className="badge badge-light-primary fs-7">
									<i
										className="fas fa-circle text-danger me-1"
										style={{ fontSize: "8px" }}
									></i>
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
								disabled={
									!message.trim() || !interviewId || isTerminated || isRecording
								}
							>
								Send
							</button>
						)}
					</div>
				</div>
			</div>

			<style jsx="true">{`
				.typing-cursor {
					animation: blink 1s infinite;
				}

				@keyframes blink {
					0%,
					50% {
						opacity: 1;
					}
					51%,
					100% {
						opacity: 0;
					}
				}
			`}</style>
		</div>
	);
};

export default InterviewChat;
