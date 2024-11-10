'use client'

import { useEffect, useState } from 'react'

// MUI Imports
import { useParams, useRouter } from 'next/navigation'

import TextField from '@mui/material/TextField'

// Third-party Imports
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'

import { any, nonEmpty, object, pipe, string } from 'valibot'

import {
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Switch
} from '@mui/material'

import LoadingButton from '@mui/lab/LoadingButton'

import { useDictionary } from '@/hooks/useDictionary'
import type { Locale } from '@/configs/i18n'
import type { UserTable } from '@/types/user/UserTable'
import { RequiredStar } from '@/components/form-field'
import { useGlobal } from '@/hooks/useGlobal'
import { error, success } from '@/utils/toasts'
import { useUser } from '@/hooks/useGlobal'
import { getLocalizedUrl } from '@/utils/i18n'
import delay from '@/utils/delay'
import Title from '@/components/title'
import { TopicType } from '@/types/course/quiz/topic'
import TopicItem from './TopicItem'
import DeleteButton from '@/views/course/component/DeleteButton'
import AddOption from './AddOption'
import FormLayout from '@/components/layout/FormLayout'
import { guid } from '@/utils/data'
import { getEnrollmentSurvey } from '@/api/organization/enrollment-survey/getEnrollmentSurvey'
import { EnrollmentSurvey } from '@/types/organization/enrollment/survey'
import { saveEnrollmentSurvey } from '@/api/organization/enrollment-survey/saveEnrollmentSurvey'
import { scrollToErrorMessage } from '@/utils/documentToScroll'

const SaveSurvey = ({ surveyId }: { surveyId?: string }) => {
  //States
  const [saveLoading, setSaveLoading] = useState(false)

  // Hooks
  const dictionary = useDictionary()
  const user = useUser()
  const { lang: locale, organizationId } = useParams()
  const { push } = useRouter()
  const { addTopButtons, setBackUrl, setTitle } = useGlobal()

  useEffect(() => {
    if (user && surveyId) {
      const loadSurvey = async () => {
        const { data } = await getEnrollmentSurvey(user as UserTable, surveyId)
        if (data) {
          const keys = Object.keys(data) as Array<keyof EnrollmentSurvey>
          keys.map(key => {
            switch (key) {
              default:
                setValue(key, data[key])
                break
            }
          })
        }
      }
      loadSurvey()
    }
  }, [user, organizationId, surveyId])

  useEffect(() => {
    user && addTopButtons([
      <LoadingButton variant='contained' key='valid' onClick={handleSubmit(onSubmit)} loading={saveLoading}>
        {dictionary.common.submit}
      </LoadingButton>
    ])

    organizationId &&
      setBackUrl([
        getLocalizedUrl(
          surveyId ? `/organization/${organizationId}/detail/enrollment-survey/${surveyId}/view` : `/organization/${organizationId}/detail/enrollment-survey`,
          locale as Locale
        )
      ])
    setTitle(surveyId ? 'Edit enrollment survey' : 'Add enrollment survey')

    return () => {
      addTopButtons(null)
      setBackUrl(null)
    }
  }, [organizationId, user])

  //vars
  const schema = object({
    title: pipe(string(dictionary.common.fieldRequired), nonEmpty(dictionary.common.fieldRequired)),
    // topic: array(
    //   object({
    //     title: pipe(string(dictionary.common.fieldRequired), nonEmpty(dictionary.common.fieldRequired)),
    //     items: array(
    //       object({
    //         title: pipe(string(dictionary.common.fieldRequired), nonEmpty(dictionary.common.fieldRequired))
    //       })
    //     )
    //   })
    // ),
    topic: any()
  })

  const {
    control,
    setValue,
    handleSubmit,
    formState: { errors }
  } = useForm<EnrollmentSurvey>({
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

  const onSubmit = async (data: EnrollmentSurvey) => {
    try {
      if (data.topic?.length === 0) {
        error('Please add at least one option.')

        return
      }
      if (!scrollToErrorMessage()) {
        return
      }
      setSaveLoading(true)
      data._id = surveyId as string
      data.instructorId = organizationId as string
      await saveEnrollmentSurvey(user as UserTable, data)
      success(`${surveyId ? dictionary.common.edit : dictionary.common.add} ${dictionary.common.successful}`)
      delay(
        () => push(getLocalizedUrl(`/organization/${organizationId}/detail/enrollment-survey`, locale as Locale)),
        500
      )
    } catch {
    } finally {
      setSaveLoading(false)
    }
  }

  const reSetItems = (index: number, questionType: TopicType) => {
    switch (questionType) {
      case TopicType.Multiple:
      case TopicType.Single:
        setValue(`topic.${index}.items`, [
          { _id: guid(), title: 'title1' },
          { _id: guid(), title: 'title2' }
        ])
        break
      case TopicType.FillIn:
      case TopicType.ShortAnswer:
        setValue(`topic.${index}.items`, [{ _id: guid(), title: '' }])
        break
      case TopicType.TrueOrFalse:
        setValue(`topic.${index}.items`, [
          { _id: guid(), title: 'true' },
          { _id: guid(), title: 'false' }
        ])
        break
    }
  }

  return (
    <FormLayout className='md:w-[85%]'>
      <Grid container>
        <Grid item xs={12}>
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
                  <Card id={topic._id} key={topic._id}>
                    <CardContent>
                      <div key={topic._id} className={'p-4 flex flex-col gap-4'}>
                        <div className='flex justify-between'>
                          <Title variant='h5'>
                            Q
                            {topic.refId
                              ? `${items.findIndex(c => c.items?.find(c => c._id === topic.refId)) + 1}-${items
                                .filter(c => c.refId === topic.refId)
                                .map(c => c._id)
                                .findIndex(c => c == topic._id) + 1
                              }`
                              : index + 1}
                          </Title>
                          <div>
                            <Controller
                              name={`topic.${index}.required`}
                              control={control}
                              render={({ field }) => {
                                return (
                                  <FormControlLabel
                                    label='Required'
                                    control={<Switch checked={field.value} {...field} />}
                                  />
                                )
                              }}
                            />
                            <DeleteButton id={topic._id as string} items={items} replace={replace} />
                          </div>
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
                                    .map(
                                      ([key, value]) =>
                                        (value === TopicType.Single ||
                                          value === TopicType.Multiple ||
                                          value === TopicType.ShortAnswer) && (
                                          <MenuItem key={key} value={value}>
                                            {key}
                                          </MenuItem>
                                        )
                                    )}
                                </Select>
                              </FormControl>
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
                        <TopicItem
                          topicIndex={index}
                          topic={topic}
                          setValue={setValue}
                          control={control}
                          topicAppend={append}
                          topics={items}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
              <AddOption append={append} length={items.length} />
            </div>
          </div>
        </Grid>
      </Grid>
    </FormLayout>
  )
}

export default SaveSurvey
