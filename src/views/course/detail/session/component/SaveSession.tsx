'use client'

import { useEffect, useState } from 'react'

// MUI Imports
import { useParams, useRouter } from 'next/navigation'

import TextField from '@mui/material/TextField'
import FormHelperText from '@mui/material/FormHelperText'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'

import { date, minValue, nonEmpty, number, object, pipe, string } from 'valibot'

import { Card, InputAdornment } from '@mui/material'

import LoadingButton from '@mui/lab/LoadingButton'

import { useDictionary } from '@/hooks/useDictionary'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

import { useCourse } from '@/hooks/useCourse'
import type { Locale } from '@/configs/i18n'
import type { UserTable } from '@/types/user/UserTable'
import { transformLocalDateZoneToUTC, transformDateFromUTC } from '@/utils/date'
import { RequiredStar } from '@/components/form-field'
import { useGlobal, useUser } from '@/hooks/useGlobal'
import { success } from '@/utils/toasts'
import { delay } from 'lodash'
import { getLocalizedUrl } from '@/utils/i18n'
import { getSession } from '@/api/course/getSession'
import { Session } from '@/types/course/session'
import saveSession from '@/api/course/saveSession'
import Editor from '@/components/editor'
import { convertFromRaw, EditorState } from 'draft-js'
import useDescription from '@/hooks/useDescription'
import FormLayout from '@/components/layout/FormLayout'

