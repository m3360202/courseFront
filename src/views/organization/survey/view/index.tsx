'use client'

// MUI Imports
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

// Components Imports
import { useGlobal, useUser } from '@/hooks/useGlobal'
import Title from '@/components/title'
import { useEffect, useState } from 'react'
import { getLocalizedUrl } from '@/utils/i18n'
import { Locale } from '@/configs/i18n'
import { useParams, useRouter } from 'next/navigation'
import PermissionButton from '@/components/buttons/PermissionButton'
import { useDictionary } from '@/hooks/useDictionary'
import Link from 'next/link'
import { UserTable } from '@/types/user/UserTable'
import LoadingButton from '@mui/lab/LoadingButton'
import { error, success } from '@/utils/toasts'
import ConfirmDialog from '@/components/confirm'
import {
  Button,
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
import ShareContent from '@/views/course/component/ShareContent'
import { getEnrollmentSurvey } from '@/api/organization/enrollment-survey/getEnrollmentSurvey'
import { EnrollmentSurvey } from '@/types/organization/enrollment/survey'
import { deleteEnrollmentSurvey } from '@/api/organization/enrollment-survey/deleteEnrollmentSurvey'
import { TopicType } from '@/types/course/quiz/topic'

const SurveyView = ({ surveyId }: { surveyId: string }) => {
  //States
  const [data, setData] = useState<EnrollmentSurvey | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Hooks
  const { lang: locale, organizationId } = useParams()
  const { setBackUrl, setTitle } = useGlobal()
  const user = useUser()
  const dictionary = useDictionary()
  const { push } = useRouter()

  useEffect(() => {
    const loadSurvey = async () => {
      if (user && surveyId) {
        const { data } = await getEnrollmentSurvey(user, surveyId)
        setData(data)
      }
    }
    loadSurvey()
  }, [user, surveyId])

  useEffect(() => {
    organizationId &&
      setBackUrl([getLocalizedUrl(`/organization/${organizationId}/detail/enrollment-survey`, locale as Locale)])
    setTitle('Enrollment survey view')

    return () => {
      setBackUrl(null)
    }
  }, [user, organizationId])

  const handleDelete = async () => {
    try {
      setDeleteLoading(true)
      await deleteEnrollmentSurvey(user as UserTable, surveyId)
      success(`${dictionary.common.delete} ${dictionary.common.successful}`)
      delay(
        () => push(getLocalizedUrl(`/organization/${organizationId}/detail/enrollment-survey`, locale as Locale)),
        500
      )
    } catch (err) {
      error((error as unknown as { message: string })?.message)
    } finally {
      setDeleteLoading(false)
    }
  }

  const buttons = [
    <PermissionButton key={'edit'} isShow={true}>
      <Button
        size='small'
        component={Link}
        href={getLocalizedUrl(
          `/organization/${organizationId}/detail/enrollment-survey/${surveyId}/edit`,
          locale as Locale
        )}
      >
        Edit
      </Button>
    </PermissionButton>,
    <PermissionButton key={'delete'} isShow={true}>
      <ConfirmDialog
        title={dictionary.common.delete}
        confirm={async () => {
          await handleDelete()
        }}
      >
        <LoadingButton loading={deleteLoading}>Delete</LoadingButton>
      </ConfirmDialog>
    </PermissionButton>
  ]

  return (
    <ShareContent about='survey' title={data?.title} items={[]} buttons={buttons} hiddenInstructor>
      <div className='flex flex-col gap-4'>
        <Typography variant='h5'>Topics</Typography>
      </div>
      <Divider />
      <Grid container spacing={4}>
        {data?.topic?.map((topic, index) => (
          <>
            <Grid item xs={12}>
              <Title variant='h5'>
                {index + 1}.{topic.title}
              </Title>
              {(topic.questionType === TopicType.Single || topic.questionType === TopicType.TrueOrFalse) && (
                <RadioGroup
                  aria-disabled
                  defaultValue={topic.value?.join()}
                  name='basic-radio'
                  aria-label='basic-radio'
                >
                  {topic.items?.map(item => (
                    <div key={item.title} className='flex gap-2'>
                      <FormControlLabel
                        key={item.title}
                        disabled
                        value={item.title}
                        control={<Radio />}
                        label={item.title}
                      />
                    </div>
                  ))}
                </RadioGroup>
              )}
              {topic.questionType === TopicType.Multiple && (
                <FormControl fullWidth>
                  <Select
                    multiple
                    value={topic.value}
                    renderValue={selected => (
                      <div className='flex flex-wrap gap-2'>
                        {(selected as string[]).map(value => (
                          <Chip
                            key={value}
                            clickable
                            deleteIcon={
                              <i className='ri-close-circle-fill' onMouseDown={event => event.stopPropagation()} />
                            }
                            size='small'
                            label={value}
                          />
                        ))}
                      </div>
                    )}
                  >
                    {topic.items?.map(item => (
                      <MenuItem key={item.title} value={item.title} sx={{ display: 'flex', gap: 4 }}>
                        {item.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              {(topic.questionType === TopicType.FillIn || topic.questionType === TopicType.ShortAnswer) && (
                <TextField fullWidth value={topic.value?.join()} minRows={3} disabled />
              )}
            </Grid>
          </>
        ))}
      </Grid>
    </ShareContent>
  )
}

export default SurveyView
