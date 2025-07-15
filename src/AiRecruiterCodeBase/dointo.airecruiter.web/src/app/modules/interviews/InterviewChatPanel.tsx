import * as React from "react";
import { FC, useEffect, useRef } from "react";
import { toAbsoluteUrl } from "../../../_metronic/helpers";
import clsx from "clsx";

type Message = {
	user: "riki" | "candidate";
	text: string;
	time: string;
};

interface InterviewChatPanelProps {
	messages: Message[];
}

const InterviewChatPanel: FC<InterviewChatPanelProps> = ({ messages }) => {
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const rikiAvatar = "avatars/300-1.jpg";
	const candidateAvatar = "avatars/blank.png";

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	return (
		<div className="chat-panel">
			<div className="chat-header">
				<h3 className="chat-title">Interview Chat</h3>
				<div className="chat-subtitle">Conversation with Riki</div>
			</div>

			<div className="chat-messages">
				{messages.length === 0 ? (
					<div className="empty-chat">
						<div className="empty-icon">
							<i className="fas fa-comments"></i>
						</div>
						<div className="empty-text">
							<p>Your conversation will appear here</p>
							<small>Press space to start recording your response</small>
						</div>
					</div>
				) : (
					messages.map((msg, idx) => {
						const isRiki = msg.user === "riki";
						const avatar = isRiki ? rikiAvatar : candidateAvatar;
						const name = isRiki ? "Riki" : "You";
						
						return (
							<div
								key={idx}
								className={clsx(
									"message-item",
									isRiki ? "message-riki" : "message-candidate"
								)}
							>
								<div className="message-avatar">
									<img
										src={toAbsoluteUrl(`media/${avatar}`)}
										alt={name}
										className="avatar-img"
									/>
								</div>
								<div className="message-content">
									<div className="message-header">
										<span className="message-name">{name}</span>
										<span className="message-time">{msg.time}</span>
									</div>
									<div className="message-text">
										{msg.text}
									</div>
								</div>
							</div>
						);
					})
				)}
				<div ref={messagesEndRef} />
			</div>

			<style jsx>{`
				.chat-panel {
					height: 100vh;
					display: flex;
					flex-direction: column;
					background: #2d2d2d;
				}

				.chat-header {
					padding: 20px;
					border-bottom: 1px solid #404040;
					background: #333;
				}

				.chat-title {
					font-size: 1.2rem;
					font-weight: 600;
					color: white;
					margin-bottom: 4px;
				}

				.chat-subtitle {
					font-size: 0.9rem;
					color: #9ca3af;
				}

				.chat-messages {
					flex: 1;
					overflow-y: auto;
					padding: 20px;
					display: flex;
					flex-direction: column;
					gap: 16px;
				}

				.empty-chat {
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					height: 100%;
					text-align: center;
					color: #9ca3af;
				}

				.empty-icon {
					font-size: 3rem;
					margin-bottom: 16px;
					opacity: 0.5;
				}

				.empty-text p {
					font-size: 1.1rem;
					margin-bottom: 8px;
				}

				.empty-text small {
					font-size: 0.9rem;
					opacity: 0.7;
				}

				.message-item {
					display: flex;
					gap: 12px;
					align-items: flex-start;
				}

				.message-riki {
					flex-direction: row;
				}

				.message-candidate {
					flex-direction: row-reverse;
				}

				.message-avatar {
					flex-shrink: 0;
				}

				.avatar-img {
					width: 40px;
					height: 40px;
					border-radius: 50%;
					object-fit: cover;
					border: 2px solid #404040;
				}

				.message-content {
					flex: 1;
					min-width: 0;
				}

				.message-riki .message-content {
					margin-left: 0;
				}

				.message-candidate .message-content {
					margin-right: 0;
					text-align: right;
				}

				.message-header {
					display: flex;
					align-items: center;
					gap: 8px;
					margin-bottom: 4px;
				}

				.message-candidate .message-header {
					justify-content: flex-end;
				}

				.message-name {
					font-weight: 600;
					font-size: 0.9rem;
					color: white;
				}

				.message-time {
					font-size: 0.8rem;
					color: #9ca3af;
				}

				.message-text {
					background: #404040;
					color: white;
					padding: 12px 16px;
					border-radius: 18px;
					font-size: 0.95rem;
					line-height: 1.4;
					word-wrap: break-word;
					max-width: 100%;
				}

				.message-riki .message-text {
					background: #3b82f6;
					border-bottom-left-radius: 6px;
				}

				.message-candidate .message-text {
					background: #404040;
					border-bottom-right-radius: 6px;
				}

				.chat-messages::-webkit-scrollbar {
					width: 6px;
				}

				.chat-messages::-webkit-scrollbar-track {
					background: #2d2d2d;
				}

				.chat-messages::-webkit-scrollbar-thumb {
					background: #404040;
					border-radius: 3px;
				}

				.chat-messages::-webkit-scrollbar-thumb:hover {
					background: #555;
				}
			`}</style>
		</div>
	);
};

export default InterviewChatPanel;