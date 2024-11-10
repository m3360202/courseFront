'use client'

// MUI Imports
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import { Button } from '@mui/material'
import Box from '@mui/material/Box'

// Type Imports
import type { CourseDetail } from '@/types/apps/academyTypes'
import { joinTypes } from '@/types/course'

// Components Imports
import { useAccessCourseDenied, useCourse, useEditCourseRole } from '@/hooks/useCourse'
import { DetailItem, WEEKNAME } from '@/types'
import format from '@/utils/format'
import getTimeZone from '@/utils/getTimeZone'
import { Locale } from '@/configs/i18n'
import { transformDateToUserTimeZone } from '@/utils/date'
import UserAvatar from '@/components/user-avatar'
import PermissionButton from '@/components/buttons/PermissionButton'
import Link from 'next/link'
import { getLocalizedUrl } from '@/utils/i18n'
import { useEffect, useState } from 'react'
import ShareContent from '../component/ShareContent'

// Hooks Imports
import { useUser } from '@/hooks/useGlobal'
import AssignInstructor from '../component/AssignInstructor'
import { UserTable } from '@/types/user/UserTable'
import TargetDialog from '@/components/dialog'
import NotAuthorized from '@/views/NotAuthorized'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

const CourseDetail = ({
  courseId,
  nextSessionId,
  isOrginazation
}: {
  courseId: string
  nextSessionId?: string
  isOrginazation?: boolean
}) => {
  // Hooks
  const { lang: locale } = useParams()
  const { push } = useRouter()
  const { course, addActionButtons, refreshCourse } = useCourse()
  const user = useUser()
  const accessDenied = useAccessCourseDenied()

  const editCourseRole = useEditCourseRole()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    !accessDenied &&
      addActionButtons([
        <Button
          key='entry'
          variant='contained'
          disabled={!nextSessionId}
          component={Link}
          href={getLocalizedUrl(`/course/${courseId}/detail/session/${nextSessionId}/view`, locale as Locale)}
        >
          Upcoming Session
        </Button>
      ])


    return () => {
      addActionButtons([])
    }
  }, [accessDenied])

  //Vars
  const items: DetailItem[] = [
    // {
    //   title: 'Title',
    //   value: course?.title,
    //   col: 1
    // },
    {
      title: 'Schedule',
      value: format(course?.startTime, 'YYYY/MM/DD', false) + '-' + format(course?.endTime, 'YYYY/MM/DD', false),
      col: 1,
      icon: 'ri-calendar-schedule-line'
    },
    {
      title: 'Timezone',
      value: getTimeZone(user),
      col: 1,
      hidden: !editCourseRole,
      icon: 'ri-time-zone-line'
    },
    {
      title: 'Time Table',
      col: 1,
      value: course?.timetable
        ?.filter(c => WEEKNAME[c])
        .map((item: number) => WEEKNAME[item])
        .join(','),
      hidden: !editCourseRole,
      icon: 'ri-timeline-view'
    },
    {
      title: 'Course ID',
      value: course?.code,
      col: 1,
      hidden: !editCourseRole,
      copy: true,
      icon: 'ri-book-read-line'
    },
    {
      title: 'Class Capacity',
      col: 2,
      value: course?.students && course?.capacity && `${course.students.length} / ${course.capacity}`,
      hidden: !editCourseRole,
      icon: 'ri-user-line'
    },
    {
      title: 'Enrollment Type',
      value: !isNaN(course?.joinType as number) ? joinTypes(locale as Locale)[course?.joinType as number] : '',
      col: 2,
      hidden: !editCourseRole,
      icon: 'ri-contacts-book-line'
    },
    {
      title: 'Registration Deadline',
      value: course?.deadline ? transformDateToUserTimeZone(course?.deadline, user).format('YYYY-MM-DD HH:mm:ss') : '',
      col: 2,
      hidden: !editCourseRole,
      icon: 'ri-timer-line'
    },
    {
      title: 'Address',
      value: course?.address,
      col: 2,
      hidden: !course?.address,
      icon: 'ri-map-pin-2-line'
    },
    {
      title: 'Classroom Information',
      value: course?.classroom,
      col: 2,
      hidden: !course?.classroom,
      icon: 'ri-tv-2-line'
    }
  ]

  const buttons = [
    <PermissionButton key='edit' isShow={editCourseRole}>
      <Button
        key='edit-small'
        size='small'
        component={Link}
        href={getLocalizedUrl(`/course/${courseId}/edit`, locale as Locale)}
      >
        Edit
      </Button>
    </PermissionButton>,
    <PermissionButton key='join' isShow={!user}>
      <TargetDialog title='Authorized' content={<NotAuthorized mode='system' />} open={open} setOpen={setOpen}>
        <Button
          key=''
          size='small'
        >
          Join
        </Button>
      </TargetDialog>
    </PermissionButton>
  ]

  const EditDescription = () => {
    return (
      <PermissionButton key='edit' isShow={editCourseRole}>
        <Button
          key='edit-small'
          size='small'
          component={Link}
          href={getLocalizedUrl(`/course/${courseId}/editDescription`, locale as Locale)}
        >
          Edit
        </Button>
      </PermissionButton>
    )
  }

  return (
    <ShareContent about='course' title={course?.title} items={items} buttons={buttons}>
      <Divider />
      <div className='flex flex-col gap-4'>
        <Box className='flex justify-between '>
          <Typography variant='h5'>Description</Typography>
          <EditDescription />
        </Box>
        {course?.description ? (
          <Typography sx={{ wordWrap: 'break-word' }} dangerouslySetInnerHTML={{ __html: course?.description }} />
        ) : (
          <>
            {editCourseRole ? (
              <Typography className='text-center px-12 text-sm'>
                {`You haven't edited your course description yet. Add course descriptions to better describe your
                    course content and attract more students to sign up.`}
              </Typography>
            ) : (
              <Typography className='text-center px-12 text-sm'>{`No description yet.`}</Typography>
            )}
          </>
        )}
      </div>
      <Divider />
      <div className='flex flex-col gap-4'>
        <div className='flex justify-between'>
          <Typography variant='h5'>Instructor</Typography>
          <PermissionButton key='edit' isShow={isOrginazation}>
            <AssignInstructor refresh={async () => refreshCourse(user as UserTable, courseId)} />
          </PermissionButton>
        </div>
        <div className='flex items-center gap-4'>
          <Box
            style={{ width: 'fit-content', cursor: 'pointer' }}
            onClick={() => {
              push(`${process.env.NEXT_PUBLIC_APP_URL}/${locale}/account/${course?.user?._id}/profile/`)
            }}>
            <UserAvatar
              userImg={course?.user?.userImg} name={course?.user?.name}
            />
          </Box>
        </div>
      </div>
    </ShareContent>
  )
}

export default CourseDetail
