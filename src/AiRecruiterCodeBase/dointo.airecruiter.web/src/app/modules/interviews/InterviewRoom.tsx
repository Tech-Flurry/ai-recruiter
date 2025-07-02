import React from 'react'
import { Dropdown1 } from '../../../_metronic/partials'
import InterviewChat from './InterviewChat'

const InterviewRoom: React.FC = () => {
	return (
		<div className="interview-room d-flex flex-column align-items-center py-10">
			<div className="card w-100 w-lg-600px" id="kt_interview_messenger">
				<div className="card-header" id="kt_interview_messenger_header">
					<div className="card-title">
						<div className="symbol-group symbol-hover"></div>
						<div className="d-flex justify-content-center flex-column me-3">
							<a
								href="#"
								className="fs-4 fw-bolder text-gray-900 text-hover-primary me-1 mb-2 lh-1"
							>
								Riku
							</a>
							<div className="mb-0 lh-1">
								<span className="badge badge-success badge-circle w-10px h-10px me-1"></span>
								<span className="fs-7 fw-bold text-gray-500">Active</span>
							</div>
						</div>
					</div>
					<div className="card-toolbar">
						<div className="me-n3">
							<button
								className="btn btn-sm btn-icon btn-active-light-primary"
								data-kt-menu-trigger="click"
								data-kt-menu-placement="bottom-end"
								data-kt-menu-flip="top-end"
							>
								<i className="bi bi-three-dots fs-2"></i>
							</button>
							<Dropdown1 />
						</div>
					</div>
				</div>
				<InterviewChat />
			</div>
		</div>
	)
}

export default InterviewRoom