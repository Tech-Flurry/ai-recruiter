import { useIntl } from 'react-intl'
import { PageTitle } from '../../../_metronic/layout/core'

// Widgets
import {
  ListsWidget1,
  TablesWidget5,
  MixedWidget2,
  StatisticsWidget5,
} from '../../../_metronic/partials/widgets'

import { JobPostInsightsWidget } from '../../../_metronic/partials/widgets/lists/JobPostInsightsWidget'

const DashboardPage = () => (
  <>
    {/* === Summary Cards === */}
    <div className='row g-5 g-xl-8'>
      <div className='col-md-4'>
        <StatisticsWidget5
          className='card-xl-stretch mb-xl-8'
          svgIcon='document'
          color='white'
          iconColor='warning'
          title='18'
          description='Active Job Posts'
          titleColor='dark'
          descriptionColor='gray-600'
        />
      </div>
      <div className='col-md-4'>
        <StatisticsWidget5
          className='card-xl-stretch mb-xl-8'
          svgIcon='user'
          color='white'
          iconColor='success'
          title='214'
          description='Total Candidates Screened'
          titleColor='dark'
          descriptionColor='gray-600'
        />
      </div>
      <div className='col-md-4'>
        <StatisticsWidget5
          className='card-xl-stretch mb-xl-8'
          svgIcon='check-circle'
          color='white'
          iconColor='primary'
          title='52%'
          description='Pass Rate'
          titleColor='dark'
          descriptionColor='gray-600'
        />
      </div>
    </div>

    {/* === Job Pipeline & Candidate Graph === */}
    <div className='row g-5 g-xl-8'>
      <div className='col-md-6'>
        <ListsWidget1
          className='card-xl-stretch mb-xl-8'
          title='Job Pipeline Overview'
          subtitle='Track the progress across stages'
          items={[
            { icon: 'document', color: 'success', title: 'Job Post Created', subtitle: 'Recruiter posts job' },
            { icon: 'user', color: 'warning', title: 'Applications Received', subtitle: 'Candidates applied' },
            { icon: 'shield-tick', color: 'info', title: 'Screening in Progress', subtitle: 'Initial screening ongoing' },
            { icon: 'calendar', color: 'danger', title: 'Interviews Conducted', subtitle: 'Interview stage' },
            { icon: 'check-circle', color: 'primary', title: 'Candidates Selected', subtitle: 'Final selections made' }
          ]}
        />
      </div>

      <div className='col-md-6'>
        <MixedWidget2
          className='card-xl-stretch mb-xl-8'
          title='Pass Rate Across All Job Posts'
          chartColor='primary'
          chartHeight='200'
          strokeColor='#5d78ff'
          tiles={[
            { title: 'Weekly Applications', value: '45', icon: 'graph', color: 'warning' },
            { title: 'New Candidates', value: '30', icon: 'user', color: 'primary' },
            { title: 'Interviews Scheduled', value: '18', icon: 'calendar', color: 'danger' },
            { title: 'Offers Sent', value: '10', icon: 'check', color: 'success' },
          ]}
        />
      </div>
    </div>

    {/* === Job Post Insights Table === */}
    <div className='row g-5 g-xl-8'>
      <div className='col-md-12'>
        <JobPostInsightsWidget className='card-xl-stretch mb-5 mb-xl-8' />
      </div>
    </div>
  </>
)

const DashboardWrapper = () => {
  const intl = useIntl()
  return (
    <>
      <PageTitle breadcrumbs={[]}>
        {intl.formatMessage({ id: 'MENU.DASHBOARD' })}
      </PageTitle>
      <DashboardPage />
    </>
  )
}

export { DashboardWrapper }
