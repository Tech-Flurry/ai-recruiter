import { useEffect, useRef, FC } from 'react'
import ApexCharts from 'apexcharts'
import { KTIcon } from '../../../helpers'
import { Dropdown1 } from '../../content/dropdown/Dropdown1'
import { useThemeMode } from '../../layout/theme-mode/ThemeModeProvider'

type Tile = {
  title: string
  value: string
  icon: string
  color: string
}

type Props = {
  className: string
  chartColor: string
  strokeColor: string
  chartHeight: string
  title?: string
  tiles?: Tile[]
}

const MixedWidget2: FC<Props> = ({
  className,
  chartColor,
  strokeColor,
  chartHeight,
  title = 'Pass Rate Across All Job Posts',
  tiles = [],
}) => {
  const chartRef = useRef<HTMLDivElement | null>(null)
  const { mode } = useThemeMode()

  useEffect(() => {
    if (!chartRef.current) return

    const chart = new ApexCharts(chartRef.current, {
      chart: {
        type: 'line',
        height: parseInt(chartHeight),
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: { enabled: true },
      },
      series: [
        {
          name: 'Pass Rate',
          data: [50, 52, 54, 53, 56, 70],
        },
      ],
      stroke: {
        width: 3,
        curve: 'smooth',
        colors: [strokeColor],
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        labels: {
          style: {
            fontSize: '12px',
            colors: '#6c757d',
          },
        },
      },
      yaxis: {
        min: 45,
        max: 80,
        labels: {
          formatter: (val: number) => `${val}%`,
          style: {
            fontSize: '12px',
            colors: '#6c757d',
          },
        },
      },
      tooltip: {
        enabled: true,
        y: {
          formatter: (val: number) => `${val}%`,
        },
      },
      grid: {
        borderColor: '#f1f1f1',
      },
    })

    chart.render()
    return () => chart.destroy()
  }, [chartRef, mode, strokeColor, chartHeight])

  return (
    <div className={`card ${className}`}>
      {/* Header */}
      <div className={`card-header border-0 py-5 bg-${chartColor}`}>
        <h3 className='card-title fw-bold text-white'>{title}</h3>
        <div className='card-toolbar'>
          <button
            type='button'
            className='btn btn-sm btn-icon btn-color-white btn-active-white border-0 me-n3'
            data-kt-menu-trigger='click'
            data-kt-menu-placement='bottom-end'
            data-kt-menu-flip='top-end'
          >
            <KTIcon iconName='category' className='fs-2' />
          </button>
          <Dropdown1 />
        </div>
      </div>

      {/* Chart Area */}
      <div className='card-body pt-0'>
        <div ref={chartRef} className='mb-10' />

        <div className='card-p mt-5'>
          <div className='row row-cols-1 row-cols-sm-2 row-cols-md-4 g-4'>
            {tiles.map((tile, idx) => (
              <div key={idx} className='col'>
                <div
                  className='p-4 text-center rounded-4 shadow-sm bg-white border'
                  style={{
                    minHeight: '160px',
                    borderColor: `var(--bs-light-${tile.color})`,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                  }}
                >
                  {/* Icon inside soft colored circle */}
                  <div
                    className={`d-inline-flex align-items-center justify-content-center bg-light-${tile.color} rounded-circle mb-3`}
                    style={{ width: '48px', height: '48px' }}
                  >
                    <KTIcon iconName={tile.icon} className={`fs-2 text-${tile.color}`} />
                  </div>

                  {/* Number */}
                  <div className={`fs-2 fw-bold text-${tile.color}`}>{tile.value}</div>

                  {/* Title */}
                  <div className={`fw-semibold text-${tile.color}`}>{tile.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export { MixedWidget2 }