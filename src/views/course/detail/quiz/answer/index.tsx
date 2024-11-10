'use client'

// MUI Imports
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

// Components Imports
import { useCourse } from '@/hooks/useCourse'
import { useGlobal, useUser } from '@/hooks/useGlobal'
import Title from '@/components/title'
import { useEffect, useState } from 'react'
import { getLocalizedUrl } from '@/utils/i18n'
import { Locale } from '@/configs/i18n'
import { useParams, useRouter } from 'next/navigation'
import { UserTable } from '@/types/user/UserTable'
import LoadingButton from '@mui/lab/LoadingButton'
import { success } from '@/utils/toasts'
// import ConfirmDialog from '@/components/confirm'
import ShareContent from '../../../component/ShareContent'
import {
  Chip,
  FormControl,
  FormControlLabel,
  Grid,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField
} from '@mui/material'

import delay from '@/utils/delay'
import { Quiz, SubmitQuiz } from '@/types/course/quiz'
import { getQuiz } from '@/api/course/quiz/getQuiz'
import { TopicType } from '@/types/course/quiz/topic'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { any, object } from 'valibot'
import answerQuiz from '@/api/course/quiz/answerQuiz'
import { getSubmitQuiz } from '@/api/course/quiz/getSubmitQuiz'
import columns from '../component/columns'
import { timeStrToMinutes } from '@/utils/date'
import { Base_URL } from '@/utils/request'
import { Worker, Viewer } from '@react-pdf-viewer/core'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css'
import { FILE_PATH } from '@/types'

const colTitle = (title: string) => (
  <Typography variant='h5' color={'error'}>
    {title}
  </Typography>
)

