import { Color } from '@/types/color'
import { StudentStatus } from '@/types/course/student'

const getStatusChipColor = (status?: StudentStatus): { label: string; color: Color } => {
  switch (status) {
    case StudentStatus.Active:
      return { color: 'info', label: 'Awaiting approval' }
    case StudentStatus.Reject:
      return { color: 'error', label: 'Rejected' }
    case StudentStatus.Wating:
      return { color: 'warning', label: 'On waiting list' }
    case StudentStatus.Accept:
      return { color: 'success', label: 'Registered' }
    case StudentStatus.Paying:
      return { color: 'warning', label: 'Paying' }
    default:
      return { color: 'success', label: 'Registered' }
  }
}

export default getStatusChipColor
