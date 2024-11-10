'use client'

import { useEffect, useState } from 'react'

// Hooks Imports
import { useUser } from '@/hooks/useGlobal'
import { UserTable } from '@/types/user/UserTable'

// Third-party Imports
import Editor from '@/components/editor'
import { Card } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import { success, error } from '@/utils/toasts'
import { convertFromRaw, convertToRaw, EditorState } from 'draft-js'
import { useOrganization } from '@/hooks/useOrganization'
import draftToHtml from 'draftjs-to-html'
import saveOrganization from '@/api/organization/saveOrganization'
import { Organization } from '@/types/organization'

const Description = () => {
  //States
  const [submitLoading, setSubmitLoading] = useState(false)
  const [value, setContentValue] = useState<EditorState | undefined>()

  //Hooks
  const { organization, setOrganization } = useOrganization()
  const user = useUser()

  useEffect(() => {
    if (organization && organization.defineContentObj) {
      setContentValue(
        EditorState.createWithContent(
          convertFromRaw({
            entityMap: organization?.defineContentObj?.entityMap || {},
            blocks: organization?.defineContentObj?.blocks || []
          })
        )
      )
    }
  }, [])

  const handleSubmit = async () => {
    setSubmitLoading(true)
    if (value) {
      const updateOrg = { ...organization }
      updateOrg.defineContentObj = convertToRaw(value.getCurrentContent())
      updateOrg.defineContent = draftToHtml(
        convertToRaw(EditorState.createWithContent(convertFromRaw(updateOrg.defineContentObj)).getCurrentContent())
      )
      await saveOrganization(user as UserTable, updateOrg as unknown as Organization)
      setSubmitLoading(false)
      setOrganization(updateOrg as unknown as Organization)
      success('Save successful!')
    } else {
      error('Please input description')
    }
  }

  return (
    <Card>
      <div className='p-5'>
        <div className='flex flex-col gap-5'>
          <Editor
            placeholder='Description'
            user={user as UserTable}
            value={value}
            setContentValue={setContentValue}
          />
          <div className='flex justify-center gap-4'>
            <LoadingButton variant='contained' loading={submitLoading} onClick={handleSubmit}>
              Save Changes
            </LoadingButton>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default Description