const AnswerQuiz = ({ quizId }: { quizId: string }) => {
  //States
  const [data, setData] = useState<Quiz | null>(null)

  // Hooks
  const { lang: locale } = useParams()
  const { courseId } = useCourse()
  const { addTopButtons, setHiddenTabs, setBackUrl } = useGlobal()
  const user = useUser()
  const { push } = useRouter()
  const [notStart, setNotStart] = useState(false)
  const [isEnded, setIsEnded] = useState(false)
  const [disabled, setDisabled] = useState<boolean>()
  const [answered, setAnswered] = useState<boolean>()
  const [timmer, setTimmer] = useState<NodeJS.Timeout>()
  const [limitTime, setLimitTime] = useState<string>()

  useEffect(() => {
    localStorage.setItem('answerCountTime', '')
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      clearInterval(timmer as any)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      handleBeforeUnload()
    }
  }, [])

  useEffect(() => {
    const loadAnswer = async () => {
      if (user && courseId && quizId) {
        const { data } = await getQuiz(user, courseId, quizId)
        const { data: submitData } = await getSubmitQuiz(user, courseId, user._id, quizId)
        const topics = (submitData || data)?.topic
        let answered = false
        if (submitData) {
          if (!submitData.isDraft && data.submitType === 0) {
            answered = true
            setAnswered(true)
          }
        } else {
          topics?.map(topic => {
            topic.value = undefined
          })
        }
        setValue('topic', topics)
        const nostart = data.startTime ? new Date(data.startTime).getTime() > new Date().getTime() : false
        const ended = data.endTime ? new Date(data.endTime).getTime() < new Date().getTime() : false
        const endedCount = starting()
        if (nostart) setNotStart(true)
        if (ended) setIsEnded(true)
        if (nostart || ended || answered || endedCount) setDisabled(true)
        else {
          setDisabled(false)
          user && addTopButtons([
            // <ConfirmDialog
            //   key={'save'}
            //   title='Save'
            //   confirm={async () => {
            //     await onSubmit(true)
            //   }}
            // >
            <LoadingButton key='saveSubmit' onClick={async () => { await onSubmit(true) }}>Save</LoadingButton>,
            // </ConfirmDialog>,
            // <ConfirmDialog
            //   key={'submit'}
            //   title='Submit'
            //   confirm={async () => {
            //     await onSubmit(false)
            //   }}
            // >
            <LoadingButton key={'submit'} onClick={async () => { await onSubmit(false) }}>Submit</LoadingButton>
            // </ConfirmDialog>
          ])
        }
        setData(data)
      }
    }
    loadAnswer()

    return () => {
      addTopButtons(null)
    }
  }, [user, courseId, quizId])

  useEffect(() => {
    courseId && setBackUrl([getLocalizedUrl(`/course/${courseId}/detail/quiz`, locale as Locale)])
    setHiddenTabs(true)

    return () => {
      setBackUrl(null)
      addTopButtons(null)
      setHiddenTabs(null)
    }
  }, [user, courseId])

  //Vars
  const items = columns(data)
  if (notStart)
    items.push({
      title: colTitle('Not started answering yet'),
      col: 1
    })
  if (isEnded)
    items.push({
      title: colTitle('The submission time has ended'),
      col: 1
    })
  if (answered)
    items.push({
      title: colTitle('You have already submitted the answer'),
      col: 1
    })
  if (limitTime)
    items.push({
      title: (
        <div className='flex gap-1 items-center'>
          <i className='ri-time-line'></i>
          <Typography variant='h5' color={'error'}>
            {limitTime}
          </Typography>
        </div>
      ),
      col: 1
    })

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

  const onSubmit = async (isDraft: boolean) => {
    try {
      const data: SubmitQuiz = {
        _id: quizId as string,
        quizId: quizId,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        time: new Date().toString(),
        topic: getValues()['topic'],
        isDraft
      }

      await answerQuiz(user as UserTable, courseId as string, data)
      success(`Answered`)
      delay(() => push(getLocalizedUrl(`/course/${courseId}/detail/quiz`, locale as Locale)), 500)
    } catch {
    } finally {
    }
  }

  const starting = () => {
    if (data?.limit) {
      const limit = data.limit
      let lt: number | undefined = undefined
      if (data.quizLimit && data.submitType !== 1) {
        const limitObj = data.quizLimit.find((c: any) => c.postedByUser === user?._id)
        if (limitObj) lt = limitObj.limit
      }
      if (limit && lt === 0) {
        setLimitTime(`Time's up`)

        return true
      } else {
        countdown((lt || limit) as number)

        return false
      }
    }
  }
  const countdown = (minutes: number) => {
    if (disabled) {
      clearInterval(timmer)

      return
    }
    let seconds = minutes * 60
    const countDownTimer = setInterval(() => {
      let hours: number | string = Math.floor(seconds / 3600)
      let minutes: number | string = Math.floor((seconds - hours * 3600) / 60)
      let remainingSeconds: number | string = seconds % 60
      if (hours < 10) {
        hours = '0' + hours
      }
      if (minutes < 10) {
        minutes = '0' + minutes
      }
      if (remainingSeconds < 10) {
        remainingSeconds = '0' + remainingSeconds
      }
      let timeStr = ''
      if (hours !== '00') {
        timeStr += hours + ':'
      }
      timeStr += minutes + ':' + remainingSeconds
      setLimitTime(timeStr)
      localStorage.setItem('answerCountTime', timeStr)
      if (--seconds < 0) {
        clearInterval(countDownTimer)
        setLimitTime(`Time's up`)
        localStorage.setItem('answerCountTime', '')
        handleBeforeUnload()
        onSubmit(true)
        setDisabled(true)
      }
    }, 1000)
    setTimmer(countDownTimer as NodeJS.Timeout)
  }

  const handleBeforeUnload = () => {
    if (!data?.limit) return
    const limitObj = data?.quizLimit?.find(c => c.postedByUser === user?._id)
    if (limitObj?.limit === 0) {
      return
    }
    const answerCountTime = localStorage.getItem('answerCountTime') || ''
    const mims = answerCountTime ? timeStrToMinutes(answerCountTime) : data?.limit
    fetch(Base_URL + `/course/quizlimit/add/${courseId}`, {
      headers: {
        'Content-Type': 'application/json', // 设置请求头为 JSON 格式
        'x-access-token': user?.activationToken as string,
        'x-access-timezone': user?.timeZone as string
      },
      body: JSON.stringify({
        quizId,
        limit: mims
      }),
      method: 'post',
      keepalive: true
    })
  }

  return (
    <>
      <ShareContent about='quiz' title={data?.title} items={items}>
        <Divider />
        <div className='flex flex-col gap-4'>
          <Typography variant='h5'>Topics</Typography>
        </div>
        <Divider />
        <Grid container spacing={4}>
          {data?.quizType === 1 && data.file && data.file.length > 0 && (
            <Grid
              item
              xs={9}
              sx={{
                width: '100%',
                position: 'relative',
                overflow: 'auto',
                height: '100vh',
                overflowY: 'hidden'
              }}
            >
              <Worker workerUrl='https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js'>
                <div style={{ height: `100vh` }}>
                  <Viewer
                    fileUrl={FILE_PATH + data.file[0].temporary}
                  // plugins={[defaultLayoutPluginInstance]}
                  />
                </div>
              </Worker>
            </Grid>
          )}
          {fields?.map((topic, index) => (
            <>
              <Grid item xs={data?.quizType === 1 ? 3 : 12}>
                <Title variant='h5'>
                  {index + 1}.{topic.title}
                </Title>
                {(topic.questionType === TopicType.Single || topic.questionType === TopicType.TrueOrFalse) && (
                  <>
                    <Controller
                      name={`topic.${index}.value`}
                      control={control}
                      render={({ field }) => (
                        <RadioGroup {...field}>
                          {topic.items?.map((item, itemIndex) => (
                            <FormControlLabel
                              key={`topic.${index}.items.${itemIndex}.title`}
                              control={<Radio disabled={disabled} />}
                              label={item.title}
                              value={item.title}
                            />
                          ))}
                        </RadioGroup>
                      )}
                    />
                  </>
                )}
                {topic.questionType === TopicType.Multiple && (
                  <Controller
                    name={`topic.${index}.value`}
                    control={control}
                    render={({ field }) => (
                      <>
                        <FormControl fullWidth>
                          <Select
                            multiple
                            {...field}
                            value={field.value || []}
                            renderValue={selected => (
                              <div className='flex flex-wrap gap-2'>
                                {(selected as string[]).map(value => (
                                  <Chip
                                    key={value}
                                    clickable
                                    deleteIcon={
                                      <i
                                        className='ri-close-circle-fill'
                                        onMouseDown={event => event.stopPropagation()}
                                      />
                                    }
                                    size='small'
                                    label={value}
                                  />
                                ))}
                              </div>
                            )}
                            disabled={disabled}
                          >
                            {topic.items?.map(item => (
                              <MenuItem key={item.title} value={item.title}>
                                {item.title}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </>
                    )}
                  />
                )}
                {(topic.questionType === TopicType.FillIn || topic.questionType === TopicType.ShortAnswer) && (
                  <Controller
                    name={`topic.${index}.value`}
                    control={control}
                    render={({ field }) => <TextField fullWidth minRows={3} multiline {...field} disabled={disabled} />}
                  />
                )}
              </Grid>
            </>
          ))}
        </Grid>
      </ShareContent>
    </>
  )
}

export default AnswerQuiz
