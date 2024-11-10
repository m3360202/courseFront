'use client'

import { useEffect, useState } from 'react'

// MUI Imports
import { useParams, useRouter } from 'next/navigation'

import TextField from '@mui/material/TextField'
import FormHelperText from '@mui/material/FormHelperText'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'

import { any, array, nonEmpty, object, optional, pipe, string } from 'valibot'

import { Card, Checkbox, FormControlLabel, InputAdornment } from '@mui/material'

import LoadingButton from '@mui/lab/LoadingButton'

import { useDictionary } from '@/hooks/useDictionary'
import type { Locale } from '@/configs/i18n'
import type { UserTable } from '@/types/user/UserTable'
import { RequiredStar } from '@/components/form-field'
import { useGlobal } from '@/hooks/useGlobal'
import { success } from '@/utils/toasts'
import { useUser } from '@/hooks/useGlobal'
import { getLocalizedUrl } from '@/utils/i18n'
import Editor from '@/components/editor'
import { convertFromRaw, EditorState } from 'draft-js'
import delay from '@/utils/delay'
import FileUpload from '@/components/file-upload'
import { FileType } from '@/types/file/file'
import { uploadMultiple } from '@/api/upload'
import FileList from '@/components/file-upload/FileList'
import useDescription from '@/hooks/useDescription'
import FormLayout from '@/components/layout/FormLayout'
import { getEnrollmentPolicy } from '@/api/organization/enrollment-policy/getEnrollmentPolicy'
import { EnrollmentPolicy } from '@/types/organization/enrollment/policy'
import { saveEnrollmentPolicy } from '@/api/organization/enrollment-policy/saveEnrollmentPolicy'
import Title from '@/components/title'

const SavePolicy = ({ policyId }: { policyId?: string }) => {
  //States
  const [saveLoading, setSaveLoading] = useState(false)
  const [value, setContentValue] = useState<EditorState | undefined>()
  const [files, setFiles] = useState<FileType[]>()
  const [uploadLoading, setUploadLoading] = useState(false)
  const [loading, setLoading] = useState(false)

  // Hooks
  const dictionary = useDictionary()
  const user = useUser()
  const { lang: locale, organizationId } = useParams()
  const { push } = useRouter()
  const { addTopButtons, setBackUrl, setTitle } = useGlobal()

  console.log(user)

  useEffect(() => {
    if (user && policyId) {
      const loadPolicy = async () => {
        setLoading(true)
        const { data } = await getEnrollmentPolicy(user as UserTable, policyId)
        if (data) {
          const keys = Object.keys(data) as Array<keyof EnrollmentPolicy>
          keys.map(key => {
            switch (key) {
              default:
                setValue(key, data[key])
                break
            }
          })
          setFiles(data.policyFile)
          setContentValue(
            EditorState.createWithContent(
              convertFromRaw({
                entityMap: data?.descriptionObj?.entityMap || {},
                blocks: data?.descriptionObj?.blocks || []
              })
            )
          )
        }
        setLoading(false)
      }
      loadPolicy()
    }
  }, [user, policyId])

  useEffect(() => {
    user && addTopButtons([
      <LoadingButton variant='contained' key='valid' onClick={handleSubmit(onSubmit)} loading={saveLoading}>
        {dictionary.common.submit}
      </LoadingButton>
    ])

    organizationId &&
      setBackUrl([
        getLocalizedUrl(
          policyId ? `/organization/${organizationId}/detail/enrollment-policy/${policyId}/view` : `/organization/${organizationId}/detail/enrollment-policy`,
          locale as Locale
        )
      ])
    setTitle(policyId ? 'Edit enrollment policy' : 'Add enrollment policy')

    return () => {
      addTopButtons(null)
      setBackUrl(null)
    }
  }, [organizationId, user])

  useEffect(() => {
    setValue('policyFile', files)
  }, [files])

  //vars
  const schema = object({
    title: pipe(string(dictionary.common.fieldRequired), nonEmpty(dictionary.common.fieldRequired)),
    policyFile: optional(array(any())),
    description: optional(any()),
    descriptionObj: optional(any()),
    usePolicy: optional(any())
  })

  const {
    control,
    setValue,
    handleSubmit,
    formState: { errors }
  } = useForm<EnrollmentPolicy>({
    resolver: valibotResolver(schema)
  })

  useDescription(value, setValue)

  const onSubmit = async (data: EnrollmentPolicy) => {
    try {
      setSaveLoading(true)
      data._id = policyId as string
      data.instructorId = organizationId as string
      await saveEnrollmentPolicy(user as UserTable, data)
      success(`${policyId ? dictionary.common.edit : dictionary.common.add} ${dictionary.common.successful}`)
      delay(
        () => push(getLocalizedUrl(`/organization/${organizationId}/detail/enrollment-policy`, locale as Locale)),
        500
      )
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
            <div>
              <Title variant='h5'>Attachment</Title>
              <Title variant='caption'>You can upload up to five files for students to download.</Title>
            </div>
            <FileUpload
              loading={uploadLoading}
              accept='application/pdf,image/png,image/jpeg'
              multiple
              handleUploadFiles={handleUploadFiles}
            />
            <FileList files={files} setFiles={setFiles} />
            <Controller
              name='usePolicy'
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={loading ? <></> : <Checkbox key={'usePolicy'} defaultChecked={field.value} {...field} />}
                  label='Require students to upload signature documents'
                />
              )}
            />
          </div>
        </div>
      </Card>
    </FormLayout>
  )
}

export default SavePolicy
