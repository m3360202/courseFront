'use client'

import { deleteSession } from '@/api/course/deleteSession'
import { getSessions } from '@/api/course/getSessions'
import PermissionButton from '@/components/buttons/PermissionButton'
import ListTable from '@/components/list-table'
import { TypeWithAction } from '@/components/list-table/types'
import NoWrapTitle from '@/components/title/NoWrapTitle'
import { Locale } from '@/configs/i18n'
import { useCourse, useEditCourseRole } from '@/hooks/useCourse'
import { useDictionary } from '@/hooks/useDictionary'
import { useTeacher, useUser } from '@/hooks/useGlobal'
import { Session } from '@/types/course/session'
import { UserTable } from '@/types/user/UserTable'
import { format_w_timezone, sessionDateFormat } from '@/utils/date'
import getTimeZone from '@/utils/getTimeZone'
import { getLocalizedUrl } from '@/utils/i18n'
import { success } from '@/utils/toasts'
import { Chip, Grid } from '@mui/material'
import type { ColumnDef, Row } from '@tanstack/react-table'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import OptionsMenu from '@core/components/option-menu'
import { OptionType } from '@/@core/components/option-menu/types'

const CourseSession = ({ isManager }: { isManager?: boolean }) => {
  //States
  const [data, setData] = useState<Array<Session>>()
  const isTeacher = useTeacher()
  const { isArrange, courseId } = useCourse()
  const [deleteLoading, setDeleteLoading] = useState(false)

  //Hooks
  const user = useUser()
  const dictionary = useDictionary()
  const { lang: locale } = useParams()
  const { replace } = useRouter()
  const editCourseRole = useEditCourseRole()

  const menuOptions = (row: Row<TypeWithAction>) => {
    const options: OptionType[] = []
    if (editCourseRole) {
      options.push({
        text: 'Edit Session',
        menuItemProps: {
          onClick: (e: any) => {
            e.stopPropagation()
            const href = getLocalizedUrl(
              `/course/${courseId}/detail/session/${row.original._id}/edit`,
              locale as Locale
            )
            replace(href)
          }
        }
      })
    }

    if (editCourseRole) {
      options.push({
        text: 'Delete Session',
        confirmText: dictionary.common.delete,
        confirm: async () => {
          await handleDelete(row.original._id)
        }
      })
    }

    return options
  }

  useEffect(() => {
    const loadSessions = async () => {
      if (user) {
        const { data } = await getSessions(user, courseId, isArrange, isManager, isTeacher)
        setData(data)
      }
    }
    loadSessions()
  }, [user, courseId, isArrange, isTeacher, isManager, deleteLoading])

  //Vars
  const columns: ColumnDef<TypeWithAction, any>[] = [
    {
      id: 'name',
      header: 'Title',
      cell: ({ row }) => <NoWrapTitle>{row.original.name}</NoWrapTitle>
    },
    {
      id: 'lessonDate',
      header: 'Date',
      cell: ({ row }) => <NoWrapTitle>{sessionDateFormat(row.original.lessonDate, user?.timeZone)}</NoWrapTitle>
    },
    {
      id: 'sessionStarTime',
      header: 'Start Time',
      cell: ({ row }) => (
        <NoWrapTitle>
          {format_w_timezone(row.original.lessonDate, 'HH:mm', false, 'MMM D', getTimeZone(user), user?.timeZone)}
        </NoWrapTitle>
      )
    },
    {
      id: 'lessonDuration',
      header: 'Duration',
      cell: ({ row }) => <NoWrapTitle>{row.original.lessonDuration || 0} min</NoWrapTitle>
    },
    {
      id: 'finished',
      header: 'Status',
      cell: ({ row }) => (
        <Chip
          variant='tonal'
          size='small'
          label={row.original.finished ? 'Expired' : 'Upcoming'}
          color={row.original.finished ? 'error' : 'success'}
          className='capitalize'
        />
      )
    },
    {
      header: dictionary.common.action,
      cell: ({ row }) => <OptionsMenu iconClassName='text-textPrimary' options={menuOptions(row)} />
    }
  ]

  //
  const actionButtons = editCourseRole ? (
    <PermissionButton
      key={'Create'}
      variant='contained'
      title={dictionary.common.createNew}
      text={dictionary.common.createNew}
      isShow={true}
      component={Link}
      href={getLocalizedUrl(`/course/${courseId}/detail/session/add`, locale as Locale)}
    />
  ) : null

  const handleDelete = async (sessionId: string) => {
    try {
      setDeleteLoading(true)
      await deleteSession(user as UserTable, courseId as string, sessionId)
      success(`${dictionary.common.delete} ${dictionary.common.successful}`)
    } catch {
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleRowClick = (row: TypeWithAction) => {
    replace(getLocalizedUrl(`/course/${courseId}/detail/session/${row._id}/view`, locale as Locale))
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <ListTable
          tableData={data}
          tableColumns={columns}
          searchTitle='Session'
          handleRowClick={handleRowClick}
          actionButtons={actionButtons}
        />
      </Grid>
    </Grid>
  )
}

export default CourseSession
