import React, { FC, useState, useRef, useEffect } from 'react'
import clsx from 'clsx'
import { toAbsoluteUrl } from '../../../_metronic/helpers'

type Message = {
	user: 'riku' | 'candidate'
	text: string
	time: string
}

const rikuAvatar = 'avatars/300-1.jpg'
const candidateAvatar = 'avatars/blank.png'

const questions = [
	'Welcome! Please introduce yourself.',
	'Why are you interested in this position?',
	'Can you describe your relevant experience?',
	'What are your strengths and weaknesses?',
	'Where do you see yourself in 5 years?',
	'Thank you for your answers. We will get back to you soon!',
]

const InterviewChat: FC = () => {
	const [messages, setMessages] = useState<Message[]>([
		{
			user: 'riku',
			text: questions[0],
			time: 'Just now',
		} as Message,
	])
	const [message, setMessage] = useState<string>('')
	const [questionIndex, setQuestionIndex] = useState<number>(1)
	const messagesEndRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [messages])

	const sendMessage = () => {
		if (!message.trim()) return

		// Add candidate's answer
		const newMessages: Message[] = [
			...messages,
			{
				user: 'candidate',
				text: message,
				time: 'Just now',
			},
		]
		setMessages(newMessages)
		setMessage('')

		// If there are more questions, Riku asks the next one
		if (questionIndex < questions.length) {
			setTimeout(() => {
				setMessages([
					...newMessages,
					{
						user: 'riku',
						text: questions[questionIndex],
						time: 'Just now',
					} as Message,
				])
				setQuestionIndex(questionIndex + 1)
			}, 800)
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
					disabled={questionIndex >= questions.length}
				></textarea>
				<div className="d-flex flex-stack">
					<div />
					<button
						className="btn btn-primary"
						type="button"
						data-kt-element="send"
						onClick={sendMessage}
						disabled={!message.trim() || questionIndex >= questions.length}
					>
						Send
					</button>
				</div>
			</div>
		</div>
	)
}

export default InterviewChat