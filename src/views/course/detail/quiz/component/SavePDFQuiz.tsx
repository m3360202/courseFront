'use client'

import { useEffect, useState } from 'react'

// MUI Imports
import { useParams, useRouter } from 'next/navigation'

import TextField from '@mui/material/TextField'

// Third-party Imports
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'

import { any, array, date, nonEmpty, number, object, optional, pipe, string } from 'valibot'

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
import { Topic, TopicItem as TopicItemType, TopicType } from '@/types/course/quiz/topic'
import { Quiz } from '@/types/course/quiz'
import { EnglishWords, FILE_PATH } from '@/types'
import DeleteButton from '../../../component/DeleteButton'
import saveQuiz from '@/api/course/quiz/saveQuiz'
import { getQuiz } from '@/api/course/quiz/getQuiz'
import FileUpload from '@/components/file-upload'
import { uploadMultiple } from '@/api/upload'
import { FileType } from '@/types/file/file'
import TopicItem from './TopicItem'
import AddOption from './AddOption'
import { Worker, Viewer } from '@react-pdf-viewer/core'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css'
import FormLayout from '@/components/layout/FormLayout'
import { quizTopicSchema, validateTopics } from '../schma'
import { scrollToErrorMessage } from '@/utils/documentToScroll'

const SavePDFQuiz = ({ quizId }: { quizId?: string }) => {
  //States
  const [saveLoading, setSaveLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [files, setFiles] = useState<FileType[]>()

  // Hooks
  const dictionary = useDictionary()
  const user = useUser()
  const { lang: locale, organizationId } = useParams()
  const { courseId } = useCourse()
  const { push } = useRouter()
  const { addTopButtons, setHiddenTabs, setBackUrl } = useGlobal()

  useEffect(() => {
    if (user && courseId && quizId) {
      const loadSession = async () => {
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
          setFiles(data.file)
        }
      }
      loadSession()
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
    startTime: optional(date()),
    endTime: optional(date()),
    submitType: number(dictionary.common.fieldRequired),
    totalScore: optional(number()),
    file: any()
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

  const onSubmit = async (data: Quiz) => {
    try {
      if (data.topic?.length === 0) {
        error('Please add at least one option.')

        return
      }
      if (!data.file || data.file.length === 0) {
        error('Please add a pdf file.')

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
      data.quizType = 1
      data.instructorId = organizationId as string
      await saveQuiz(user as UserTable, courseId as string, data)
      success(`${quizId ? dictionary.common.edit : dictionary.common.add} quiz ${dictionary.common.successful}`)
      delay(() => push(getLocalizedUrl(`/course/${courseId}/detail/quiz`, locale as Locale)), 500)
    } catch {
    } finally {
      setSaveLoading(false)
    }
  }

  const reSetItems = (index: number, questionType: TopicType, count?: number) => {
    switch (questionType) {
      case TopicType.Multiple:
      case TopicType.Single:
        const items: TopicItemType[] = []
        for (let index = 0; index < (count ?? 4); index++) {
          items.push({ title: EnglishWords[index] })
        }
        setValue(`topic.${index}.items`, items)
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

  const handleUploadFiles = async (fileList: File | File[]) => {
    setUploadLoading(true)
    const { data } = await uploadMultiple(user as UserTable, fileList as File[])
    const fList = [...data, ...(files ?? [])]
    setFiles(fList)
    setUploadLoading(false)
    setValue('file', fList)
  }

  return (
    <FormLayout className='md:w-[85%]'>
      <Grid container>
        <Grid item xs={12} md={5}>
          <Card sx={{ mr: 4, mb: 4 }}>
            <CardContent>
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <AddOption isPDF={true} append={append} />
                </Grid>
                <Grid item xs={12} display={'flex'} justifyContent={'space-between'}>
                  <Title variant='h5'>Total Questions:</Title>
                  <Title variant='h5'>{items?.length}</Title>
                </Grid>
                <Grid item xs={12} display={'flex'} justifyContent={'space-between'}>
                  <Title variant='h5'>Total Score:</Title>
                  <Title variant='h5'>{totalScore}</Title>
                </Grid>
                <Grid
                  item
                  xs={12}
                  className='customer-scrollbar'
                  sx={{
                    width: '100%',
                    position: 'relative',
                    overflow: 'auto',
                    maxHeight: '60vh'
                  }}
                >
                  {items?.map((topic, index) => {
                    return (
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
                        <TopicItem
                          topicIndex={index}
                          topic={topic}
                          setValue={setValue}
                          control={control}
                          user={user}
                          isPDF
                        />
                      </div>
                    )
                  })}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          <Card sx={{ mr: 4, mb: { xs: 4, md: 0 } }}>
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
                      name='endTime'
                      control={control}
                      render={({ field }) => (
                        <AppReactDatepicker
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
        </Grid>
        <Grid item xs={12} md={7}>
          <Card>
            <div className='p-5'>
              <div className='flex flex-col gap-5'>
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
                <FileUpload loading={uploadLoading} handleUploadFiles={handleUploadFiles} />
                {files && files.length > 0 && (
                  <Worker workerUrl='https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js'>
                    <div style={{ height: `100vh` }}>
                      <Viewer fileUrl={FILE_PATH + files[0].temporary} />
                    </div>
                  </Worker>
                )}
              </div>
            </div>
          </Card>
        </Grid>
      </Grid>
    </FormLayout>
  )
}

export default SavePDFQuiz
