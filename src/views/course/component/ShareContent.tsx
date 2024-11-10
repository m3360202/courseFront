'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// Components Imports
import { DetailItem } from '@/types'
import DetailList from '@/components/detail-list'
import { ReactNode } from 'react'
import { useCourse } from '@/hooks/useCourse'
import { Skeleton } from '@mui/material'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'

interface Props {
  about: string
  title?: string
  items: DetailItem[]
  buttons?: JSX.Element[]
  children?: ReactNode
  hiddenInstructor?: boolean
}

const skeletonLoading = <Skeleton width={120} height={20} />

const ShareContent = ({ about, title, items, buttons, hiddenInstructor, children }: Props) => {
  const { loading, course } = useCourse()
  const labels = course?.labels || []

  return (
    <>
      <Card>
        <CardContent className='flex flex-wrap items-center justify-between gap-4 pbe-6'>
          <div className='flex flex-col'>
            <Typography variant='h5'>{loading ? skeletonLoading : title}</Typography>
            {!hiddenInstructor && (
              <>
                <Typography>
                  Instructor.{' '}
                  <span className='font-medium text-textPrimary'>
                    {course?.user?.nickName || course?.user?.username}
                  </span>
                </Typography>
                <Box className='flex flex-row items-start mt-2'>
                  {labels.map(label => (
                    <Chip
                      key={label.id}
                      label={label.title}
                      size='small'
                      color='primary'
                      variant='tonal'
                      className='self-start rounded-sm mr-1'
                    />
                  ))}
                </Box>
              </>
            )}
          </div>
          <div className='flex items-center gap-4'>{buttons?.map(button => button)}</div>
        </CardContent>
        <CardContent>
          <div className='border rounded'>
            <div className='flex flex-col gap-6 p-5'>
              <div className='flex flex-col gap-4'>
                <Typography variant='h5'>About this {about}</Typography>
                <div className='flex flex-wrap gap-x-12 gap-y-2'>{<DetailList items={items} />}</div>
              </div>
              {children}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default ShareContent
