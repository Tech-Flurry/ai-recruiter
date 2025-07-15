import React, { FC, useState, useRef, useEffect } from 'react'
import clsx from 'clsx'
import axios from 'axios'
import { toAbsoluteUrl } from '../../../_metronic/helpers'

type Message = {
	user: 'riku' | 'candidate'
	text: string
	time: string
}

const rikuAvatar = 'avatars/300-1.jpg'
const candidateAvatar = 'avatars/blank.png'

interface InterviewChatProps {
	jobId: string
	candidateId: string
	onInterviewId?: (id: string) => void
	onTerminate?: (interviewId: string) => void
}

const InterviewChat: FC<InterviewChatProps> = ({ jobId, candidateId, onInterviewId, onTerminate }) => {
	const [messages, setMessages] = useState<Message[]>([])
	const [message, setMessage] = useState('')
	const [interviewId, setInterviewId] = useState<string>('')
	const [isTerminated, setIsTerminated] = useState(false)
	const messagesEndRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [messages])

	useEffect(() => {
		const generateInterview = async () => {
			const loadingMsg: Message = { user: 'riku', text: '...', time: 'Loading' }
			setMessages([loadingMsg])

			try {
				const token = localStorage.getItem('kt-auth-react-v')
				if (!token) throw new Error("Missing auth token")

				const res = await axios.get(`${import.meta.env.VITE_APP_API_BASE_URL}/Interviews/generate-interview/${candidateId}/${jobId}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})

				setMessages([])

				if (res.data?.success) {
					const data = res.data.data
					setInterviewId(data.interviewId)
					if (onInterviewId) onInterviewId(data.interviewId)

					setMessages([
						{
							user: 'riku',
							text: data.interviewStarter,
							time: 'Just now',
						},
					])
				} else {
					setMessages([
						{
							user: 'riku',
							text: res.data?.message || 'Error starting interview.',
							time: 'Just now',
						},
					])
				}
			} catch (error: any) {
				console.error("Interview generation error:", error)
				setMessages([
					{
						user: 'riku',
						text: axios.isAxiosError(error)
							? error.response?.data?.message || 'Server error'
							: 'Internal server error',
						time: 'Just now',
					},
				])
			}
		}

		if (candidateId && jobId) {
			generateInterview()
		}
	}, [candidateId, jobId, onInterviewId])

	const sendMessage = async () => {
		if (!message.trim() || !interviewId || isTerminated) return

		const newMessages: Message[] = [
			...messages,
			{ user: 'candidate', text: message, time: 'Just now' },
			{ user: 'riku', text: '...', time: 'Processing' },
		]
		setMessages(newMessages)
		setMessage('')

		const lastRikuMsg = [...messages].reverse().find((m) => m.user === 'riku')

		try {
			const body = {
				text: lastRikuMsg?.text || '',
				answer: message,
			}

			const token = localStorage.getItem('kt-auth-react-v')
			if (!token) throw new Error("Missing auth token")

			const res = await axios.post(
				`${import.meta.env.VITE_APP_API_BASE_URL}/Interviews/next-question/${interviewId}`,
				body,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
				}
			)

			const withoutLoading = [...newMessages]
			withoutLoading.pop()

			if (res.data?.success) {
				const data = res.data.data
				if (data.terminate) {
					setIsTerminated(true)
					setMessages([
						...withoutLoading,
						{ user: 'riku', text: 'Interview has ended. Thank you!', time: 'Just now' },
					])
					if (onTerminate && interviewId) {
						onTerminate(interviewId)
					}
				} else {
					setMessages([
						...withoutLoading,
						{ user: 'riku', text: data.question, time: 'Just now' },
					])
				}
			} else {
				setMessages([
					...withoutLoading,
					{ user: 'riku', text: res.data.message || 'Error retrieving next question.', time: 'Just now' },
				])
			}
		} catch (error: any) {
			const withoutLoading = [...newMessages]
			withoutLoading.pop()
			setMessages([
				...withoutLoading,
				{
					user: 'riku',
					text: axios.isAxiosError(error)
						? error.response?.data?.message || 'Server error'
						: 'Internal server error',
					time: 'Just now',
				},
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
