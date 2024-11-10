'use client'

// MUI Imports
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
import { Button, Checkbox, FormControlLabel } from '@mui/material'
import delay from '@/utils/delay'
import FileList from '@/components/file-upload/FileList'
import { EnrollmentPolicy } from '@/types/organization/enrollment/policy'
import { getEnrollmentPolicy } from '@/api/organization/enrollment-policy/getEnrollmentPolicy'
import { deleteEnrollmentPolicy } from '@/api/organization/enrollment-policy/deleteEnrollmentPolicy'
import ShareContent from '@/views/course/component/ShareContent'

const PolicyView = ({ policyId }: { policyId: string }) => {
  //States
  const [data, setData] = useState<EnrollmentPolicy | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [loading, setLoading] = useState(true)

  // Hooks
  const { lang: locale, organizationId } = useParams()
  const { setBackUrl, setTitle } = useGlobal()
  const user = useUser()
  const dictionary = useDictionary()
  const { push } = useRouter()

  useEffect(() => {
    const loadPolicy = async () => {
      if (user && policyId) {
        const { data } = await getEnrollmentPolicy(user, policyId)
        setData(data)
        setLoading(false)
      }
    }
    loadPolicy()
  }, [user, policyId])

  useEffect(() => {
    organizationId &&
      setBackUrl([
        getLocalizedUrl(
          `/organization/${organizationId}/detail/enrollment-policy`,
          locale as Locale
        )
      ])
    setTitle('Enrollment policy view')

    return () => {
      setBackUrl(null)
    }
  }, [user, organizationId])

  const handleDelete = async () => {
    try {
      setDeleteLoading(true)
      await deleteEnrollmentPolicy(user as UserTable, policyId)
      success(`${dictionary.common.delete} ${dictionary.common.successful}`)
      delay(
        () => push(getLocalizedUrl(`/organization/${organizationId}/detail/enrollment-policy`, locale as Locale)),
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
          `/organization/${organizationId}/detail/enrollment-policy/${policyId}/edit`,
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
    <>
      <ShareContent about='policy' title={data?.title} items={[]} buttons={buttons} hiddenInstructor>
        <div className='flex flex-col gap-4'>
          <Typography variant='h5'>Title</Typography>
          <Typography>{data?.title}</Typography>
        </div>
        <div className='flex flex-col gap-4'>
          <Typography variant='h5'>Description</Typography>
          <Title dangerouslySetInnerHTML={{ __html: data?.description || '' }} />
        </div>
        <div className='flex flex-col gap-4'>
          <Typography variant='h5'>Attachment</Typography>
          <FileList files={data?.policyFile} />
        </div>
        <div className='flex flex-col gap-4'>
          <FormControlLabel
            control={
              !loading ? (
                <Checkbox key={'usePolicy'} defaultChecked={data?.usePolicy ? data.usePolicy : undefined} disabled />
              ) : (
                <></>
              )
            }
            label='Require students to upload signature documents'
          />
        </div>
      </ShareContent>
    </>
  )
}

export default PolicyView
