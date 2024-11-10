'use client'

// React Imports
import { useEffect, useState } from 'react'

// NextJs Imports
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

// Mui Imports
import { Button, Box, Chip, Grid, IconButton, Typography } from '@mui/material'

// Types Imports
import { Assignment } from '@/types/course/assignment'
import { UserTable } from '@/types/user/UserTable'
import { DocumentProps, DocumentType } from '@/types/document'
import { FILE_PATH } from '@/types'
// Api Imports
import { deleteAssignment } from '@/api/course/assignment/deleteAssignment'
import { getAssignments } from '@/api/course/assignment/getAssignments'
import saveAssignment from '@/api/course/assignment/saveAssignment'
import { getLibraryAssignments } from '@/api/organization/library/assignment/getAssignments'
import { deleteLibraryAssignment } from '@/api/organization/library/assignment/deleteAssignment'

// Components Imports
import PermissionButton from '@/components/buttons/PermissionButton'
import { TypeWithAction } from '@/components/list-table/types'
import Title from '@/components/title'
import NoWrapTitle from '@/components/title/NoWrapTitle'
import { Locale } from '@/configs/i18n'
import format from '@/utils/format'
import { getLocalizedUrl } from '@/utils/i18n'
import { success } from '@/utils/toasts'
import type { ColumnDef, Row } from '@tanstack/react-table'
import OptionsMenu from '@core/components/option-menu'
import { OptionType } from '@/@core/components/option-menu/types'
import GetStatus from '../utils/getStatus'
import { getStateOfDetail } from '../utils'
import moment from 'moment-timezone'
import ListTable from '@/components/list-table'

// Hooks Imports
import { useCourse, useEditCourseRole } from '@/hooks/useCourse'
import { useDictionary } from '@/hooks/useDictionary'
import { useTeacher, useStudent } from '@/hooks/useGlobal'
import { useUser } from '@/hooks/useGlobal'

