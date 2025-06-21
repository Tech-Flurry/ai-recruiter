// 1️⃣ Create or update this file:
// File: src/_metronic/partials/widgets/JobPostInsightsWidget.tsx

import React from 'react'

const jobData = [
  { title: 'Software Engineer', candidates: 16, screening: '5 d', avgTime: '1 h 20 m' },
  { title: 'Marketing Specialist', candidates: 26, screening: '4.3 h', avgTime: '52 m' },
  { title: 'Sales Representative', candidates: 21, screening: '6.2 h', avgTime: '39 m' },
  { title: 'Accountant', candidates: 18, screening: '3.5 h', avgTime: '45 m' },
  { title: 'IT Support Specialist', candidates: 17, screening: '4 h', avgTime: '1 h 5 m' },
  { title: 'Operations Manager', candidates: 15, screening: '9 d', avgTime: '1 h 52 m' },
]

const JobPostInsightsWidget: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`card ${className}`}>
      <div className='card-header border-0 pt-5'>
        <h3 className='card-title fw-bold text-gray-900'>Job Post Insights</h3>
        <span className='text-muted fw-semibold fs-7'>Based on current screening</span>
      </div>

      <div className='card-body pt-5'>
        <table className='table align-middle table-row-dashed fs-6 gy-5'>
          <thead>
            <tr className='text-start text-muted fw-bold fs-7 text-uppercase gs-0'>
              <th className='min-w-200px'>Job Title</th>
              <th className='min-w-125px'>Candidates</th>
              <th className='min-w-150px'>Screening Time</th>
              <th className='min-w-150px'>Average Time</th>
            </tr>
          </thead>
          <tbody className='text-gray-600 fw-semibold'>
            {jobData.map((job, index) => (
              <tr key={index}>
                <td>{job.title}</td>
                <td>{job.candidates}</td>
                <td>{job.screening}</td>
                <td>{job.avgTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export { JobPostInsightsWidget }
