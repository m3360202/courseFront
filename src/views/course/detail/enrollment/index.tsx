'use client'

// MUI Imports
import Typography from '@mui/material/Typography'
import { Button } from '@mui/material'
import Box from '@mui/material/Box'

// Components Imports
import { useCourse, useEditCourseRole } from '@/hooks/useCourse'
import { DetailItem } from '@/types'
import format from '@/utils/format'
import { useParams } from 'next/navigation'
import { Locale } from '@/configs/i18n'
import { transformDateFromUTC } from '@/utils/date'
import PermissionButton from '@/components/buttons/PermissionButton'
import Link from 'next/link'
import { getLocalizedUrl } from '@/utils/i18n'
import { useEffect, useState } from 'react'
import ShareContent from '../../component/ShareContent'

// Hooks Imports
import { useUser } from '@/hooks/useGlobal'
import { getEnrollmentDetail } from '@/api/organization/enrollment/getEnrollmentDetail'
import { Enrollment } from '@/types/organization/enrollment'
import { showChipLabel } from '@/utils/organization'

const EnrollmentDetail = ({ courseId }: { courseId: string }) => {
  //States
  const [data, setData] = useState<Enrollment>()

  // Hooks
  const { lang: locale } = useParams()
  const { course } = useCourse()
  const user = useUser()
  const editCourseRole = useEditCourseRole()

  const loadEnrollment = async () => {
    if (user && courseId) {
      const { data } = await getEnrollmentDetail(user, courseId)
      setData(data)
    }
  }

  useEffect(() => {
    loadEnrollment()
  }, [user, courseId])

  //Vars
  const status = showChipLabel(data, user)
  const items: DetailItem[] = [
    // {
    //   title: 'Title',
    //   value: course?.title,
    //   col: 1
    // },
    {
      title: 'Valid time',
      value: data?.startTime
        ? format(transformDateFromUTC(data?.startTime as string, user), 'YYYY/MM/DD', false) +
          '-' +
          format(transformDateFromUTC(data?.endTime as string, user), 'YYYY/MM/DD', false)
        : '',
      col: 1,
      icon: 'ri-calendar-schedule-line'
    },
    {
      title: 'Information collection',
      value: data?.collects?.map((item: any) => item).join(' , '),
      col: 1,
      icon: 'ri-time-zone-line'
    },
    {
      title: 'Select policy',
      col: 1,
      value: data?.policys?.map((item: any) => item.title).join(','),
      icon: 'ri-timeline-view'
    },
    {
      title: 'Select questionnaire',
      value: data?.surveys?.map((item: any) => item.title).join(','),
      col: 2,
      icon: 'ri-book-read-line'
    },
    {
      title: 'Payment method',
      col: 2,
      value: (
        <>
          {data?.paymentType === 1 && <Typography>Free: No fees to join the institution</Typography>}
          {data?.paymentType === 2 && (
            <Typography>Donation: It will be up to the student to decide how much to pay</Typography>
          )}
          {data?.paymentType === 3 && (
            <Box display={'flex'} gap={4}>
              <Typography>Fixed fee</Typography>
              <Typography>${data.amount}</Typography>
            </Box>
          )}
        </>
      ),
      icon: 'ri-money-euro-box-line'
    },
    {
      title: 'Enrollment plan url',
      value: !data ? (
        ''
      ) : status.title === 'Expired' ? (
        status.title
      ) : (
        <Typography
          noWrap
          sx={{ width: '70%' }}
        >{`${process.env.NEXT_PUBLIC_APP_URL}/organization/${data?.instructorId}/share/${data?._id}`}</Typography>
      ),
      col: 2,
      icon: 'ri-contacts-book-line',
      copy: data ? true : false,
      copyValue: `${process.env.NEXT_PUBLIC_APP_URL}/organization/${data?.instructorId}/share/${data?._id}`
    }
  ]

  const buttons = [
    <PermissionButton key='edit' isShow={editCourseRole}>
      <Button
        key='edit-small'
        size='small'
        component={Link}
        href={getLocalizedUrl(`/course/${courseId}/detail/enrollment/edit`, locale as Locale)}
      >
        Edit
      </Button>
    </PermissionButton>
  ]

  return (
    <ShareContent about='enrollment' title={course?.title} items={items} buttons={buttons}>
      {/* <Divider />
      <div className='flex flex-col gap-4'>
        <Box className='flex justify-between '>
          <Typography variant='h5'>Description</Typography>
          <EditDescription />
        </Box>
        {course?.description ? (
          <Typography sx={{ wordWrap: 'break-word' }} dangerouslySetInnerHTML={{ __html: course?.description }} />
        ) : (
          <>
            {!editCourseRole ? (
              <Typography className='text-center px-12 text-sm'>
                {`You haven't edited your course description yet. Add course descriptions to better describe your
                    course content and attract more students to sign up.`}
              </Typography>
            ) : (
              <Typography className='text-center px-12 text-sm'>{`No description yet.`}</Typography>
            )}
          </>
        )}
      </div> */}
    </ShareContent>
  )
}

export default EnrollmentDetail
