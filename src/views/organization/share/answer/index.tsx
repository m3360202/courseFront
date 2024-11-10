'use client'

import { getEnrollmentDetail } from '@/api/organization/enrollment/getEnrollmentDetail'
import BackdropLoading from '@/components/backdrop'
import { Locale } from '@/configs/i18n'
import { useGlobal, useUser } from '@/hooks/useGlobal'
import { Enrollment, PaymentType } from '@/types/organization/enrollment'
import { getLocalizedUrl } from '@/utils/i18n'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import SaveInfo from './SaveInfo'
import { EnrollmentSurvey } from '@/types/organization/enrollment/survey'
import { getEnrollmentSurvey } from '@/api/organization/enrollment-survey/getEnrollmentSurvey'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { any, object } from 'valibot'
import { EnrollmentAnswer } from '@/types/organization/enrollment/answer'
import { valibotResolver } from '@hookform/resolvers/valibot'
import {
  Card,
  Chip,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography
} from '@mui/material'
import Title from '@/components/title'
import { Topic, TopicType } from '@/types/course/quiz/topic'
import { RequiredStar } from '@/components/form-field'
import { useOrganization } from '@/hooks/useOrganization'
import format from '@/utils/format'
import { LoadingButton } from '@mui/lab'
import { pushOrganizationUser } from '@/api/organization/user/addOrganizationUser'
import { UserTable } from '@/types/user/UserTable'
import { saveEnrollmentAnswer } from '@/api/organization/enrollment-answer/saveEnrollmentAnswer'
import { scrollToErrorMessage } from '@/utils/documentToScroll'
import { error } from '@/utils/toasts'

