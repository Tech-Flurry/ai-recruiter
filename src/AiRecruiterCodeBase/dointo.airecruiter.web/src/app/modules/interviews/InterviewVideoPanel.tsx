import * as React from "react";
import { FC } from "react";
import { toAbsoluteUrl } from "../../../_metronic/helpers";

interface InterviewVideoPanelProps {
	isSpeaking: boolean;
	isRecording: boolean;
}

const InterviewVideoPanel: FC<InterviewVideoPanelProps> = ({ isSpeaking, isRecording }) => {
	const rikiAvatar = "avatars/300-12.jpg";
	return (
		<div className="video-panel">
			<div className="video-content">
				<div className="avatar-container">
					<div className={`avatar-wrapper ${isSpeaking ? 'speaking' : ''}`}>
						<div className="avatar-inner">
							<img
								src={toAbsoluteUrl(`media/${rikiAvatar}`)}
								alt="Riki"
								className="avatar-image"
							/>
						</div>
						{isSpeaking && (
							<div className="speaking-indicator">
								<div className="speaking-ring"></div>
								<div className="speaking-ring ring-2"></div>
								<div className="speaking-ring ring-3"></div>
							</div>
						)}
					</div>

					<div className="avatar-info">
						<h2 className="avatar-name">Riki</h2>
						<span className="avatar-status">AI Recruiter</span>
					</div>
				</div>

				{isRecording && (
					<div className="recording-indicator">
						<div className="recording-dot"></div>
						<span className="recording-text">Recording...</span>
					</div>
				)}
			</div>

			<style jsx>{`
				.video-panel {
					height: 100vh;
					display: flex;
					align-items: center;
					justify-content: center;
					background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
					position: relative;
				}

				.video-content {
					text-align: center;
					z-index: 1;
				}

				.avatar-container {
					position: relative;
				}

				.avatar-wrapper {
					position: relative;
					display: inline-block;
					margin-bottom: 20px;
				}

				.avatar-inner {
					width: 200px;
					height: 200px;
					border-radius: 50%;
					overflow: hidden;
					border: 4px solid #404040;
					background: #333;
					position: relative;
					z-index: 2;
				}

				.avatar-image {
					width: 100%;
					height: 100%;
					object-fit: cover;
				}

				.speaking-indicator {
					position: absolute;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
					z-index: 1;
				}

				.speaking-ring {
					position: absolute;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
					border: 3px solid #3b82f6;
					border-radius: 50%;
					animation: pulse 2s infinite;
				}

				.speaking-ring:nth-child(1) {
					width: 220px;
					height: 220px;
					animation-delay: 0s;
				}

				.speaking-ring.ring-2 {
					width: 260px;
					height: 260px;
					animation-delay: 0.3s;
					border-color: rgba(59, 130, 246, 0.6);
				}

				.speaking-ring.ring-3 {
					width: 300px;
					height: 300px;
					animation-delay: 0.6s;
					border-color: rgba(59, 130, 246, 0.3);
				}

				@keyframes pulse {
					0% {
						transform: translate(-50%, -50%) scale(0.8);
						opacity: 1;
					}
					100% {
						transform: translate(-50%, -50%) scale(1.2);
						opacity: 0;
					}
				}

				.avatar-info {
					color: white;
				}

				.avatar-name {
					font-size: 2rem;
					font-weight: 600;
					margin-bottom: 8px;
					color: white;
				}

				.avatar-status {
					font-size: 1.1rem;
					color: #9ca3af;
					font-weight: 400;
				}

				.recording-indicator {
					position: absolute;
					top: 30px;
					right: 30px;
					display: flex;
					align-items: center;
					gap: 8px;
					background: rgba(0, 0, 0, 0.7);
					padding: 8px 16px;
					border-radius: 20px;
					border: 1px solid #404040;
				}

				.recording-dot {
					width: 12px;
					height: 12px;
					background: #ef4444;
					border-radius: 50%;
					animation: blink 1s infinite;
				}

				.recording-text {
					color: white;
					font-size: 0.9rem;
					font-weight: 500;
				}

				@keyframes blink {
					0%, 50% { opacity: 1; }
					51%, 100% { opacity: 0.3; }
				}

				@media (max-width: 768px) {
					.avatar-inner {
						width: 150px;
						height: 150px;
					}

					.speaking-ring:nth-child(1) {
						width: 170px;
						height: 170px;
					}

					.speaking-ring.ring-2 {
						width: 210px;
						height: 210px;
					}

					.speaking-ring.ring-3 {
						width: 250px;
						height: 250px;
					}

					.avatar-name {
						font-size: 1.5rem;
					}

					.avatar-status {
						font-size: 1rem;
					}
				}
			`}</style>
		</div>
	);
};

export default InterviewVideoPanel;