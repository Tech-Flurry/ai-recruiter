import { FC } from 'react'
import { KTIcon } from '../../../helpers'
import { Dropdown1 } from '../../content/dropdown/Dropdown1'

type Item = {
  icon: string
  color: string
  title: string
  subtitle: string
}

type Props = {
  className: string
  title?: string
  subtitle?: string
  items?: Item[]
}

const ListsWidget1: FC<Props> = ({ className, title = 'Job Pipeline Overview', subtitle = 'Track the progress across stages', items = [] }) => {
  return (
    <div className={`card ${className}`}>
      {/* Header */}
      <div className='card-header border-0 pt-5'>
        <h3 className='card-title align-items-start flex-column'>
          <span className='card-label fw-bold text-gray-900'>{title}</span>
          <span className='text-muted mt-1 fw-semibold fs-7'>{subtitle}</span>
        </h3>

        <div className='card-toolbar'>
          <button
            type='button'
            className='btn btn-sm btn-icon btn-color-primary btn-active-light-primary'
            data-kt-menu-trigger='click'
            data-kt-menu-placement='bottom-end'
            data-kt-menu-flip='top-end'
          >
            <KTIcon iconName='category' className='fs-2' />
          </button>
          <Dropdown1 />
        </div>
      </div>

      {/* Body */}
      <div className='card-body pt-5'>
        {items.map((item, index) => (
          <div className='d-flex align-items-center mb-6' key={index}>
            {/* Icon Box */}
            <div className='symbol symbol-45px me-5'>
              <span className={`symbol-label bg-light-${item.color}`}>
                <KTIcon iconName={item.icon} iconType="duotone" className={`fs-2 text-${item.color}`} />

              </span>
            </div>

            {/* Text */}
            <div className='d-flex flex-column'>
              <span className='text-gray-900 fw-bold fs-6'>{item.title}</span>
              <span className='text-muted fw-semibold'>{item.subtitle}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export { ListsWidget1 }