const SaveSession = ({ sessionId }: { sessionId?: string }) => {
  //States
  const [saveLoading, setSaveLoading] = useState(false)
  const [value, setContentValue] = useState<EditorState | undefined>()

  // Hooks
  const dictionary = useDictionary()
  const user = useUser()
  const { lang: locale } = useParams()
  const { courseId } = useCourse()
  const { push } = useRouter()
  const { addTopButtons, setHiddenTabs, setBackUrl } = useGlobal()

  //Vars
  // const ref = useRef<HTMLButtonElement>(null)

  const loadSession = async () => {
    const { data } = await getSession(user as UserTable, courseId, sessionId)
    if (data) {
      const keys = Object.keys(data) as Array<keyof Session>
      keys.map(key => {
        switch (key) {
          case 'lessonDate':
          case 'lessonStartTime':
            setValue(key, transformDateFromUTC(data[key] as Date, user))
            break
          default:
            setValue(key, data[key])
            break
        }
      })

      setContentValue(
        EditorState.createWithContent(
          convertFromRaw({
            entityMap: data?.descriptionObj?.entityMap || {},
            blocks: data?.descriptionObj?.blocks || []
          })
        )
      )
    }
  }

  useEffect(() => {
    if (user && courseId && sessionId) loadSession()
  }, [user, courseId, sessionId])

  useEffect(() => {
    courseId && setBackUrl([getLocalizedUrl(sessionId ? `/course/${courseId}/detail/session/${sessionId}/view` : `/course/${courseId}/detail/session`, locale as Locale)])
    setHiddenTabs(true)

    return () => {
      setBackUrl(null)
      setHiddenTabs(false)
    }
  }, [courseId])

  //vars
  const schema = object({
    name: pipe(string(dictionary.common.fieldRequired), nonEmpty(dictionary.common.fieldRequired)),
    lessonDate: date(dictionary.common.fieldRequired),
    lessonStartTime: date(dictionary.common.fieldRequired),
    lessonDuration: pipe(number(dictionary.common.fieldRequired), minValue(1, dictionary.common.fieldRequired))
  })

  const {
    control,
    setValue,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<Session>({
    resolver: valibotResolver(schema)
  })

  useEffect(() => {
    user && addTopButtons([
      <LoadingButton variant='contained' key={isValid ? 'valid' : 'invalid'} onClick={handleSubmit(onSubmit)} loading={saveLoading}>
        {dictionary.common.submit}
      </LoadingButton>
    ])

    return () => {
      addTopButtons(null)
    }
  }, [isValid, user])

  useDescription(value, setValue)

  const onSubmit = async (data: Session) => {
    try {
      setSaveLoading(true)
      data._id = sessionId as string
      data.courseId = courseId
      data.lessonStartTime = transformLocalDateZoneToUTC(data.lessonStartTime, user)
      data.lessonDate = transformLocalDateZoneToUTC(data.lessonDate, user)
      await saveSession(user as UserTable, data)
      success(
        `${sessionId ? dictionary.common.edit : dictionary.common.add} ${dictionary.course.session} ${dictionary.common.successful}`
      )
      delay(() => push(getLocalizedUrl(`/course/${courseId}/detail/session`, locale as Locale)), 500)
    } catch {
    } finally {
      setSaveLoading(false)
    }
  }

  return (
    <FormLayout>
      <Card>
        <div className='p-5'>
          <div className='flex flex-col gap-5'>
            <Controller
              name='name'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  onChange={field.onChange}
                  fullWidth
                  label='Title'
                  placeholder=''
                  {...(errors.name && {
                    error: true,
                    helperText: errors?.name?.message
                  })}
                  InputProps={{
                    startAdornment: <InputAdornment position='start'>{<RequiredStar />}</InputAdornment>
                  }}
                />
              )}
            />
            <Controller
              name='lessonDate'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <AppReactDatepicker
                  selected={field.value as Date}
                  onChange={date => {
                    setValue('lessonDate', date as Date)
                  }}
                  placeholderText='MM/DD/YYYY'
                  customInput={
                    <TextField
                      fullWidth
                      label='Session Date'
                      InputProps={{
                        startAdornment: <InputAdornment position='start'>{<RequiredStar />}</InputAdornment>
                      }}
                      {...(errors.lessonDate && {
                        error: true,
                        helperText: errors?.lessonDate?.message
                      })}
                    />
                  }
                />
              )}
            />
            <div className='flex gap-1 w-full'>
              <div className=' w-1/2'>
                <Controller
                  name='lessonStartTime'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <AppReactDatepicker
                      selected={field.value as Date}
                      onChange={date => {
                        setValue('lessonStartTime', date as Date)
                      }}
                      showTimeSelect
                      showTimeSelectOnly
                      placeholderText='hh:mm'
                      dateFormat='h:mm aa'
                      customInput={
                        <TextField
                          fullWidth
                          label={dictionary.course.sessionStartTime}
                          {...(errors.lessonStartTime && {
                            error: true,
                            helperText: errors?.lessonStartTime?.message
                          })}
                          InputProps={{
                            startAdornment: <InputAdornment position='start'>{<RequiredStar />}</InputAdornment>
                          }}
                        />
                      }
                    />
                  )}
                />
              </div>
              <div className=' w-1/2'>
                <Controller
                  name='lessonDuration'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={dictionary.course.sessionLength}
                      type='number'
                      inputProps={{ min: 1 }}
                      placeholder=''
                      {...(errors.lessonDuration && {
                        error: true,
                        helperText: errors?.lessonDuration?.message
                      })}
                      onChange={event => {
                        field.onChange(event.target.value === '' ? undefined : Number(event.target.value))
                      }}
                      InputProps={{
                        startAdornment: <InputAdornment position='start'>{<RequiredStar />}</InputAdornment>
                      }}
                    />
                  )}
                />
              </div>
            </div>
            <Controller
              name='description'
              control={control}
              rules={{ required: true }}
              render={() => (
                <>
                  <Editor
                    placeholder='Description'
                    user={user as UserTable}
                    value={value}
                    setContentValue={setContentValue}
                  />
                  {errors.description && (
                    <FormHelperText sx={{ color: 'error.main' }}>{errors.description.message}</FormHelperText>
                  )}
                </>
              )}
            />

            {/* <LoadingButton className='hidden' ref={ref} onClick={handleSubmit(onSubmit)} loading={saveLoading}>
            {dictionary.common.submit}
          </LoadingButton> */}
          </div>
        </div>
      </Card>
    </FormLayout>
  )
}

export default SaveSession
