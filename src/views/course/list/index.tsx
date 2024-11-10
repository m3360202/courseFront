'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import { Box, Chip } from '@mui/material'
import LinearProgress from '@mui/material/LinearProgress'

// Next Imports
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

// Component Imports
import type { ColumnDef, Row } from '@tanstack/react-table'
import ListTable from '@/components/list-table'
import type { TypeWithAction } from '@/components/list-table/types'
import { OptionType } from '@/@core/components/option-menu/types'
import UserAvatar from '@/components/user-avatar'
import { getSessionStatusColor, getSessionStatusText } from '@/utils/getSessionStatus'
import getNextSession from '@/utils/getNextSession'
import PermissionButton from '@/components/buttons/PermissionButton'
import { success } from '@/utils/toasts'
import JoinCourse from '../component/JoinCourse'
import { getLocalizedUrl } from '@/utils/i18n'
import { Locale } from '@/configs/i18n'
import NoWrapTitle from '@/components/title/NoWrapTitle'
import OptionsMenu from '@core/components/option-menu'
import moment from 'moment-timezone'

// Hooks Imports
import { useUser, useTeacher, useGlobal } from '@/hooks/useGlobal'
import { useDictionary } from '@/hooks/useDictionary'

// Api Imports
import { getCourses } from '@/api/course/getCourses'
import { deleteCourse } from '@/api/course/deleteCourse'

// Types Imports
import type { ArrangeType, Course } from '@/types/course'
import { UserTable } from '@/types/user/UserTable'
import { Session } from '@/types/course/session'