const AssignmentList = ({ organizationId, documentType = DocumentType.Course }: DocumentProps) => {
  //States
  const [data, setData] = useState<Array<Assignment>>()
  const isTeacher = useTeacher()
  const isStudent = useStudent()
  const isManager = false
  const { isArrange, courseId } = useCourse()
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [publishLoading, setPublishLoading] = useState(false)

  //Hooks
  const user = useUser()
  const dictionary = useDictionary()
  const { lang: locale } = useParams()
  const { replace } = useRouter()
  const editCourseRole = useEditCourseRole()

  const menuOptions = (row: Row<TypeWithAction>) => {
    const options: OptionType[] = []
    if (editCourseRole && documentType === DocumentType.Course) {
      options.push({
        text: 'Edit Assignment',
        menuItemProps: {
          onClick: (e: any) => {
            e.stopPropagation()
            const href = getLocalizedUrl(
              `/course/${courseId}/detail/assignment/${row.original._id}/edit`,
              locale as Locale
            )
            replace(href)
          }
        }
      })
    }

    if (editCourseRole || documentType !== DocumentType.Course) {
      options.push({
        text: 'Delete Assignment',
        confirmText: dictionary.common.delete,
        confirm: async () => {
          await handleDelete(row.original._id)
        }
      })
    }

    return options
  }

  useEffect(() => {
    const loadAssignments = async () => {
      if (user) {
        switch (documentType) {
          case DocumentType.Organization:
            if (organizationId) {
              const { data } = await getLibraryAssignments(user, organizationId)
              setData(data.assignments)
            }
            break
          default:
            if (courseId) {
              const { data } = await getAssignments(user, courseId, !isTeacher, isStudent ? 'student' : 'default')
              setData(data.assignments)
            }
            break
        }
      }
    }
    loadAssignments()
  }, [user, courseId, isArrange, isTeacher, isManager, deleteLoading, publishLoading, organizationId, documentType])

  //Vars
  const columns: ColumnDef<TypeWithAction, any>[] =
    !isStudent ? [
      {
        id: 'title',
        header: 'Title',
        cell: ({ row }) => (
          <div className='flex gap-2 items-center'>
            <NoWrapTitle>{row.original.title}</NoWrapTitle>
            {editCourseRole && documentType === DocumentType.Course && (
              <IconButton
                onClick={async e => {
                  e.stopPropagation()
                  await handlePublish(row.original)
                }}
              >
                <i className={row.original.isPublish ? 'ri-eye-line' : 'ri-eye-off-line'}></i>
              </IconButton>
            )}
          </div>
        )
      },
      {
        id: 'time',
        header: 'UploadTime',
        cell: ({ row }) => <NoWrapTitle>{format(row.original.time)}</NoWrapTitle>
      },
      {
        id: 'endTime',
        header: 'Due Time',
        cell: ({ row }) => (
          <NoWrapTitle>{`${moment.utc(row.original.endTime).tz(user?.timeZone as string).format('MMM D dddd')}
            ${moment.utc(row.original.endTime).tz(user?.timeZone as string).format('HH:mm')}
            (${moment.tz(user?.timeZone as string).zoneAbbr()})`}</NoWrapTitle>
        )
      },
      {
        id: 'timeZone',
        header: 'TimeZone',
        cell: () => <Title>{Intl.DateTimeFormat().resolvedOptions().timeZone}</Title>
      },
      {
        header: dictionary.common.action,
        cell: ({ row }) => <OptionsMenu iconClassName='text-textPrimary' options={menuOptions(row)} />
      }
    ] : [
      {
        id: 'title',
        header: 'Title',
        cell: ({ row }) => (
          <div className='flex gap-2 items-center'>
            <NoWrapTitle>{row.original.title}</NoWrapTitle>
            {editCourseRole && documentType === DocumentType.Course && (
              <IconButton
                onClick={async e => {
                  e.stopPropagation()
                  await handlePublish(row.original)
                }}
              >
                <i className={row.original.isPublish ? 'ri-eye-line' : 'ri-eye-off-line'}></i>
              </IconButton>
            )}
          </div>
        )
      },
      {
        id: 'time',
        header: 'UploadTime',
        cell: ({ row }) => <NoWrapTitle>{format(row.original.time)}</NoWrapTitle>
      },
      {
        id: 'timeZone',
        header: 'TimeZone',
        cell: () => <Title>{Intl.DateTimeFormat().resolvedOptions().timeZone}</Title>
      },
      {
        header: dictionary.common.action,
        cell: ({ row }) => <OptionsMenu iconClassName='text-textPrimary' options={menuOptions(row)} />
      },
      {
        id: 'isGrade',
        header: 'Status',
        cell: ({ row }) => (
          <GetStatus detail={row.original} />
        )
      },
      {
        id: 'endTime',
        header: 'Due Time',
        cell: ({ row }) => (
          <NoWrapTitle>{`${moment.utc(row.original.endTime).tz(user?.timeZone as string).format('MMM D dddd')}
            ${moment.utc(row.original.endTime).tz(user?.timeZone as string).format('HH:mm')}
            (${moment.tz(user?.timeZone as string).zoneAbbr()})`}</NoWrapTitle>
        )
      },
      {
        id: 'isSubmit',
        header: 'Your Answer',
        cell: ({ row }) => {
          const state = getStateOfDetail(row.original)
          if (state === 'Graded') {

            return (
              <Box>
                <Button
                  color='primary'
                  size='small'
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(`${FILE_PATH}${row.original.answer}`)
                  }}
                >
                  View Answer
                </Button>
                <Typography>{`${moment.utc(row.original.submitTime).tz(user?.timeZone as string).format('MMM D dddd')}
            ${moment.utc(row.original.submitTime).tz(user?.timeZone as string).format('HH:mm')}
            (${moment.tz(user?.timeZone as string).zoneAbbr()})`}</Typography>
              </Box>
            )
          }
          else if (state === 'Submitted') {

            return (
              <Box>
                <Button color='primary' size='small'>{row.original.submitType === 0 ? 'Submited' : 'Resubmit'}</Button>
                <Typography>{`${moment.utc(row.original.submitTime).tz(user?.timeZone as string).format('MMM D dddd')}
            ${moment.utc(row.original.submitTime).tz(user?.timeZone as string).format('HH:mm')}
            (${moment.tz(user?.timeZone as string).zoneAbbr()})`}</Typography>
              </Box>
            )
          }
          else if (state === 'Active') {

            return (
              <Button color='primary' size='small'>Start</Button>
            )
          }
          else {

            return (
              <></>
            )
          }
        }
      },
      {
        id: 'grade',
        header: 'Grade',
        cell: ({ row }) => {
          const state = getStateOfDetail(row.original)
          if (state === 'Graded') {

            return (
              <Chip
                label={`${row.original.grade}/${row.original.totalScore}`}
                size='small'
                color='success'
                variant='tonal'
                className='self-start rounded-sm'
              />
            )
          }
          if (state === 'Submitted') {

            return (
              <Chip
                label='pending'
                size='small'
                color='primary'
                variant='tonal'
                className='self-start rounded-sm'
              />
            )
          }
        }
      },
      {
        header: dictionary.common.action,
        cell: ({ row }) => <OptionsMenu iconClassName='text-textPrimary' options={menuOptions(row)} />
      }
    ]

  const actionButtons =
    editCourseRole && documentType === DocumentType.Course ? (
      <PermissionButton
        key={'Create'}
        variant='contained'
        title={dictionary.common.createNew}
        text={dictionary.common.createNew}
        isShow={true}
        component={Link}
        href={getLocalizedUrl(`/course/${courseId}/detail/assignment/add`, locale as Locale)}
      />
    ) : null

  const handleDelete = async (assignmentId: string) => {
    try {
      setDeleteLoading(true)
      switch (documentType) {
        case DocumentType.Organization:
          await deleteLibraryAssignment(user as UserTable, organizationId as string, assignmentId)
          break
        default:
          await deleteAssignment(user as UserTable, courseId as string, assignmentId)
          break
      }

      success(`${dictionary.common.delete} ${dictionary.common.successful}`)
    } catch {
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleRowClick = (row: TypeWithAction) => {
    // const state = getStateOfDetail(row)
    // if ((state === 'Submitted' && row.submitType === 1) || state === 'Active') {
    //   let url = `/course/${courseId}/detail/assignment/${row._id}/view`
    //   switch (documentType) {
    //     case DocumentType.Organization:
    //       url = `/organization/${organizationId}/detail/library/assignment/${row._id}/view`
    //       break
    //   }


    // }
    replace(getLocalizedUrl(`/course/${courseId}/detail/assignment/${row._id}/view`, locale as Locale))
  }

  const handlePublish = async (row: TypeWithAction) => {
    row.isPublish = !row.isPublish
    setPublishLoading(true)
    await saveAssignment(user as UserTable, courseId as string, row as Assignment)
    success(row.isPublish ? 'Published!' : 'UnPublished!')
    setPublishLoading(false)
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <ListTable
          tableData={data}
          tableColumns={columns}
          searchTitle='Assignment'
          handleRowClick={handleRowClick}
          actionButtons={actionButtons}
        />
      </Grid>
    </Grid>
  )
}

export default AssignmentList
