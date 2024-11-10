'use client'

import { useEffect, useState } from 'react'

// MUI Imports
import { useParams, useRouter } from 'next/navigation'

import TextField from '@mui/material/TextField'
import FormHelperText from '@mui/material/FormHelperText'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'

import { any, array, date, nonEmpty, number, object, optional, pipe, string, unknown } from 'valibot'

import { Card, InputAdornment } from '@mui/material'

import LoadingButton from '@mui/lab/LoadingButton'

import { useDictionary } from '@/hooks/useDictionary'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

import { useCourse } from '@/hooks/useCourse'
import type { Locale } from '@/configs/i18n'
import type { UserTable } from '@/types/user/UserTable'
import { transformLocalDateZoneToUTC, transformDateFromUTC } from '@/utils/date'
import { RequiredStar } from '@/components/form-field'
import { useGlobal } from '@/hooks/useGlobal'
import { success } from '@/utils/toasts'
import { useUser } from '@/hooks/useGlobal'
import { getLocalizedUrl } from '@/utils/i18n'
import Editor from '@/components/editor'
import { convertFromRaw, EditorState } from 'draft-js'
import { getAssignment } from '@/api/course/assignment/getAssignment'
import { Assignment } from '@/types/course/assignment'
import saveAssignment from '@/api/course/assignment/saveAssignment'
import delay from '@/utils/delay'
import FileUpload from '@/components/file-upload'
import { FileType } from '@/types/file/file'
import { uploadMultiple } from '@/api/upload'
import FileList from '@/components/file-upload/FileList'
import useDescription from '@/hooks/useDescription'
import FormLayout from '@/components/layout/FormLayout'

const SaveAssignment = ({ assignmentId }: { assignmentId?: string }) => {
  //States
  const [saveLoading, setSaveLoading] = useState(false)
  const [value, setContentValue] = useState<EditorState | undefined>()
  const [files, setFiles] = useState<FileType[]>()
  const [uploadLoading, setUploadLoading] = useState(false)

  // Hooks
  const dictionary = useDictionary()
  const user = useUser()
  const { lang: locale, organizationId } = useParams()
  const { courseId } = useCourse()
  const { push } = useRouter()
  const { addTopButtons, setHiddenTabs, setBackUrl } = useGlobal()

  useEffect(() => {
    if (user && courseId && assignmentId) {
      const loadSession = async () => {
        const { data } = await getAssignment(user as UserTable, courseId, assignmentId)
        if (data) {
          const keys = Object.keys(data) as Array<keyof Assignment>
          keys.map(key => {
            switch (key) {
              case 'endDate':
                setValue(key, transformDateFromUTC(data[key] as Date, user))
                break
              default:
                setValue(key, data[key])
                break
            }
          })
          setFiles(data.files)
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
      loadSession()
    }
  }, [user, courseId, assignmentId])

  useEffect(() => {

    courseId && setBackUrl([getLocalizedUrl(assignmentId ? `/course/${courseId}/detail/assignment/${assignmentId}/view` : `/course/${courseId}/detail/assignment`, locale as Locale)])
    setHiddenTabs(true)

    return () => {
      addTopButtons(null)
      setHiddenTabs(false)
    }
  }, [courseId])

  useEffect(() => {
    setValue('files', files)
  }, [files])

  //vars
  const schema = object({
    title: pipe(string(dictionary.common.fieldRequired), nonEmpty(dictionary.common.fieldRequired)),
    endDate: optional(date()),
    totalScore: number(dictionary.common.fieldRequired),
    files: optional(array(any())),
    description: optional(any()),
    descriptionObj: optional(any())
  })

  const {
    control,
    setValue,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<Assignment>({
    resolver: valibotResolver(schema)
  })

  useEffect(() => {
    user && addTopButtons([
      <LoadingButton variant='contained' key={isValid ? 'submit' : 'invalid'} onClick={handleSubmit(onSubmit)} loading={saveLoading}>
        {dictionary.common.submit}
      </LoadingButton>
    ])


    return () => {
      addTopButtons(null)
    }
  }, [isValid, user])

  useDescription(value, setValue)

  const onSubmit = async (data: Assignment) => {
    try {
      setSaveLoading(true)
      data._id = assignmentId as string
      data.endDate = transformLocalDateZoneToUTC(data.endDate, user)

      data.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
      data.time = new Date().toString()
      data.instructorId = organizationId as string
      await saveAssignment(user as UserTable, courseId as string, data)
      success(
        `${assignmentId ? dictionary.common.edit : dictionary.common.add} assignment ${dictionary.common.successful}`
      )
      delay(() => push(getLocalizedUrl(`/course/${courseId}/detail/assignment`, locale as Locale)), 500)
    } catch {
    } finally {
      setSaveLoading(false)
    }
  }

  const handleUploadFiles = async (fileList: File | File[]) => {
    setUploadLoading(true)
    const { data } = await uploadMultiple(user as UserTable, fileList as File[])
    setFiles([...data, ...(files ?? [])])
    setUploadLoading(false)
  }

  return (
    <FormLayout>
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
                  onChange={field.onChange}
                  fullWidth
                  label='Title'
                  placeholder=''
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
            <Controller
              name='totalScore'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={!field.value ? unknown : field.value}
                  fullWidth
                  label={'Total Score'}
                  type='number'
                  inputProps={{ min: 1 }}
                  placeholder=''
                  {...(errors.totalScore && {
                    error: true,
                    helperText: errors?.totalScore?.message
                  })}
                  onChange={event => {
                    field.onChange(event.target.value === '' ? undefined : Number(event.target.value))
                  }}
                />
              )}
            />
            <Controller
              name='endDate'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <AppReactDatepicker
                  selected={field.value as Date}
                  onChange={date => {
                    setValue('endDate', date as Date)
                  }}
                  showTimeSelect
                  dateFormat='MM/dd/yyyy h:mm aa'
                  customInput={
                    <TextField
                      fullWidth
                      label='End Date'
                      {...(errors.endDate && {
                        error: true,
                        helperText: errors?.endDate?.message
                      })}
                    />
                  }
                />
              )}
            />
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
            <FileUpload loading={uploadLoading} multiple handleUploadFiles={handleUploadFiles} />
            <FileList files={files} setFiles={setFiles} />
          </div>
        </div>
      </Card>
    </FormLayout>
  )
}

export default SaveAssignment
