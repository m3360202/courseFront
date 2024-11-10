'use client'

// MUI Imports
import Typography from '@mui/material/Typography'

// Components Imports
import { useCourse } from '@/hooks/useCourse'
import { BASE_URL } from '@/types'
import { useUser } from '@/hooks/useGlobal'
import Title from '@/components/title'
import { useEffect, useState } from 'react'
import { error } from '@/utils/toasts'
import {
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  Radio,
  RadioGroup
} from '@mui/material'
import { Quiz, SubmitQuiz } from '@/types/course/quiz'
import { getQuiz } from '@/api/course/quiz/getQuiz'
import { Topic, TopicType } from '@/types/course/quiz/topic'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css'
import { getSubmitStudents } from '@/api/course/quiz/getSubmitStudents'
import TargetDialog from '@/components/dialog'
import ListTable from '@/components/list-table'
import type { ColumnDef } from '@tanstack/react-table'
import { TypeWithAction } from '@/components/list-table/types'
import UserAvatar from '@/components/user-avatar'

const Statistics = ({ quizId }: { quizId: string }) => {
  //States
  const [data, setData] = useState<Quiz | null>(null)
  const [students, setStudents] = useState<SubmitQuiz[]>()
  const [showAnswers, setShowAnswers] = useState(false)
  const [currentTopicId, setCurrentTopicId] = useState<string>()
  const [answers, setAnswers] = useState<SubmitQuiz[]>()

  // Hooks
  const { courseId } = useCourse()
  const user = useUser()

  useEffect(() => {
    const loadData = async () => {
      if (user && courseId && quizId) {
        const { data } = await getQuiz(user, courseId, quizId)
        setData(data)
        const { data: studentData } = await getSubmitStudents(user, courseId, quizId, false)
        setStudents(studentData)
      }
    }
    loadData()
  }, [user, courseId, quizId])

  const calculateAccuracy = (item: Topic, choice?: string) => {
    if (!students || students.length === 0) return 0
    const studentCount = students.filter(c => c.isSubmit).length || 0
    if (!studentCount) return 0
    switch (item.questionType) {
      case TopicType.Multiple:
      case TopicType.Single:
      case TopicType.TrueOrFalse:
        let correctStudentsCount = 0
        students?.map(student => {
          if (!choice) {
            if (
              student.isSubmit &&
              student.topic?.find(c => c._id === item._id)?.value?.join(' ') === item.value?.join(' ')
            )
              correctStudentsCount++
          } else {
            if (student.isSubmit && student.topic?.find(c => c._id === item._id)?.value?.includes(choice))
              correctStudentsCount++
          }
        })

        return choice ? `${correctStudentsCount} / ${studentCount}` : (correctStudentsCount / studentCount) * 100
      default:
        let studentsGrade = 0
        students?.map(student => {
          studentsGrade += student.topic?.find(c => c._id === item._id)?.grade || 0
        })
        if (!item.score) return 0

        return (studentsGrade / studentCount / item.score) * 100
    }
  }

  const getAccuracy = (item: Topic) => {
    const accuracy = calculateAccuracy(item) as number
    if (accuracy < 60) return { accuracy: accuracy.toFixed(2), color: 'red' }
    else if (accuracy >= 60 && accuracy <= 80) return { accuracy: accuracy.toFixed(2), color: 'blue' }
    else return { accuracy: accuracy.toFixed(2), color: 'green' }
  }

  const getAccuracyItem = (item: Topic, choice: string) => {
    return calculateAccuracy(item, choice)
  }

  const handleShowAnswers = (topic: Topic, choice?: string) => {
    if (!students?.find(c => c.isSubmit)) {
      error('No students have answered this option!')

      return false
    }
    setCurrentTopicId(topic._id)
    if (!choice) setAnswers(students.filter(c => c.isSubmit))
    else
      setAnswers(
        students.filter(c => c.isSubmit && c.topic?.find(c => c._id === topic._id && c.value?.includes(choice)))
      )
    setShowAnswers(true)
  }

  const columns: ColumnDef<TypeWithAction, any>[] = [
    {
      id: 'name',
      header: 'Student',
      cell: ({ row }) => <UserAvatar userImg={row.original.userImg} name={row.original.name} />
    },
    {
      id: 'answer',
      header: 'Answer',
      cell: ({ row }) => (
        <Title>{row.original.topic?.find((c: Topic) => c._id === currentTopicId)?.value?.join(' ')}</Title>
      )
    }
  ]

  const renderAccuracy = (topic: Topic, title: string) => (
    <Button
      onClick={() => {
        handleShowAnswers(topic, title)
      }}
    >
      <Typography fontWeight={'bold'} color={'blue'}>
        {getAccuracyItem(topic, title)}
      </Typography>
    </Button>
  )

  return (
    <Card>
      <CardContent>
        <Typography variant='h5' sx={{ pb: 2 }}>
          Statistics
        </Typography>
        <Grid container spacing={4}>
          {data?.topic?.map((topic, index) => (
            <>
              <Grid item xs={data?.quizType === 1 ? 3 : 12}>
                <div className='flex justify-between'>
                  <Title variant='h5'>
                    {index + 1}.{topic.title}
                  </Title>
                  {/* <TargetDialog
                    title='Student answer list'
                    width={'60%'}
                    open={showAnswers}
                    setOpen={setShowAnswers}
                    content={
                      <ListTable
                        tableData={answers}
                        tableColumns={columns}
                        pagination={false}
                        noCard
                        searchTitle='by UserName or NickName'
                      />
                    }
                  > */}
                  <Button
                    onClick={() => {
                      return handleShowAnswers(topic)
                    }}
                  >
                    <Typography fontWeight={'bold'} color={getAccuracy(topic).color}>
                      {getAccuracy(topic).accuracy}%
                    </Typography>
                  </Button>
                  {/* </TargetDialog> */}
                </div>
                {(topic.questionType === TopicType.Single || topic.questionType === TopicType.TrueOrFalse) && (
                  <RadioGroup
                    aria-disabled
                    defaultValue={topic.value?.join()}
                    name='basic-radio'
                    aria-label='basic-radio'
                  >
                    {topic.items?.map(item => (
                      <div key={item.title} className='flex gap-2 justify-between'>
                        <div>
                          <FormControlLabel
                            key={item.title}
                            disabled
                            value={item.title}
                            control={<Radio />}
                            label={item.title}
                          />
                          {item.file && <img src={BASE_URL + item.file} alt='' width={100} height={55} />}
                        </div>
                        {renderAccuracy(topic, item.title)}
                      </div>
                    ))}
                  </RadioGroup>
                )}
                {topic.questionType === TopicType.Multiple && (
                  <FormGroup>
                    {topic.items?.map(item => (
                      <div key={item.title} className='flex gap-2 justify-between'>
                        <FormControlLabel
                          control={<Checkbox defaultChecked={topic.value?.includes(item.title)} />}
                          label={item.title}
                          disabled
                        />
                        {renderAccuracy(topic, item.title)}
                      </div>
                    ))}
                  </FormGroup>
                )}
                {(topic.questionType === TopicType.FillIn || topic.questionType === TopicType.ShortAnswer) && (
                  <Title>{topic.value?.join()}</Title>
                )}
              </Grid>
            </>
          ))}
        </Grid>
        <TargetDialog
          title='Student answer list'
          width={'60%'}
          open={showAnswers}
          setOpen={setShowAnswers}
          content={
            <ListTable
              tableData={answers}
              tableColumns={columns}
              pagination={false}
              noCard
              searchTitle='by UserName or NickName'
            />
          }
        />
      </CardContent>
    </Card>
  )
}

export default Statistics