const CourseList = ({
  organizationId,
  isManager,
  userId,
  arrangeType,
  hiddenActions,
  source = 'coursePage'
}: {
  organizationId?: string
  isManager?: boolean
  userId?: string
  arrangeType?: ArrangeType
  hiddenActions?: boolean
  source?: string
}) => {
  //States
  const [data, setData] = useState<Array<Course>>()
  const [, setLoading] = useState<boolean>(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)
  const [hiddenExpired, setHiddenExpired] = useState(true)
  //Hooks
  const user = useUser()
  const isTeacher = useTeacher()
  const { lang: locale } = useParams()
  const { replace } = useRouter()
  const fromDashBoard = source === 'dashboardPage'
  const { setTitle } = useGlobal()

  useEffect(() => {
    setTitle(dictionary.course.course)
  }, [])


  const processCoursesData = (data: Course[], timeZone: string) => {
    return data
      .map(i => {
        i.sessionStatus = getSessionStatusText(i.startTime, i.endTime, timeZone)

        return i
      })
      .sort((a, b) => {
        const statusOrder: Record<string, number> = {
          Active: 1,
          Upcoming: 2,
          Expired: 3
        }

        const statusComparison = statusOrder[a.sessionStatus as string] - statusOrder[b.sessionStatus as string]

        if (statusComparison !== 0) {
          return statusComparison
        }

        return new Date(b.postAt as string).getTime() - new Date(a.postAt as string).getTime()
      })
  }

  const getLessonDoneCount = (lessons: any) => {
    if (!lessons || lessons.length === 0) {
      return 0
    }

    const now = new Date().toISOString()

    const doneLessons = lessons.filter((lesson: any) => {
      const lessonStartTime = new Date(lesson.lessonStartTime)

      const lessonEndTime = new Date(lessonStartTime.getTime() + lesson.lessonDuration * 60000)

      return lessonEndTime.toISOString() <= now
    })

    return doneLessons.length
  }

  const filterExpiredCourses = (courses: Course[]) => {

    return courses.filter(row => {
      const status = getSessionStatusText(row.startTime, row.endTime, user?.timeZone)

      return status !== 'Expired'
    })
  }

  const addNextSessionToData = (data: Course[]): Course[] => {
    const result: Course[] = [];

    if (data && data.length > 0) {
      data.forEach((item) => {
        // Ensure item.lessons is an array or default to an empty array
        const lessons: Session[] = item.lessons || [];
        const offLine: boolean = item.offline || false;
        // Call getNextSession and ensure no empty string is returned
        const nextSession: Session | null | undefined =
          (getNextSession(lessons, offLine, item.timeZone) || null) as Session | null | undefined;

        // Create a new object with all the properties of item, and add nextSession
        const updatedItem: Course = {
          ...item,
          nextSession, // Assign the nextSession to the new object
        };
        result.push(updatedItem); // Push the updated item into the result array
      });
    }

    return result;
  };

  useEffect(() => {
    const loadCourses = async () => {
      if (user) {
        setLoading(true)
        let { data } = await getCourses(user, organizationId, arrangeType, userId)
        data = processCoursesData(data, user.timeZone)
        if (fromDashBoard || hiddenExpired) {
          setData(filterExpiredCourses(addNextSessionToData(data)))
        } else {
          setData(addNextSessionToData(data))
        }

        setLoading(false)
      }
    }
    loadCourses()
  }, [user, deleteLoading, joinOpen, organizationId, hiddenExpired])

  //Vars
  const dictionary = useDictionary()
  const columns: ColumnDef<TypeWithAction, any>[] = [
    {
      id: 'title',
      header: dictionary.course.title,
      cell: ({ row }) => {
        const title = row.original.title
        const truncatedTitle = title.length > 60 ? title.substring(0, 57) + '...' : title

        return (
          <Tooltip title={title}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {truncatedTitle}
            </span>
          </Tooltip>
        );
      },
    },
    {
      id: 'user.name',
      header: dictionary.course.instructor,
      enableSorting: true,
      cell: ({ row }) => (
        <UserAvatar
          userImg={row.original.user?.userImg}
          name={row.original.user?.name}
          email={row.original.user?.email}
        />
      )
    },

    // {
    //   id: 'timeZone',
    //   header: dictionary.course.timeZone,
    //   cell: ({ row }) => <NoWrapTitle>{row.original.timeZone ?? ''}</NoWrapTitle>
    // },
    {
      id: 'capacity',
      header: dictionary.course.roster,
      cell: ({ row }) => (
        <div style={{ display: 'flex', alignItems: ' center' }}>
          <i className='ri-user-fill' style={{ fontSize: '12px', marginRight: '5px' }} />
          <NoWrapTitle sx={{ color: '#1976d2', fontSize: '14px' }}>
            {!row?.original.capacity
              ? ''
              : `${row.original.students?.filter((c: any) => c.status === 2 || c.status === -1)?.length || 0
              }/${row?.original.capacity}`}
          </NoWrapTitle>
        </div>
      )
    },
    {
      id: 'nextSession',
      header: dictionary.course.nextSession,
      cell: ({ row }) => {
        const nextSession = getNextSession(row.original.lessons, row.original.offline, user?.timeZone)

        return (
          <Box className='flex flex-col'>
            <NoWrapTitle sx={{ color: '#1976d2', fontSize: '14px', marginBottom: '10px' }}>
              {nextSession
                ? `${moment.utc(nextSession.lessonDate).tz(user?.timeZone as string).format('MMM D dddd')}
              ${moment.utc(nextSession.lessonStartTime).tz(user?.timeZone as string).format('HH:mm')}
              (${moment.tz(user?.timeZone as string).zoneAbbr()})`
                : ' '}
            </NoWrapTitle>
            <Box className='flex flex-row items-center'>
              <LinearProgress
                color='primary'
                value={Math.floor(
                  ((getLessonDoneCount(row.original.lessons) || 0) /
                    (row.original.lessons?.length || 1)) *
                  100
                )}
                variant='determinate'
                className='w-1/2 bs-2'
              />
              <NoWrapTitle sx={{ color: '#1976d2', fontSize: '14px', marginLeft: '10px' }}>
                {!row?.original.lessons
                  ? '0/0'
                  : `${getLessonDoneCount(row.original.lessons) || 0}/${row.original.lessons?.length || 1}`}
              </NoWrapTitle>
            </Box>
          </Box>
        )
      }
    },
    {
      id: 'status',
      header: dictionary.course.status,
      cell: ({ row }) => {
        const label = row.original.sessionStatus
        const color = getSessionStatusColor(label)

        return <Chip variant='tonal' label={label} size='small' color={color} className='capitalize' />
      }
    }
  ]

  if (!fromDashBoard) {
    columns.push({
      header: dictionary.common.action,
      cell: ({ row }) => <OptionsMenu iconClassName='text-textPrimary' options={menuOptions(row)} />
    })
  }

  const menuOptions = (row: Row<TypeWithAction>) => {
    if (hiddenActions) return []
    const options: OptionType[] = []
    if (row.original.isEdit) {
      options.push({
        text: 'Edit Course',
        menuItemProps: {
          onClick: (e: any) => {
            e.stopPropagation()
            const href = getLocalizedUrl(`/course/${row.original._id}/edit`, locale as Locale)
            replace(href)
          }
        }
      })
    }

    if (row.original.isDelete) {
      options.push({
        text: 'Delete Course',
        confirmText: dictionary.common.delete,
        confirm: async () => {
          await handleDelete(row.original._id)
        }
      })
    }

    return options
  }

  const actionButtons = (
    <>
      {
        // <TargetDialog
        //   title={item ? dictionary.common.edit : dictionary.common.add + ' ' + dictionary.course.course}
        //   open={addOpen}
        //   setOpen={setAddOpen}
        //   content={<SaveCourse setRef={setRef} setLoading={setLoading} item={item} />}
        //   actions={submitButton}
        // >
        <PermissionButton
          variant='contained'
          title={dictionary.common.createNew}
          text={dictionary.common.createNew}
          isShow={isTeacher || isManager}
          component={Link}
          href={getLocalizedUrl('/course/add', locale as Locale)}
        // onClick={() => {
        //   push(`/course/add`)
        // }}
        />
        // </TargetDialog>
      }
      <PermissionButton isShow={!organizationId}>
        <JoinCourse open={joinOpen} setOpen={setJoinOpen} />
      </PermissionButton>
      {/* <TargetDialog
        title={dictionary.course.joinCourse}
        open={joinOpen}
        setOpen={setJoinOpen}
        content={}
        actions={submitButton}
      >
        <LoadingButton variant='contained'>{dictionary.course.joinCourse}</LoadingButton>
      </TargetDialog> */}
    </>
  )

  const handleDelete = async (couseId: string) => {
    try {
      setDeleteLoading(true)
      await deleteCourse(user as UserTable, couseId)
      success(`${dictionary.common.delete} ${dictionary.common.successful}`)
    } catch {
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleRowClick = (row: TypeWithAction) => {
    replace(getLocalizedUrl(`/course/${row._id}/detail`, locale as Locale))
  }

  const statusOrder: { [key in 'Active' | 'Upcoming' | 'Expired']: number } = {
    Active: 1,
    Upcoming: 2,
    Expired: 3
  }

  const sortColumns = (rows: TypeWithAction[]) => {
    return rows.sort((a, b) => {
      const statusA = getSessionStatusText(a.startTime, a.endTime, user?.timeZone) as 'Active' | 'Upcoming' | 'Expired'
      const statusB = getSessionStatusText(b.startTime, b.endTime, user?.timeZone) as 'Active' | 'Upcoming' | 'Expired'

      if (statusOrder[statusA] !== statusOrder[statusB]) {
        return statusOrder[statusA] - statusOrder[statusB]
      }

      const nextLessonA = getNextSession(a.lessons, a.offline, user?.timeZone)
      const nextLessonB = getNextSession(b.lessons, b.offline, user?.timeZone)

      const nextLessonTimeA = nextLessonA
        ? new Date(nextLessonA.lessonDate).getTime() + new Date(nextLessonA.lessonStartTime).getTime()
        : Infinity
      const nextLessonTimeB = nextLessonB
        ? new Date(nextLessonB.lessonDate).getTime() + new Date(nextLessonB.lessonStartTime).getTime()
        : Infinity

      return nextLessonTimeA - nextLessonTimeB
    })
  }

  const sortColumn = sortColumns(columns) as ColumnDef<TypeWithAction, any>[]

  const tableData = fromDashBoard ? data?.slice(0, 6) : data

  const handleViewAll = () => {
    replace(getLocalizedUrl(`/course`, locale as Locale))
  }

  return (
    <Grid container spacing={6}>
      {/* <Grid item xs={12}>
        <UserListCards />
      </Grid> */}
      <Grid item xs={12}>
        <ListTable
          tableData={tableData}
          tableColumns={sortColumn}
          searchTitle='Course'
          actionButtons={hiddenActions ? null : actionButtons}
          handleRowClick={handleRowClick}
          pagination={!fromDashBoard}
          title={fromDashBoard ? 'Course' : ''}
        />
        {data && fromDashBoard && (
          <CardContent>
            <Button onClick={handleViewAll}>View All Courses</Button>
          </CardContent>
        )}
        {data && !fromDashBoard && !hiddenExpired && (
          <CardContent sx={{ textAlign: 'center' }}>
            <Button onClick={() => { setHiddenExpired(true) }}>Hide expired courses</Button>
          </CardContent>
        )}
        {data && !fromDashBoard && hiddenExpired && (
          <CardContent sx={{ textAlign: 'center' }}>
            <Button onClick={() => { setHiddenExpired(false) }}>Show all course</Button>
          </CardContent>
        )}
      </Grid>
    </Grid>
  )
}

export default CourseList
