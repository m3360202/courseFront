'use client'

// MUI Imports
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

// Components Imports
import { useCourse, useEditCourseRole } from '@/hooks/useCourse'
import { DetailItem } from '@/types'
import getTimeZone from '@/utils/getTimeZone'
import { useTeacher, useUser } from '@/hooks/useGlobal'
import { sessionDateTimeFormat } from '@/utils/date'
import Title from '@/components/title'
import { useEffect, useState } from 'react'
import { Session } from '@/types/course/session'
import { getSession } from '@/api/course/getSession'
import { getLocalizedUrl } from '@/utils/i18n'
import { Locale } from '@/configs/i18n'
import { useParams, useRouter } from 'next/navigation'
import PermissionButton from '@/components/buttons/PermissionButton'
import { useDictionary } from '@/hooks/useDictionary'
import Link from 'next/link'
import { UserTable } from '@/types/user/UserTable'
import LoadingButton from '@mui/lab/LoadingButton'
import { deleteSession } from '@/api/course/deleteSession'
import { error, success } from '@/utils/toasts'
import ConfirmDialog from '@/components/confirm'
import { delay } from 'lodash'
import ShareContent from '../../../component/ShareContent'
import { Button } from '@mui/material'
import Statistics from '../student-list/Statistics'
import StudentAttendance from '../student-list/StudentAttendance'
import { StatusList } from '@/types/course/student'
import documentToScroll from '@/utils/documentToScroll'
import showRecord from '@/utils/course/showRecord'
import gotoRecord from '@/utils/course/gotoRecord'
import gotoMeet from '@/utils/course/gotoMeet'

const ViewSession = ({ sessionId }: { sessionId: string }) => {
  //States
  const [data, setData] = useState<Session | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [changeStatus, setChangeStatus] = useState(false)
  const [statusCountList, setStatusCountList] = useState<StatusList[]>()

  // Hooks
  const { lang: locale, organizationId } = useParams()
  const { courseId, course, setBackUrl, addActionButtons } = useCourse()
  const user = useUser()
  const isTeacher = useTeacher()
  const dictionary = useDictionary()
  const { push } = useRouter()
  const editCourseRole = useEditCourseRole()

  useEffect(() => {
    const loadSession = async () => {
      if (user && courseId && sessionId) {
        const { data } = await getSession(user, courseId, sessionId)
        setData(data)
      }
    }
    loadSession()
  }, [user, courseId, sessionId])

  useEffect(() => {
    courseId && setBackUrl([getLocalizedUrl(`/course/${courseId}/detail/session`, locale as Locale)])
    let record = false
    if (user && data) {
      record = showRecord(user, data.lessonDate, data.timeZone, data?.lessonDuration)
    }
    const btn = record ? (
      course?.offline ? (
        <></>
      ) : (
        <LoadingButton
          variant='contained'
          onClick={async () => {
            await gotoRecord(user as UserTable, data?.recording)
          }}
        >
          replay
        </LoadingButton>
      )
    ) : (
      <Button
        variant='contained'
        onClick={() => {
          gotoMeet(user as UserTable, courseId, sessionId, data?.name as string, isTeacher, false)
        }}
      >
        {course?.offline ? `Proctor Mode` : 'Start Session'}
      </Button>
    )
    addActionButtons([btn])

    return () => {
      addActionButtons(null)
      setBackUrl(null)
    }
  }, [user, courseId, sessionId, data])

  //Vars
  const items: DetailItem[] = [
    // {
    //   title: 'Title',
    //   value: data?.name,
    //   col: 1
    // },
    {
      title: 'Schedule',
      value: sessionDateTimeFormat(data?.lessonStartTime as Date, user?.timeZone),
      col: 1
    },
    {
      title: 'Timezone',
      value: getTimeZone(user),
      col: 1
    }
  ]

  const handleDelete = async () => {
    try {
      setDeleteLoading(true)
      await deleteSession(user as UserTable, courseId as string, sessionId)
      success(`${dictionary.common.delete} ${dictionary.common.successful}`)
      delay(() => push(`/course/${courseId}/detail/session`), 500)
    } catch (err) {
      error((error as unknown as { message: string })?.message)
    } finally {
      setDeleteLoading(false)
    }
  }

  const buttons = [
    <PermissionButton key={'edit'} isShow={editCourseRole}>
      <Button
        size='small'
        onClick={() => {
          documentToScroll('studentList')
        }}
      >
        Student list
      </Button>
    </PermissionButton>,
    <PermissionButton key={'edit'} isShow={editCourseRole}>
      <Button
        size='small'
        component={Link}
        href={getLocalizedUrl(`/course/${courseId}/detail/session/${sessionId}/edit`, locale as Locale)}
      >
        Edit
      </Button>
    </PermissionButton>,
    <PermissionButton key={'delete'} isShow={editCourseRole}>
      <ConfirmDialog
        title={dictionary.common.delete}
        confirm={async () => {
          await handleDelete()
        }}
      >
        <LoadingButton size='small' loading={deleteLoading}>
          Delete
        </LoadingButton>
      </ConfirmDialog>
    </PermissionButton>
  ]

  return (
    <>
      <ShareContent about='session' title={data?.name} items={items} buttons={buttons}>
        <Divider />
        <div className='flex flex-col gap-4'>
          <Typography variant='h5'>Description</Typography>
          <Title dangerouslySetInnerHTML={{ __html: data?.description || '' }} />
        </div>
        <Divider />
      </ShareContent>
      {editCourseRole && (
        <div id='studentList'>
          <Statistics
            courseId={courseId}
            sessionId={sessionId}
            changeStatus={changeStatus}
            statusCountList={statusCountList}
            setStatusCountList={setStatusCountList}
          />
          <StudentAttendance
            sessionId={sessionId}
            changeStatus={changeStatus}
            statusCountList={statusCountList}
            organizationId={organizationId as string}
            setChangeStatus={setChangeStatus}
          />
        </div>
      )}
    </>
  )
}

export default ViewSession
