'use client'

// React Imports
import { useEffect, useState, ChangeEvent } from 'react'

// NextJs Imports
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

// Mui Imports
import { Box, Button, Chip, Grid, IconButton, Typography } from '@mui/material'

// Components Imports
import CustomInputHorizontal from '@/@core/components/custom-inputs/Horizontal'
import { CustomInputHorizontalData } from '@/@core/components/custom-inputs/types'
import PermissionButton from '@/components/buttons/PermissionButton'
import TargetDialog from '@/components/dialog'
import ListTable from '@/components/list-table'
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
import { getStateOfDetail, getAnswer } from '../utils'
import moment from 'moment-timezone'

// Types Imports
import { Quiz } from '@/types/course/quiz'
import { UserTable } from '@/types/user/UserTable'
import { DocumentProps, DocumentType } from '@/types/document'

// Hooks Imports
import { useCourse, useEditCourseRole } from '@/hooks/useCourse'
import { useDictionary } from '@/hooks/useDictionary'
import { useTeacher, useStudent } from '@/hooks/useGlobal'
import { useUser } from '@/hooks/useGlobal'

// Api Imports
import deleteQuiz from '@/api/course/quiz/deleteQuiz'
import { getQuizs } from '@/api/course/quiz/getQuizs'
import saveQuiz from '@/api/course/quiz/saveQuiz'
import { getLibraryQuizs } from '@/api/organization/library/quiz/getQuizs'
import deleteLibraryQuiz from '@/api/organization/library/quiz/deleteQuiz'

const typeData: CustomInputHorizontalData[] = [
  {
    title: (
      <div className='flex items-center gap-1'>
        <i className='ri-file-add-line text-textPrimary text-xl' />
        <Typography className='font-medium' color='text.primary'>
          Start from scratch
        </Typography>
      </div>
    ),
    value: '0',
    isSelected: true,
    content: 'You will need to edit this test from scratch, including editing each question and answer.'
  },
  {
    title: (
      <div className='flex items-center gap-1'>
        <i className='ri-file-pdf-2-line text-textPrimary text-xl' />
        <Typography className='font-medium' color='text.primary'>
          Upload a PDF file
        </Typography>
      </div>
    ),
    value: '1',
    content: 'You can upload existing test quiz PDF file. Then you just need to make the answer sheet for this quiz.'
  }
]

const QuizList = ({ organizationId, documentType = DocumentType.Course }: DocumentProps) => {
  //States
  const [data, setData] = useState<Array<Quiz>>()
  const isTeacher = useTeacher()
  const isStudent = useStudent()
  const isManager = false
  const { isArrange, courseId } = useCourse()
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [publishLoading, setPublishLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<string>('0')

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
        text: 'Edit Quiz',
        menuItemProps: {
          onClick: (e: any) => {
            e.stopPropagation()
            const href = getLocalizedUrl(`/course/${courseId}/detail/quiz/${row.original._id}/edit`, locale as Locale)
            replace(href)
          }
        }
      })
    }

    if (editCourseRole || documentType !== DocumentType.Course) {
      options.push({
        text: 'Delete Quiz',
        confirmText: dictionary.common.delete,
        confirm: async () => {
          await handleDelete(row.original._id)
        }
      })
    }

    return options
  }

  useEffect(() => {
    const loadQuizs = async () => {
      if (user && documentType) {
        switch (documentType) {
          case DocumentType.Course:
            if (courseId) {
              const { data } = await getQuizs(user, courseId, !isTeacher, isStudent ? 'student' : 'default')
              setData(data.quizs)
            }
            break
          case DocumentType.Organization:
            if (organizationId) {
              const { data: orgData } = await getLibraryQuizs(user, organizationId as string)
              setData(orgData.quizs)
            }
            break
        }
      }
    }
    loadQuizs()
  }, [user, courseId, isArrange, isTeacher, isManager, deleteLoading, publishLoading, documentType, organizationId])

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
          <NoWrapTitle>{`${row.original.endTime && moment.utc(row.original.endTime).tz(user?.timeZone as string).format('MMM D dddd')}
              ${row.original.endTime && moment.utc(row.original.endTime).tz(user?.timeZone as string).format('HH:mm')}
              ${`(${moment.tz(user?.timeZone as string).zoneAbbr()})`}`}</NoWrapTitle>
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
                <Typography>{getAnswer(row.original)}</Typography>
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

  const handleOptionChange = (prop: string | ChangeEvent<HTMLInputElement>) => {
    if (typeof prop === 'string') {
      setType(prop)
    } else {
      setType((prop.target as HTMLInputElement).value)
    }
  }

  const actionButtons =
    editCourseRole && documentType === DocumentType.Course ? (
      <TargetDialog
        title='Add quiz to this course'
        height={'50%'}
        open={open}
        setOpen={setOpen}
        content={
          <Grid container spacing={6}>
            {typeData.map((item, index) => (
              <CustomInputHorizontal
                key={index}
                type='radio'
                selected={type}
                handleChange={handleOptionChange}
                data={item}
                gridProps={{ xs: 12 }}
                name='auth-method'
              />
            ))}
          </Grid>
        }
        actions={
          <Button
            variant='contained'
            endIcon={<i className='ri-arrow-right-line' />}
            component={Link}
            href={getLocalizedUrl(
              `/course/${courseId}/detail/quiz/${type == '0' ? 'add' : 'add/pdf'}`,
              locale as Locale
            )}
          >
            Continue
          </Button>
        }
      >
        <PermissionButton
          key={'Create'}
          variant='contained'
          title={dictionary.common.createNew}
          text={dictionary.common.createNew}
          isShow={true}
        />
      </TargetDialog>
    ) : null

  const handleDelete = async (quizId: string) => {
    try {
      setDeleteLoading(true)
      switch (documentType) {
        case DocumentType.Course:
          await deleteQuiz(user as UserTable, courseId as string, quizId)
          break
        case DocumentType.Organization:
          await deleteLibraryQuiz(user as UserTable, organizationId as string, quizId)
          break
      }

      success(`${dictionary.common.delete} ${dictionary.common.successful}`)
    } catch {
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleRowClick = (row: TypeWithAction) => {
    const state = getStateOfDetail(row)
    if ((state === 'Submitted' && row.submitType === 1) || state === 'Active' || !isStudent) {
      let url = `/course/${courseId}/detail/quiz/${row._id}/${editCourseRole ? 'view' : 'answer'}`
      switch (documentType) {
        case DocumentType.Organization:
          url = `/organization/${organizationId}/detail/library/quiz/${row._id}/view`
          break
      }
      replace(getLocalizedUrl(url, locale as Locale))
    }
  }

  const handlePublish = async (row: TypeWithAction) => {
    row.isPublish = !row.isPublish
    setPublishLoading(true)
    await saveQuiz(user as UserTable, courseId as string, row as Quiz)
    success(row.isPublish ? 'Published!' : 'UnPublished!')
    setPublishLoading(false)
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <ListTable
          tableData={data}
          tableColumns={columns}
          searchTitle='Quiz'
          handleRowClick={handleRowClick}
          actionButtons={actionButtons}
        />
      </Grid>
    </Grid>
  )
}

export default QuizList
