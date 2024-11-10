'use client'

// Components Imports
import { useCourse, useEditCourseRole } from '@/hooks/useCourse'
import { useUser } from '@/hooks/useGlobal'
import { useEffect, useState } from 'react'
import { getLocalizedUrl } from '@/utils/i18n'
import { Locale } from '@/configs/i18n'
import { useParams } from 'next/navigation'
import { Button, Grid, Link } from '@mui/material'
import ListTable from '@/components/list-table'
import type { ColumnDef } from '@tanstack/react-table'
import type { TypeWithAction } from '@/components/list-table/types'
import UserAvatar from '@/components/user-avatar'
import Title from '@/components/title'
import { getSubmitStudents } from '@/api/course/quiz/getSubmitStudents'
import { SubmitQuiz } from '@/types/course/quiz'

const StudentList = ({ quizId }: { quizId: string }) => {
  //States
  const [students, setStudents] = useState<SubmitQuiz[]>()

  // Hooks
  const { lang: locale } = useParams()
  const { courseId, setBackUrl } = useCourse()
  const user = useUser()

  //Refs
  const editCourseRole = useEditCourseRole()

  useEffect(() => {
    const loadStudentList = async () => {
      if (user && courseId && quizId) {
        const { data } = await getSubmitStudents(user, courseId, quizId)
        setStudents(data)
      }
    }
    loadStudentList()
  }, [user, courseId, quizId])

  useEffect(() => {
    courseId &&
      setBackUrl([getLocalizedUrl(`/course/${courseId}/detail/quiz/${quizId}/view`, locale as Locale)])

    return () => {
      setBackUrl(null)
    }
  }, [courseId, quizId])

  const columns: ColumnDef<TypeWithAction, any>[] = [
    {
      id: 'name',
      header: 'Name',
      cell: ({ row }) => <UserAvatar userImg={row.original.userImg} name={row.original.name} email={row.original.email} />
    },
    {
      id: 'grade',
      header: 'Grade',
      cell: ({ row }) => <Title>{row.original.grade || '-'}</Title>
    },
    {
      id: 'grade',
      header: ' ',
      cell: ({ row }) => {
        return (
          <Button
            component={Link}
            href={getLocalizedUrl(
              `/course/${courseId}/detail/quiz/${quizId}/grade?sId=${row.original._id}`,
              locale as Locale
            )}
          >
            Grade
          </Button>
        )
      }
    }
  ]

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
          </>
        )}
      </Grid>
      {/* </CardContent>
      </Card> */}
    </>
  )
}

export default StudentList
