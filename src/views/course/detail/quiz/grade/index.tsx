'use client'

// MUI Imports
import Typography from '@mui/material/Typography'

// Components Imports
import { useCourse } from '@/hooks/useCourse'
import { useGlobal, useUser } from '@/hooks/useGlobal'
import Title from '@/components/title'
import { useEffect, useState } from 'react'
import { getLocalizedUrl } from '@/utils/i18n'
import { Locale } from '@/configs/i18n'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { UserTable } from '@/types/user/UserTable'
import { success } from '@/utils/toasts'
import { Button, Card, CardContent, Grid, TextField } from '@mui/material'

import delay from '@/utils/delay'

import { Quiz, SubmitQuiz } from '@/types/course/quiz'
import { getQuiz } from '@/api/course/quiz/getQuiz'
import { Topic } from '@/types/course/quiz/topic'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { any, object } from 'valibot'
import answerQuiz from '@/api/course/quiz/answerQuiz'
import { getSubmitStudents } from '@/api/course/quiz/getSubmitStudents'
import UserAvatar from '@/components/user-avatar'

const GradeQuiz = ({ quizId }: { quizId: string }) => {
  //States
  const [data, setData] = useState<Quiz | null>(null)
  const [answers, setAnswers] = useState<SubmitQuiz[] | null>(null)

  // Hooks
  const { lang: locale } = useParams()
  const searchParams = useSearchParams()
  const { courseId } = useCourse()
  const user = useUser()
  const { addTopButtons, setHiddenTabs, setBackUrl } = useGlobal()
  const { push } = useRouter()
  const [studentId, setStudentId] = useState<string>(searchParams.get('sId') as string)
  const [pageIndex, setPageIndex] = useState<number>(0)

  useEffect(() => {
    if (studentId && answers) setPageIndex(answers?.findIndex(c => c._id === studentId))
  }, [studentId, answers])

  useEffect(() => {
    const loadStudentAnswer = async () => {
      if (user && courseId && quizId && studentId) {
        const { data } = await getSubmitStudents(user, courseId, quizId)
        const answer = data?.find(c => c._id === studentId)
        setAnswers(data)
        setValue('topic', answer?.topic)
      }
    }
    loadStudentAnswer()
  }, [user, courseId, quizId, studentId])

  useEffect(() => {
    const loadQuiz = async () => {
      if (user && courseId && quizId) {
        const { data } = await getQuiz(user, courseId, quizId)
        setData(data)
      }
    }
    loadQuiz()
  }, [user, courseId, quizId])

  useEffect(() => {
    courseId && setBackUrl([getLocalizedUrl(`/course/${courseId}/detail/quiz/${quizId}/view`, locale as Locale)])
    setHiddenTabs(true)
    user && addTopButtons([
      <Button variant='contained' key={'save'} onClick={onSubmit}>
        Save
      </Button>
    ])

    return () => {
      setBackUrl(null)
      setHiddenTabs(null)
      addTopButtons(null)
    }
  }, [user, courseId])

  //Vars
  const schema = object({
    topic: any()
  })

  const { control, setValue, getValues } = useForm<SubmitQuiz>({
    resolver: valibotResolver(schema)
  })

  const fields = useWatch({
    control,
    name: `topic`
  })

  const totalScore = fields?.reduce((accumulator: number, currentValue: Topic) => {
    return accumulator + (currentValue.grade || 0)
  }, 0)

  const onSubmit = async () => {
    try {
      const data: SubmitQuiz = {
        _id: quizId as string,
        quizId: quizId,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        time: new Date().toString(),
        topic: getValues()['topic'],
        studentId
      }

      await answerQuiz(user as UserTable, courseId as string, data)
      success(`Graded`)
      delay(() => push(getLocalizedUrl(`/course/${courseId}/detail/quiz/${quizId}/view`, locale as Locale)), 500)
    } catch {
    } finally {
    }
  }

  const page = (isNext: boolean) => {
    if (!answers || answers.length === 0) return
    let pIndex: number | undefined = undefined
    if (isNext) {
      if (pageIndex < answers.length - 2) {
        pIndex = pageIndex + 1
        setPageIndex(pIndex)
      }
    } else {
      if (pageIndex !== 0) {
        pIndex = pageIndex - 1
        setPageIndex(pIndex)
      }
    }
    if (pIndex !== undefined) setStudentId(answers[pIndex]._id as string)
  }

  return (
    <Grid container>
      <Grid item xs={12} md={4} sx={{ position: 'sticky', top: 100 }}>
        <Card sx={{ mr: 4, mb: { xs: 4, md: 0 } }}>
          <CardContent>
            <Grid container spacing={4}>
              <Grid item xs={12} display={'flex'} justifyContent={'space-between'}>
                <Title variant='h5'>Total Questions:</Title>
                <Title variant='h5'>{data?.topic?.length || 0}</Title>
              </Grid>
              <Grid item xs={12} display={'flex'} justifyContent={'space-between'}>
                <Title variant='h5'>Total Score:</Title>
                <Title variant='h5'>{totalScore}</Title>
              </Grid>
              <Grid item xs={12} display={'flex'} mt={4} alignItems={'center'} flexDirection={'column'}>
                <UserAvatar
                  userImg={answers?.find(c => c._id === studentId)?.userImg || ''}
                  name={answers?.find(c => c._id === studentId)?.name}
                  email={answers?.find(c => c._id === studentId)?.email || ''}
                  hiddenName
                  size={100}
                />
                <Typography variant='h6'>{ }</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant='h6' textAlign={'center'}>
                  Score:<span style={{ color: 'red' }}>{totalScore}</span>/
                  {data?.topic?.reduce((accumulator: number, currentValue: Topic) => {
                    return accumulator + (currentValue.score || 0)
                  }, 0)}
                </Typography>
              </Grid>
              <Grid item xs={12} display={'flex'} justifyContent={'space-between'}>
                <Button
                  variant='outlined'
                  disabled={pageIndex === 0}
                  onClick={() => {
                    page(false)
                  }}
                >
                  Previous
                </Button>
                <Button
                  variant='outlined'
                  disabled={pageIndex === (answers ?? []).length - 1}
                  onClick={() => {
                    page(true)
                  }}
                >
                  Next
                </Button>
              </Grid>
            </Grid>
            <Grid></Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} textAlign={'center'}>
                <Title variant='h4'>{data?.title}</Title>
              </Grid>
              {fields?.map((topic, index) => (
                <>
                  <Grid item xs={12} display={'flex'} justifyContent={'space-between'}>
                    <Title variant='h5'>
                      {index + 1}.{topic.title}
                    </Title>
                    <div className='flex gap-1'>
                      <Title variant='h5'>Score:</Title>
                      <Controller
                        key={`topic.${index}.grade`}
                        name={`topic.${index}.grade`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            key={`topic[${index}].grade`}
                            variant='standard'
                            type='number'
                            inputProps={{
                              min: 0,
                              max: topic.score
                            }}
                            {...field}
                            onChange={e => setValue(`topic.${index}.grade`, parseInt(e.target.value))}
                          />
                        )}
                      />
                    </div>
                  </Grid>
                  <Grid item xs={12} display={'flex'} flexDirection={'column'}>
                    <div className='flex gap-1'>
                      <Title variant='h5'>Correct answer:</Title>
                      <Title variant='h5'>{data?.topic?.find(c => c.title === topic.title)?.value?.join(' ')}</Title>
                    </div>
                    <div className='flex gap-1'>
                      <Title variant='h5'>Student's answer:</Title>
                      <Title variant='h5'>{topic.value?.join(' ')}</Title>
                    </div>
                  </Grid>
                </>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default GradeQuiz
