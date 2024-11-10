'use client'

import { useEffect, useState } from 'react'

// MUI Imports
import { useParams, useRouter } from 'next/navigation'

import TextField from '@mui/material/TextField'

// Third-party Imports
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'

import { nullable, array, date, nonEmpty, number, object, optional, pipe, string } from 'valibot'

import {
  Card,
  CardContent,
  FormControl,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select
} from '@mui/material'

import LoadingButton from '@mui/lab/LoadingButton'

import { useDictionary } from '@/hooks/useDictionary'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

import { useCourse } from '@/hooks/useCourse'
import type { Locale } from '@/configs/i18n'
import type { UserTable } from '@/types/user/UserTable'
import { transformLocalDateZoneToUTC, transformDateFromUTC } from '@/utils/date'
import { RequiredStar } from '@/components/form-field'
import { useGlobal } from '@/hooks/useGlobal'
import { error, success } from '@/utils/toasts'
import { useUser } from '@/hooks/useGlobal'
import { getLocalizedUrl } from '@/utils/i18n'
import delay from '@/utils/delay'
import Title from '@/components/title'
import CustomizedTooltip from '@/components/tool-tip'
import { Topic, TopicType } from '@/types/course/quiz/topic'
import { Quiz } from '@/types/course/quiz'
import TopicItem from './TopicItem'
import DeleteButton from '../../../component/DeleteButton'
import saveQuiz from '@/api/course/quiz/saveQuiz'
import { getQuiz } from '@/api/course/quiz/getQuiz'
import AddOption from './AddOption'
import FormLayout from '@/components/layout/FormLayout'
import { quizTopicSchema, validateTopics } from '../schma'
import { scrollToErrorMessage } from '@/utils/documentToScroll'

