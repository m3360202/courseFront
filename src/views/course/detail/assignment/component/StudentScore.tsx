'use client'

// Components Imports
import { useCourse, useEditCourseRole } from '@/hooks/useCourse'
import { useUser } from '@/hooks/useGlobal'
import { useEffect, useRef, useState } from 'react'
import { getLocalizedUrl } from '@/utils/i18n'
import { Locale } from '@/configs/i18n'
import { useParams } from 'next/navigation'
import { UserTable } from '@/types/user/UserTable'
import { Grid, InputAdornment, TextField, Typography } from '@mui/material'
import { Student } from '@/types/course/student'
import ListTable from '@/components/list-table'
import type { ColumnDef } from '@tanstack/react-table'
import type { TypeWithAction } from '@/components/list-table/types'
import UserAvatar from '@/components/user-avatar'
import { getStudentList } from '@/api/course/assignment/getAssignmentStudents'
import ConfirmDialog from '@/components/confirm'
import { LoadingButton } from '@mui/lab'
import { RequiredStar } from '@/components/form-field'
import { updateStudentScore } from '@/api/course/assignment/updateStudentScore'
import Title from '@/components/title'
import { showFileTypeImg } from '@/utils/document/getFileType'
import { DownloadButton, FileViewButton } from '@/components/buttons'
import StudentAnswer from './StudentAnswer'

const StudentScore = ({
  assignmentId,
  totalScore,
  uploadLoading,
  isSubmit,
  isScored
}: {
  assignmentId: string
  totalScore: number
  uploadLoading: boolean
  isSubmit?: boolean
  isScored?: boolean
}) => {
  //States
  const [students, setStudents] = useState<Student[]>()
  const [score, setScore] = useState<string>()
  const [scoreLoading, setScoreLoading] = useState(false)

  // Hooks
  const { lang: locale } = useParams()
  const { courseId, setBackUrl } = useCourse()
  const user = useUser()

  //Refs
  const scoreRef = useRef(null)
  const editCourseRole = useEditCourseRole()

  useEffect(() => {
    const loadStudentList = async () => {
      if (user && courseId && assignmentId) {
        const { data } = await getStudentList(user, courseId, assignmentId)
        setStudents(data?.students)
      }
    }
    loadStudentList()
  }, [user, courseId, assignmentId, scoreLoading, uploadLoading])

  useEffect(() => {
    courseId &&
      setBackUrl([
        getLocalizedUrl(`/course/${courseId}/detail/assignment/${assignmentId}/view`, locale as Locale)
      ])

    return () => {
      setBackUrl(null)
    }
  }, [courseId, assignmentId])

  const columns: ColumnDef<TypeWithAction, any>[] = [
    {
      id: 'name',
      header: 'Name',
      cell: ({ row }) => <UserAvatar userImg={row.original.userImg} name={row.original.name} />
    },
    {
      id: 'score',
      header: 'Score',
      cell: ({ row }) => {
        return (
          <ConfirmDialog
            title={`Set ${row.original.name}'s score`}
            confirm={async () => {
              await handleScore(row.original._id)
            }}
            content={
              <TextField
                key='score'
                ref={scoreRef}
                defaultValue={row.original.score}
                fullWidth
                type='number'
                label='Set score'
                {...(score !== undefined && {
                  error: true,
                  helperText: 'The field is required!'
                })}
                InputProps={{
                  startAdornment: <InputAdornment position='start'>{<RequiredStar />}</InputAdornment>,
                  endAdornment: <Typography>/{totalScore}</Typography>
                }}
                inputProps={{ max: totalScore }}
              />
            }
          >
            {row.original.isSubmit ? (
              <LoadingButton
                loading={scoreLoading}
                onClick={() => {
                  setScore(row.original.score.toString())
                }}
              >
                {row.original.score ? `${row.original.score}/${totalScore}` : 'Score'}
              </LoadingButton>
            ) : (
              <></>
            )}
          </ConfirmDialog>
        )
      }
    }
  ]

  const answerColumns: ColumnDef<TypeWithAction, any>[] = [
    {
      id: 'name',
      header: 'Name',
      cell: ({ row }) => <UserAvatar userImg={row.original.userImg} name={row.original.name} />
    },
    {
      id: 'fileName',
      header: 'FileName',
      cell: ({ row }) => (
        <div className='flex gap-2'>
          {showFileTypeImg(false, row.original.files?.[0]?.final)}
          <Title>{row.original.files?.[0]?.final}</Title>
        </div>
      )
    },
    {
      header: 'action',
      cell: ({ row }) => {
        const file = row.original.files && row.original.files.length > 0 ? row.original.files[0] : undefined

        return (
          <div className='flex gap-2'>
            <FileViewButton file={file} />
            <DownloadButton file={file} />
          </div>
        )
      }
    }
  ]

  const handleScore = async (studentId: string) => {
    const score = (scoreRef?.current as never as HTMLElement).querySelector('input')?.value
    if (!score) return
    setScoreLoading(true)
    await updateStudentScore(user as UserTable, courseId, assignmentId, studentId, parseInt(score))
    setScoreLoading(false)
  }

  return (
    <>
      {/* <Card sx={{ mt: 4 }}>
        <CardContent> */}
      <Grid container spacing={2}>
        {/* <Grid item xs={12}>
          <Typography variant='h5'>Student List ({studentList?.students?.length || 0})</Typography>
        </Grid> */}
        {editCourseRole && (
          <>
            <Grid item xs={12}>
              <ListTable
                title='Student list'
                tableData={students}
                tableColumns={columns}
                searchTitle='by UserName or NickName'
                pagination={false}
              />
            </Grid>
            <Grid item xs={12} mt={2}>
              <ListTable
                title='Student answer'
                tableData={students?.filter(c => c.isSubmit)}
                tableColumns={answerColumns}
                searchTitle='by UserName or NickName'
                pagination={false}
              />
            </Grid>
          </>
        )}
        {!editCourseRole && (
          <Grid item xs={12}>
            <StudentAnswer
              files={students?.find(c => c._id === user?._id)?.files}
              isScored={isScored}
              isSubmit={isSubmit}
              score={students?.find(c => c._id === user?._id)?.score as number}
              submitTime={students?.find(c => c._id === user?._id)?.submitTime}
            />
          </Grid>
        )}
      </Grid>
      {/* </CardContent>
      </Card> */}
    </>
  )
}

export default StudentScore
