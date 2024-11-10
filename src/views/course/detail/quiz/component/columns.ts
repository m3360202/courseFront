import { DetailItem } from '@/types'
import { Quiz } from '@/types/course/quiz'
import format from '@/utils/format'

const columns = (data: Quiz | null): DetailItem[] => {
  return [
    {
      title: 'Title',
      value: data?.title,
      col: 1
    },
    {
      title: 'Posted on',
      value: format(data?.postAt, 'yyyy/MM/DD'),
      col: 1
    },
    {
      title: 'StartTime',
      value: data?.startTime ? format(data?.startTime) : 'Not',
      col: 1
    },
    {
      title: 'EndTime',
      value: data?.endTime ? format(data?.endTime) : 'Not',
      col: 1
    },
    {
      title: 'Answering time limit',
      value: data?.limit || 'Not',
      col: 1
    },
    {
      title: 'Submission Limit for Students',
      value: data?.submitType === 1 ? 'Multiple times' : 'Once time',
      col: 1
    }
  ]
}

export default columns