const Answer = () => {
  //States
  const { organizationId, shareId, answerId, lang } = useParams()
  const [data, setData] = useState<Enrollment>()
  const [survey, setSurvey] = useState<EnrollmentSurvey>()
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(0)
  const { organization } = useOrganization()
  const [topics, setTopics] = useState<Topic[]>()
  const [saveLoading, setSaveLoading] = useState(false)

  //Hooks
  const user = useUser()
  const { addTopButtons } = useGlobal()
  const { push } = useRouter()

  useEffect(() => {
    user && addTopButtons(
      step === 0
        ? null
        : [
          <LoadingButton key='submit' variant='contained' onClick={handleSubmit(onSubmit)} loading={saveLoading}>
            Submit
          </LoadingButton>
        ]
    )

    return () => {
      addTopButtons(null)
    }
  }, [step, user])

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        if (shareId) {
          const { data } = await getEnrollmentDetail(user, shareId as string)
          setData(data)
          setLoading(false)
          setValue('paymentType', data?.paymentType as number)
        }
        if (answerId) {
          const { data } = await getEnrollmentSurvey(user, answerId as string)
          setSurvey(data)
          setValue('topic', data.topic)
        }
      }
    }

    loadData()
  }, [shareId, answerId, user])

  //vars
  const schema = object({
    topic: any(),
    paymentType: any(),
    collects: any()
  })

  const { control, setValue, handleSubmit } = useForm<EnrollmentAnswer>({
    resolver: valibotResolver(schema)
  })

  const fields = useWatch({
    control,
    name: `topic`
  })

  const handleNext = (data: { [key: string]: string }) => {
    setValue('collects', [{ ...data }])
    setStep(1)
  }

  const appendRefTopics = (itemIds: string[], refId: string) => {
    if (fields) {
      let newTopics: Topic[] = [...fields.filter(c => !c.refId)]
      if (refId && itemIds) {
        const refTopics = fields.filter(c => c.refId === refId)
        if (refTopics.length) {
          newTopics = [...newTopics, ...refTopics]
        } else {
          newTopics = [...fields.filter(c => !itemIds.includes(c.refId || ''))]
        }
      }
      const topicValue = [...fields]
      setTopics(newTopics.sort((a, b) => (a.sort as number) - (b.sort as number)))
      topicValue.map(item => {
        item.value = newTopics.find(c => c._id === item._id)?.value
      })
      setValue('topic', topicValue)
    }
  }

  const onSubmit = async (saveData: EnrollmentAnswer) => {
    try {

      if (!scrollToErrorMessage()) {
        error('Please fill in the required fields.')

        return
      }
      setSaveLoading(true)
      saveData.enrollmentSurveyId = answerId as string
      saveData.enrollmentPlanId = shareId as string
      saveData.instructorId = organizationId as string
      saveEnrollmentAnswer(user as UserTable, saveData)
      //success(`Submited`)

      if (saveData?.paymentType === PaymentType.Flexible || saveData?.paymentType === PaymentType.Fixed) {
        push(getLocalizedUrl(`/organization/${organizationId}/share/${shareId}/payment`, lang as Locale))
      } else {
        await pushOrganizationUser(user as UserTable, organizationId as string, shareId as string)
        push(getLocalizedUrl('/organization/home', lang as Locale))
      }
    } catch {
    } finally {
      setSaveLoading(false)
    }
  }

  return loading ? (
    <BackdropLoading loading={loading} />
  ) : (
    <Grid container spacing={4} p={5}>
      {step === 0 && (
        <Grid item xs={12}>
          <SaveInfo info={data?.collects} handleNext={handleNext} />
        </Grid>
      )}
      {step === 1 && (
        <>
          <Grid item xs={12} component={Card}>
            <div className='flex flex-col gap-4'>
              <Title variant='h5'>Title:{survey?.title}</Title>
              <Typography variant='subtitle2' fontWeight={'bold'}>
                Organization Name:{organization?.name}
              </Typography>
              {/* <Typography noWrap>Posted on {quizItem && format(quizItem['postAt'], 'YYYY-MM-DD HH:mm')}</Typography> */}
              <Typography noWrap variant='subtitle2' fontWeight={'bold'}>
                Enrollment Date:
                {data?.startTime && format(data?.startTime, undefined, true, 'MMM D')}-
                {data?.endTime && format(data?.endTime, undefined, true, 'MMM D')}
              </Typography>
              <Typography variant='subtitle2' fontWeight={'bold'} sx={{ '& .MuiTypography-body1': { pb: 5 } }}>
                Description:
                <Typography
                  sx={{ wordWrap: 'break-word' }}
                  dangerouslySetInnerHTML={{ __html: data?.description || '' }}
                />
              </Typography>
            </div>
          </Grid>
          {(topics || fields?.filter(c => !c.refId).sort((a, b) => (a.sort as number) - (b.sort as number)))?.map(
            (topic, index) => (
              <>
                <Grid key={topic._id} item xs={12} component={Card} mt={4}>
                  <Title variant='h5'>
                    {topic.required && <RequiredStar />} {index + 1}.{topic.title}
                  </Title>
                  {(topic.questionType === TopicType.Single || topic.questionType === TopicType.TrueOrFalse) && (
                    <>
                      <Controller
                        name={`topic.${index}.value`}
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth className='pb-2'>
                            <RadioGroup {...field}>
                              {topic.items?.map((item, itemIndex) => (
                                <FormControlLabel
                                  key={`topic.${index}.items.${itemIndex}.title`}
                                  control={<Radio />}
                                  label={item.title}
                                  value={item.title}
                                  onChange={(e, c) => {
                                    c &&
                                      appendRefTopics(
                                        topic.items?.map(c => c._id as string) as string[],
                                        item._id as string
                                      )
                                  }}
                                />
                              ))}
                            </RadioGroup>
                            {topic.required && (!field.value || field.value.length === 0) && <FormHelperText sx={{ color: 'error.main' }}>The field is required</FormHelperText>}
                          </FormControl>
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
                          <FormControl fullWidth className='pb-2'>
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
                            >
                              {topic.items?.map(item => (
                                <MenuItem
                                  key={item.title}
                                  value={item.title}
                                  onChange={() => {
                                    appendRefTopics(
                                      topic.items?.map(c => c._id as string) as string[],
                                      item._id as string
                                    )
                                  }}
                                >
                                  {item.title}
                                </MenuItem>
                              ))}
                            </Select>
                            {topic.required && (!field.value || field.value.length === 0) && <FormHelperText sx={{ color: 'error.main' }}>The field is required</FormHelperText>}
                          </FormControl>
                        </>
                      )}
                    />
                  )}
                  {(topic.questionType === TopicType.FillIn || topic.questionType === TopicType.ShortAnswer) && (
                    <Controller
                      name={`topic.${index}.value`}
                      control={control}
                      render={({ field }) => <TextField fullWidth minRows={3} multiline {...field}  {...(topic.required && (!field.value || field.value.length === 0) && {
                        error: true,
                        helperText: 'The field is required'
                      })} />}
                    />
                  )}
                </Grid>
              </>
            )
          )}
        </>
      )}
    </Grid>
  )
}

export default Answer