const SaveQuiz = ({ quizId }: { quizId?: string }) => {
  //States
  const [saveLoading, setSaveLoading] = useState(false)

  // Hooks
  const dictionary = useDictionary()
  const user = useUser()
  const { lang: locale, organizationId } = useParams()
  const { courseId } = useCourse()
  const { push } = useRouter()
  const { addTopButtons, setHiddenTabs, setBackUrl } = useGlobal()

  useEffect(() => {
    if (user && courseId && quizId) {
      const loadQuiz = async () => {
        const { data } = await getQuiz(user as UserTable, courseId, quizId)
        if (data) {
          const keys = Object.keys(data) as Array<keyof Quiz>
          keys.map(key => {
            switch (key) {
              case 'startTime':
              case 'endTime':
                setValue(key, transformDateFromUTC(data[key] as Date, user))
                break
              default:
                setValue(key, data[key])
                break
            }
          })
        }
      }
      loadQuiz()
    }
  }, [user, courseId, quizId])

  useEffect(() => {
    user && addTopButtons([
      <LoadingButton variant='contained' key='valid' onClick={handleSubmit(onSubmit)} loading={saveLoading}>
        {dictionary.common.submit}
      </LoadingButton>
    ])

    courseId && setBackUrl([getLocalizedUrl(quizId ? `/course/${courseId}/detail/quiz/${quizId}/view` : `/course/${courseId}/detail/quiz`, locale as Locale)])
    setHiddenTabs(true)

    return () => {
      addTopButtons(null)
      setBackUrl(null)
      setHiddenTabs(null)
    }
  }, [courseId, user])


  //vars
  const schema = object({
    title: pipe(string(dictionary.common.fieldRequired), nonEmpty(dictionary.common.fieldRequired)),
    topic: array(
      quizTopicSchema
    ),
    limit: optional(number()),
    startTime: optional(nullable(date(dictionary.common.fieldRequired))),
    endTime: optional(nullable(date(dictionary.common.fieldRequired))),
    submitType: number(dictionary.common.fieldRequired),
    totalScore: optional(number())
  })

  const {
    control,
    setValue,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<Quiz>({
    resolver: valibotResolver(schema),
    defaultValues: {
      topic: []
    }
  })

  const { append, replace } = useFieldArray({
    control,
    name: 'topic'
  })

  const items = useWatch({
    control,
    name: `topic`
  })

  const startTime = watch('startTime')

  const totalScore = items?.reduce((accumulator: number, currentValue: Topic) => {
    return accumulator + (currentValue.score || 0)
  }, 0)

  useEffect(() => {
    if (errors && Object.keys(errors).length > 0)
      scrollToErrorMessage()
  }, [errors])

  const onSubmit = async (data: Quiz) => {
    try {
      if (data.topic?.length === 0) {
        error('Please add at least one option.')

        return
      }
      if (!validateTopics(data.topic)) {
        scrollToErrorMessage()

        return
      }
      setSaveLoading(true)
      data._id = quizId as string
      data.startTime = data.startTime ? transformLocalDateZoneToUTC(data.startTime, user) : undefined
      data.endTime = data.endTime ? transformLocalDateZoneToUTC(data.endTime, user) : undefined
      data.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
      data.time = new Date().toString()
      data.totalScore = totalScore
      data.quizType = 0
      data.instructorId = organizationId as string
      await saveQuiz(user as UserTable, courseId as string, data)
      success(`${quizId ? dictionary.common.edit : dictionary.common.add} quiz ${dictionary.common.successful}`)
      delay(() => push(getLocalizedUrl(`/course/${courseId}/detail/quiz`, locale as Locale)), 500)
    } catch (e) {
      console.log(e)
    } finally {
      setSaveLoading(false)
    }
  }

  const reSetItems = (index: number, questionType: TopicType) => {
    switch (questionType) {
      case TopicType.Multiple:
      case TopicType.Single:
        setValue(`topic.${index}.items`, [{ title: 'title1' }, { title: 'title2' }])
        break
      case TopicType.FillIn:
      case TopicType.ShortAnswer:
        setValue(`topic.${index}.items`, [{ title: '' }])
        break
      case TopicType.TrueOrFalse:
        setValue(`topic.${index}.items`, [{ title: 'true' }, { title: 'false' }])
        break
    }
  }

  return (
    <FormLayout className='md:w-[85%]'>
      <Grid container>
        <Grid item xs={12} md={4}>
          <Card sx={{ mr: 4, mb: 4 }}>
            <CardContent>
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <Title variant='h5'>Quiz settings</Title>
                </Grid>
                <Grid item xs={12} display={'flex'} gap={2} alignItems={'center'}>
                  <div className=' w-full'>
                    <Controller
                      name='startTime'
                      control={control}
                      render={({ field }) => (
                        <AppReactDatepicker
                          selected={field.value as Date}
                          onChange={(e) => {
                            field.onChange(e)
                            setValue('endTime', undefined)
                          }}
                          showTimeSelect
                          dateFormat='MM/dd/yyyy h:mm aa'
                          customInput={
                            <TextField
                              fullWidth
                              label='StartTime'
                              {...(errors.startTime && {
                                error: true,
                                helperText: errors?.startTime?.message
                              })}
                            />
                          }
                        />
                      )}
                    />
                  </div>
                  <CustomizedTooltip
                    title={`If you set a start and end time, students can only submit this quiz during that time. If you don't set a time, the student can submit at any time.
`}
                  >
                    <i className='ri-information-2-line'></i>
                  </CustomizedTooltip>
                </Grid>
                <Grid item xs={12} display={'flex'} gap={2} alignItems={'center'}>
                  <div className=' w-full'>
                    <Controller
                      name='endTime'
                      control={control}
                      render={({ field }) => (
                        <AppReactDatepicker
                          id='min-date'
                          selected={field.value as Date}
                          onChange={field.onChange}
                          showTimeSelect
                          dateFormat='MM/dd/yyyy h:mm aa'
                          minDate={new Date(startTime || new Date())}
                          customInput={
                            <TextField
                              fullWidth
                              label='EndTime'
                              {...(errors.endDate && {
                                error: true,
                                helperText: errors?.endDate?.message
                              })}
                            />
                          }
                        />
                      )}
                    />
                  </div>
                  <CustomizedTooltip
                    title={`If you set a start and end time, students can only submit this quiz during that time. If you don't set a time, the student can submit at any time.
`}
                  >
                    <i className='ri-information-2-line'></i>
                  </CustomizedTooltip>
                </Grid>
                <Grid item xs={12} display={'flex'} gap={2} alignItems={'center'}>
                  <div className=' w-full'>
                    <Controller
                      name='limit'
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          onChange={e => setValue('limit', parseInt(e.target.value))}
                          value={field.value === undefined ? '' : field.value}
                          fullWidth
                          label='Answering time'
                          type='number'
                          {...(errors.limit && {
                            error: true,
                            helperText: errors?.limit?.message
                          })}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position='end'>
                                {
                                  <div className='flex gap-1 items-center'>
                                    min <i className='ri-time-line'></i>
                                  </div>
                                }
                              </InputAdornment>
                            )
                          }}
                          inputProps={{ min: 1 }}
                        />
                      )}
                    />
                  </div>
                  <CustomizedTooltip
                    title={`If the limit time is set to 0, there is no time limit for students to answer questions, which is more suitable for homework quizzes.

`}
                  >
                    <i className='ri-information-2-line'></i>
                  </CustomizedTooltip>
                </Grid>
                <Grid item xs={12} display={'flex'} gap={2} alignItems={'center'}>
                  <div className=' w-full'>
                    <Controller
                      name='submitType'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel id='demo-basic-select-outlined-label'>Submit Type</InputLabel>
                          <Select
                            label='Submit Type'
                            id='demo-basic-select-outlined'
                            labelId='demo-basic-select-outlined-label'
                            {...field}
                            value={field.value === undefined ? '' : field.value}
                          >
                            <MenuItem value={0}>Students can only submit once</MenuItem>
                            <MenuItem value={1}>
                              Students can submit multiple times (before deadline or end of course)
                            </MenuItem>
                          </Select>
                          {errors.submitType && (
                            <FormHelperText sx={{ color: 'error.main' }}>The field is required</FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </div>
                  <CustomizedTooltip title={`Choose submit type.`}>
                    <i className='ri-information-2-line'></i>
                  </CustomizedTooltip>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          <Card sx={{ mr: 4, mb: { xs: 4, md: 0 } }}>
            <CardContent>
              <Grid container spacing={4}>
                <Grid item xs={12} display={'flex'} justifyContent={'space-between'}>
                  <Title variant='h5'>Total Questions:</Title>
                  <Title variant='h5'>{items?.length}</Title>
                </Grid>
                <Grid item xs={12} display={'flex'} justifyContent={'space-between'}>
                  <Title variant='h5'>Total Score:</Title>
                  <Title variant='h5'>{totalScore}</Title>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <div className='p-5'>
            <div className='flex flex-col gap-5'>
              <Card>
                <CardContent>
                  <Controller
                    name='title'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='Title'
                        {...(errors.title && {
                          error: true,
                          helperText: errors?.title?.message
                        })}
                        InputProps={{
                          startAdornment: <InputAdornment position='start'>{<RequiredStar />}</InputAdornment>
                        }}
                      />
                    )}
                  />
                </CardContent>
              </Card>
              {items?.map((topic, index) => {
                return (
                  <Card key={topic._id}>
                    <CardContent>
                      <div key={topic._id} className={'p-4 flex flex-col gap-4'}>
                        <div className='flex justify-between'>
                          <Title variant='h5'>Q{index + 1}</Title>
                          <DeleteButton id={topic._id as string} items={items} replace={replace} />
                        </div>
                        <div className='flex gap-4 flex-col md:flex-row'>
                          <Controller
                            name={`topic.${index}.questionType` as any}
                            control={control}
                            rules={{ required: 'The field is required' }}
                            render={({ field }) => (
                              <FormControl className='w-full md:w-1/2'>
                                <InputLabel id='demo-basic-select-outlined-label'>Type</InputLabel>
                                <Select
                                  label='Type'
                                  defaultValue=''
                                  id='demo-basic-select-outlined'
                                  labelId='demo-basic-select-outlined-label'
                                  value={field.value}
                                  onChange={e => {
                                    const type = parseInt(e.target.value)
                                    //setValue(`topic.${index}.questionType`, type)
                                    field.onChange(e)
                                    reSetItems(index, type)
                                  }}
                                >
                                  {Object.entries(TopicType)
                                    .filter(([key]) => isNaN(Number(key)))
                                    .map(([key, value]) => (
                                      <MenuItem key={key} value={value}>
                                        {key}
                                      </MenuItem>
                                    ))}
                                </Select>
                              </FormControl>
                            )}
                          />
                          <Controller
                            name={`topic.${index}.score`}
                            control={control}
                            rules={{ required: 'The field is required' }}
                            render={({ field }) => (
                              <TextField
                                className=' w-full md:w-1/2'
                                type='number'
                                label='Score'
                                inputProps={{ min: 1 }}
                                {...field}
                                onChange={e => setValue(`topic.${index}.score`, parseInt(e.target.value))}
                                {...(errors.topic?.[index]?.score && {
                                  error: true,
                                  helperText: errors?.topic?.[index]?.score?.message
                                })}
                              />
                            )}
                          />
                        </div>
                        <Controller
                          name={`topic.${index}.title`}
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => {
                            return (
                              <TextField
                                className='w-full'
                                label='Topic'
                                multiline
                                minRows={3}
                                maxRows={5}
                                {...field}
                                // value={field.value}
                                {...(!field.value && {
                                  error: true,
                                  helperText: 'The field is required!'
                                })}
                              />
                            )
                          }}
                        />
                        <TopicItem topicIndex={index} topic={topic} setValue={setValue} control={control} user={user} />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
              <AddOption isPDF={false} append={append} />
            </div>
          </div>
        </Grid>
      </Grid>
    </FormLayout>
  )
}

export default SaveQuiz
