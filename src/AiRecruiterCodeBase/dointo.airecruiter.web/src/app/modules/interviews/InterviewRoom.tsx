import * as React from "react";
import { FC, useState } from "react";
import InterviewVideoPanel from "./InterviewVideoPanel";
import InterviewChatPanel from "./InterviewChatPanel";
import InterviewControls from "./InterviewControls";
import CandidateInterviewResult from "./CandidateInterviewResult";

interface InterviewRoomProps {
	jobId: string;
	candidateId: string;
}

const InterviewRoom: FC<InterviewRoomProps> = ({ jobId, candidateId }) => {
	const [interviewId, setInterviewId] = useState<string>("");
	const [terminatedInterviewId, setTerminatedInterviewId] = useState<string>("");
	const [isSpeaking, setIsSpeaking] = useState(false);
	const [isRecording, setIsRecording] = useState(false);
	const [messages, setMessages] = useState<any[]>([]);

	const handleSpeakingChange = (speaking: boolean) => {
		setIsSpeaking(speaking);
	};

	const handleRecordingChange = (recording: boolean) => {
		setIsRecording(recording);
	};

	const handleMessagesChange = (newMessages: any[]) => {
		setMessages(newMessages);
	};

	if (terminatedInterviewId) {
		return (
			<div className="interview-room-container">
				<div className="container-fluid h-100">
					<div className="row h-100">
						<div className="col-12 d-flex justify-content-center align-items-center">
							<div className="interview-result-panel">
								<CandidateInterviewResult interviewId={terminatedInterviewId} />
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="interview-room-container">
			<div className="container-fluid h-100">
				<div className="row h-100">
					{/* Chat Panel - Left Side */}
					<div className="col-md-4 col-lg-3 chat-panel-column">
						<InterviewChatPanel messages={messages} />
					</div>

					{/* Video Panel - Center */}
					<div className="col-md-8 col-lg-9 video-panel-column">
						<InterviewVideoPanel
							isSpeaking={isSpeaking}
							isRecording={isRecording}
						/>
						
						{/* Controls at bottom */}
						<div className="interview-controls-container">
							<InterviewControls
								jobId={jobId}
								candidateId={candidateId}
								onInterviewId={setInterviewId}
								onTerminate={setTerminatedInterviewId}
								onSpeakingChange={handleSpeakingChange}
								onRecordingChange={handleRecordingChange}
								onMessagesChange={handleMessagesChange}
							/>
						</div>
					</div>
				</div>
			</div>

			<style jsx>{`
				.interview-room-container {
					height: 100vh;
					background-color: #1a1a1a;
					overflow: hidden;
				}

				.chat-panel-column {
					background-color: #2d2d2d;
					border-right: 1px solid #404040;
					padding: 0;
				}

				.video-panel-column {
					background-color: #1a1a1a;
					position: relative;
					padding: 0;
				}

				.interview-controls-container {
					position: absolute;
					bottom: 20px;
					left: 50%;
					transform: translateX(-50%);
					z-index: 10;
				}

				.interview-result-panel {
					max-width: 800px;
					width: 100%;
					margin: 20px;
				}

				@media (max-width: 768px) {
					.chat-panel-column {
						display: none;
					}
					
					.video-panel-column {
						width: 100%;
					}
				}
			`}</style>
		</div>
	);
};

export default InterviewRoom;