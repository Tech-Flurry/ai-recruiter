import React, { FC, useState, useRef, useEffect } from 'react'
import clsx from 'clsx'
import { toAbsoluteUrl } from '../../../_metronic/helpers'
import axios from "axios";

type Message = {
	user: 'riku' | 'candidate'
	text: string
	time: string
}

const rikuAvatar = 'avatars/300-1.jpg'
const candidateAvatar = 'avatars/blank.png'

const jobId = '68639b3c8e7171b948242b8b'
const candidateId = '68617d2c942bf7e519443808'

const InterviewChat: FC = () => {
	const [messages, setMessages] = useState<Message[]>([])
	const [message, setMessage] = useState('')
	const [interviewId, setInterviewId] = useState<string>('')
	const [isTerminated, setIsTerminated] = useState(false)
	const messagesEndRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [messages])

	// On component load, generate interview
	useEffect(() => {
		const generateInterview = async () => {
			// Show loading message
			const loadingMsg: Message = { user: 'riku', text: '...', time: 'Loading' }
			setMessages([loadingMsg])

			try {
				const res = await fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/Interviews/generate-interview/${candidateId}/${jobId}`)
				const result = await res.json()

				// Remove the '...' placeholder
				setMessages([])

				if (result?.success) {
					// Grab interview info
					const data = result.data
					setInterviewId(data.interviewId)
					// Show the interview starter from server
					setMessages([
						{
							user: 'riku',
							text: data.interviewStarter,
							time: 'Just now',
						},
					])
				} else {
					// Handle errors or business messages
					setMessages([
						{
							user: 'riku',
							text: result.message || 'Error starting interview.',
							time: 'Just now',
						},
					])
				}
			} catch (err) {
				setMessages([
					{
						user: 'riku',
						text: 'Internal server error',
						time: 'Just now',
					},
				])
			}
		}

		generateInterview()
	}, [])

	const sendMessage = async () => {
		if (!message.trim() || !interviewId || isTerminated) return

		// Candidate's reply
		const newMessages: Message[] = [
			...messages,
			{ user: 'candidate', text: message, time: 'Just now' },
			{ user: 'riku', text: '...', time: 'Processing' }, // Show loading
		]
		setMessages(newMessages)
		setMessage('')

		// Figuring out the last question asked by Riku
		const lastRikuMsg = [...messages].reverse().find((m) => m.user === 'riku')

		// Call next-question
		try {
			const body = {
				text: lastRikuMsg?.text || '', // question text from Riku
				answer: message,               // candidate’s answer
			}

			const res = await fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/Interviews/next-question/${interviewId}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			})
			const result = await res.json()

			// Remove the '...' placeholder
			const withoutLoading = [...newMessages]
			withoutLoading.pop() // remove the last item which is the '...' 
			setMessages(withoutLoading)

			if (result?.success) {
				const data = result.data
				if (data.terminate) {
					// End of interview
					setIsTerminated(true)
					setMessages([
						...withoutLoading,
						{
							user: 'riku',
							text: 'Interview has ended. Thank you!',
							time: 'Just now',
						},
					])
				} else {
					// Show the next question
					setMessages([
						...withoutLoading,
						{
							user: 'riku',
							text: data.question,
							time: 'Just now',
						},
					])
				}
			} else {
				// Show error message from server
				setMessages([
					...withoutLoading,
					{
						user: 'riku',
						text: result.message || 'Error retrieving next question.',
						time: 'Just now',
					},
				])
			}
		} catch (err) {
			// Show fallback error
			const withoutLoading = [...newMessages]
			withoutLoading.pop()
			setMessages([
				...withoutLoading,
				{ user: 'riku', text: 'Internal server error', time: 'Just now' },
			])
		}
	}

	const onEnterPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			sendMessage()
		}
	}

	return (
		<div className="card-body" id="kt_interview_chat_body">
			<div
				className={clsx('scroll-y me-n5 pe-5')}
				style={{ maxHeight: 400, minHeight: 200, overflowY: 'auto' }}
				data-kt-element="messages"
			>
				{messages.map((msg, idx) => {
					const isRiku = msg.user === 'riku'
					const avatar = isRiku ? rikuAvatar : candidateAvatar
					const name = isRiku ? 'Riku' : 'You'
					const state = isRiku ? 'info' : 'primary'
					return (
						<div
							key={idx}
							className={clsx(
								'd-flex',
								isRiku ? 'justify-content-start' : 'justify-content-end',
								'mb-10'
							)}
						>
							<div
								className={clsx(
									'd-flex flex-column align-items',
									isRiku ? 'align-items-start' : 'align-items-end'
								)}
							>
								<div className="d-flex align-items-center mb-2">
									{isRiku ? (
										<>
											<div className="symbol symbol-35px symbol-circle">
												<img alt="Riku" src={toAbsoluteUrl(`media/${avatar}`)} />
											</div>
											<div className="ms-3">
												<span className="fs-5 fw-bolder text-gray-900 me-1">{name}</span>
												<span className="text-muted fs-7 mb-1">{msg.time}</span>
											</div>
										</>
									) : (
										<>
											<div className="me-3">
												<span className="text-muted fs-7 mb-1">{msg.time}</span>
												<span className="fs-5 fw-bolder text-gray-900 ms-1">{name}</span>
											</div>
											<div className="symbol symbol-35px symbol-circle">
												<img alt="You" src={toAbsoluteUrl(`media/${avatar}`)} />
											</div>
										</>
									)}
								</div>
								<div
									className={clsx(
										'p-5 rounded',
										`bg-light-${state}`,
										'text-gray-900 fw-bold mw-lg-400px',
										isRiku ? 'text-start' : 'text-end'
									)}
									data-kt-element="message-text"
									dangerouslySetInnerHTML={{ __html: msg.text }}
								></div>
							</div>
						</div>
					)
				})}
				<div ref={messagesEndRef} />
			</div>

			<div className="card-footer pt-4" id="kt_interview_chat_footer">
				<textarea
					className="form-control form-control-flush mb-3"
					rows={1}
					data-kt-element="input"
					placeholder="Type your answer..."
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					onKeyDown={onEnterPress}
					disabled={!interviewId || isTerminated}
				/>
				<div className="d-flex flex-stack">
					<div />
					<button
						className="btn btn-primary"
						type="button"
						data-kt-element="send"
						onClick={sendMessage}
						disabled={!message.trim() || !interviewId || isTerminated}
					>
						Send
					</button>
				</div>
			</div>
		</div>
	)
}

export default InterviewChat