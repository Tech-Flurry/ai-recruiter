import React, { useEffect, useState, useCallback } from 'react'
import { Form, Alert, Spinner, Table, InputGroup, FormControl } from 'react-bootstrap'
import moment from 'moment'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { KTCard, KTCardBody } from '../../../_metronic/helpers'

type InterviewHistoryItem = {
    interviewId: string
    jobTitle: string
    score: number
    status: 'Passed' | 'Failed'
    jobStatus: 'Open' | 'Closed'
    interviewedAt: string
}

const CandidateInterviewHistory: React.FC = () => {
    const [history, setHistory] = useState<InterviewHistoryItem[]>([])
    const [filteredHistory, setFilteredHistory] = useState<InterviewHistoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string>('')
    const [searchTitle, setSearchTitle] = useState('')
    const [resultFilter, setResultFilter] = useState<'All' | 'Passed' | 'Failed'>('All')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    const fetchHistory = useCallback(async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_APP_API_BASE_URL}/Interviews/history`, {
                withCredentials: true,
            })
            const sorted = [...res.data].sort(
                (a, b) => new Date(b.interviewedAt).getTime() - new Date(a.interviewedAt).getTime()
            )
            setHistory(sorted)
            setFilteredHistory(sorted)
        } catch (err) {
            console.error(err)
            setError('Failed to fetch interview history.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchHistory()
    }, [fetchHistory])

    useEffect(() => {
        const filtered = history.filter((item) => {
            const matchesTitle = item.jobTitle.toLowerCase().includes(searchTitle.toLowerCase())
            const matchesResult = resultFilter === 'All' || item.status === resultFilter
            const matchesStart = !startDate || new Date(item.interviewedAt) >= new Date(startDate)
            const matchesEnd = !endDate || new Date(item.interviewedAt) <= new Date(endDate)
            return matchesTitle && matchesResult && matchesStart && matchesEnd
        })
        setFilteredHistory(filtered)
    }, [searchTitle, resultFilter, startDate, endDate, history])

    const getStatusBadge = (status: string,) => {
        const classMap: Record<string, string> = {
            Passed: 'badge badge-light-success fw-bold',
            Failed: 'badge badge-light-danger fw-bold',
            Open: 'badge badge-light-primary fw-bold',
            Closed: 'badge badge-light-danger fw-bold',
        }
        return <span className={classMap[status] || 'badge badge-light fw-bold'}>{status}</span>
    }

    const getScoreClass = (score: number) => {
		if (score >= 7) return 'text-success fw-bold'
        return 'text-danger fw-bold'
    }

    const clearFilters = () => {
        setSearchTitle('')
        setResultFilter('All')
        setStartDate('')
        setEndDate('')
    }

    return (
        <KTCard className="mt-5">
            <KTCardBody>
                <div className="d-flex flex-wrap gap-3 mb-5 align-items-end">
                    <div style={{ minWidth: '240px', flexGrow: 1 }}>
                        <Form.Label>Search Job Title</Form.Label>
                        <InputGroup>
                            <InputGroup.Text>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8e9aad" strokeWidth="2">
                                    <circle cx="11" cy="11" r="7" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                            </InputGroup.Text>
                            <FormControl
                                placeholder="Search job title..."
                                value={searchTitle}
                                onChange={(e) => setSearchTitle(e.target.value)}
                            />
                        </InputGroup>
                    </div>

                    <div>
                        <Form.Label>Result</Form.Label>
                        <Form.Select
                            value={resultFilter}
                            onChange={(e) => setResultFilter(e.target.value as 'All' | 'Passed' | 'Failed')}
                        >
                            <option value="All">All</option>
                            <option value="Passed">Passed</option>
                            <option value="Failed">Failed</option>
                        </Form.Select>
                    </div>
                    <div>
                        <Form.Label>Start Date</Form.Label>
                        <Form.Control type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                    <div>
                        <Form.Label>End Date</Form.Label>
                        <Form.Control type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                    <div>
						<button
							onClick={() => clearFilters()}
							className="btn btn-light-primary font-weight-bold mr-2"
						>
							Clear Filters
						</button>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="text-center">
                        <Spinner animation="border" variant="primary" />
                    </div>
                ) : error ? (
                    <Alert variant="danger" className="text-center">
                        {error}
                    </Alert>
                ) : filteredHistory.length === 0 ? (
                    <Alert variant="warning" className="text-center">
                        No interviews found.
                    </Alert>
                ) : (
                    <div className="table-responsive">
                        <Table hover responsive className="align-middle table-row-dashed fs-6 gy-5">
                            <thead>
                                <tr className="text-start text-muted fw-bold fs-7 text-uppercase gs-0">
                                    <th>Date</th>
                                    <th>Job Title</th>
                                    <th>Score</th>
                                    <th>Result</th>
                                    <th>Job Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredHistory.map((item, index) => (
                                    <tr key={index}>
                                        <td>{moment(item.interviewedAt).format('DD MMM YYYY')}</td>
                                        <td className="fw-semibold text-dark">
                                            <Link to={`/jobs/interview-report/${item.interviewId}`} className="text-primary text-hover-underline">
                                                {item.jobTitle}
                                            </Link>
                                        </td>
                                        <td className={getScoreClass(item.score)}>{item.score.toFixed(1)}</td>
                                        <td>{getStatusBadge(item.status, 'result')}</td>
                                        <td>{getStatusBadge(item.jobStatus, 'job')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                )}
            </KTCardBody>
        </KTCard>
    )
}

export default CandidateInterviewHistory
