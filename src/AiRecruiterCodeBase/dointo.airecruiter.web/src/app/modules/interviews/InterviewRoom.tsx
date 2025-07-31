import * as React from "react";
import { FC, useEffect, useState } from "react";
import InterviewVideoPanel from "./InterviewVideoPanel";
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

	const handleSpeakingChange = (speaking: boolean) => {
		setIsSpeaking(speaking);
	};

	const handleRecordingChange = (recording: boolean) => {
		setIsRecording(recording);
	};

	const handleInterviewStart = (id: string) => {
		setInterviewId(id);
	};

	// 🔒 Disable copy, right-click, and Ctrl/Cmd+C
	useEffect(() => {
		const handleContextMenu = (e: MouseEvent) => e.preventDefault();
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "x")) {
				e.preventDefault();
			}
		};

		document.addEventListener("contextmenu", handleContextMenu);
		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("contextmenu", handleContextMenu);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, []);

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
				<style jsx="true">{`
          .interview-room-container {
            height: 100vh;
            background-color: #1a1a1a;
            overflow: hidden;
            user-select: none;
          }

          .interview-result-panel {
            max-width: 800px;
            width: 100%;
            margin: 20px;
          }

          body {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
          }
        `}</style>
			</div>
		);
	}

	return (
		<div className="interview-room-container">
			<div className="container-fluid h-100">
				<div className="row h-100">
					{/* Single Full-Width Video Panel */}
					<div className="col-12 video-panel-column">
						<InterviewVideoPanel isSpeaking={isSpeaking} isRecording={isRecording} />

						{/* Controls at bottom */}
						<div className="interview-controls-container">
							<InterviewControls
								jobId={jobId}
								candidateId={candidateId}
								onInterviewId={handleInterviewStart}
								onTerminate={setTerminatedInterviewId}
								onSpeakingChange={handleSpeakingChange}
								onRecordingChange={handleRecordingChange}
							/>
						</div>
					</div>
				</div>
			</div>

			<style jsx="true">{`
        .interview-room-container {
          height: 100vh;
          background-color: #1a1a1a;
          overflow: hidden;
          position: relative;
          user-select: none;
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

        body {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
      `}</style>
		</div>
	);
};

export default InterviewRoom;
