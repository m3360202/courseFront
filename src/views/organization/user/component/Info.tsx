import { OrganizationUser } from '@/types/organization'
import { Card, CardContent, Grid, Typography } from '@mui/material'
import DataList from '@/components/detail-list'
import { DetailItem } from '@/types'
import FileUpload from '@/components/file-upload'
import { useEffect, useState } from 'react'
import FileList from '@/components/file-upload/FileList'
import { FileType } from '@/types/file/file'
import { error } from '@/utils/toasts'
import { uploadMultiple } from '@/api/upload'
import { useUser } from '@/hooks/useGlobal'
import { UserTable } from '@/types/user/UserTable'
import { useOrganization } from '@/hooks/useOrganization'
import { saveOrganizationUser } from '@/api/organization/user/saveOrganizationUser'

const Info = ({ orgUser }: { orgUser: OrganizationUser | undefined }) => {
  //States
  const [uploadResumeLoading, setUploadResumeLoading] = useState(false)
  const [uploadBgLoading, setUploadBgLoading] = useState(false)
  const [resumeFiles, setResumeFiles] = useState<FileType[]>()
  const [bgFiles, setBgFiles] = useState<FileType[]>()
  const user = useUser()
  const { organizationId } = useOrganization()
  //Hooks
  useEffect(() => {
    if(orgUser){
      if(orgUser.background){
        setBgFiles(orgUser.background)
      }
      if(orgUser.resume){
        setResumeFiles(orgUser.resume)
      }
    }
  }, [orgUser])

  const items: DetailItem[] = [
    {
      title: 'Email',
      value:
        orgUser?.user?.collects && orgUser.user?.collects.length > 0
          ? orgUser?.user?.collects[0].email || orgUser?.user?.email
          : orgUser?.user?.email,
      col: 1
    },
    {
      title: 'Phone',
      value:
        orgUser?.user?.collects && orgUser.user?.collects.length > 0
          ? orgUser?.user?.collects[0].phone || orgUser?.user?.phoneNumber
          : orgUser?.user?.phoneNumber,
      col: 1
    },
    {
      title: 'City',
      value: orgUser?.user?.collects && orgUser.user?.collects.length > 0 ? orgUser?.user?.collects[0].city : '',
      col: 1,
      hidden: !orgUser?.user?.collects || !orgUser?.user?.collects.length || !orgUser?.user?.collects[0].city
    },
    {
      title: 'First name',
      value: orgUser?.user?.collects && orgUser.user?.collects.length > 0 ? orgUser?.user?.collects[0].firstName : '',
      col: 1,
      hidden: !orgUser?.user?.collects || !orgUser?.user?.collects.length || !orgUser?.user?.collects[0].firstName
    },
    {
      title: 'Last name',
      value: orgUser?.user?.collects && orgUser.user?.collects.length > 0 ? orgUser?.user?.collects[0].lastName : '',
      col: 1,
      hidden: !orgUser?.user?.collects || !orgUser?.user?.collects.length || !orgUser?.user?.collects[0].lastName
    },
    {
      title: 'Parent 1 first name',
      value:
        orgUser?.user?.collects && orgUser.user?.collects.length > 0 ? orgUser?.user?.collects[0].parentFirstName : '',
      col: 1,
      hidden: !orgUser?.user?.collects || !orgUser?.user?.collects.length || !orgUser?.user?.collects[0].parentFirstName
    },
    {
      title: 'Parent 1 last name',
      value:
        orgUser?.user?.collects && orgUser.user?.collects.length > 0 ? orgUser?.user?.collects[0].parentLastName : '',
      col: 1,
      hidden: !orgUser?.user?.collects || !orgUser?.user?.collects.length || !orgUser?.user?.collects[0].parentLastName
    },
    {
      title: 'Parent 1 email',
      value: orgUser?.user?.collects && orgUser.user?.collects.length > 0 ? orgUser?.user?.collects[0].parentEmail : '',
      col: 1,
      hidden: !orgUser?.user?.collects || !orgUser?.user?.collects.length || !orgUser?.user?.collects[0].parentEmail
    },
    {
      title: 'Parent 1 phone',
      value: orgUser?.user?.collects && orgUser.user?.collects.length > 0 ? orgUser?.user?.collects[0].parentPhone : '',
      col: 1,
      hidden: !orgUser?.user?.collects || !orgUser?.user?.collects.length || !orgUser?.user?.collects[0].parentPhone
    },
    {
      title: 'Parent 2 first name',
      value:
        orgUser?.user?.collects && orgUser.user?.collects.length > 0 ? orgUser?.user?.collects[0].parent1FirstName : '',
      col: 2,
      hidden:
        !orgUser?.user?.collects || !orgUser?.user?.collects.length || !orgUser?.user?.collects[0].parent1FirstName
    },
    {
      title: 'Parent 2 last name',
      value:
        orgUser?.user?.collects && orgUser.user?.collects.length > 0 ? orgUser?.user?.collects[0].parent1LastName : '',
      col: 2,
      hidden: !orgUser?.user?.collects || !orgUser?.user?.collects.length || !orgUser?.user?.collects[0].parent1LastName
    },
    {
      title: 'Parent 2 email',
      value:
        orgUser?.user?.collects && orgUser.user?.collects.length > 0 ? orgUser?.user?.collects[0].parent1Email : '',
      col: 2,
      hidden: !orgUser?.user?.collects || !orgUser?.user?.collects.length || !orgUser?.user?.collects[0].parent1Email
    },
    {
      title: 'Parent 2 phone',
      value:
        orgUser?.user?.collects && orgUser.user?.collects.length > 0 ? orgUser?.user?.collects[0].parent1Phone : '',
      col: 2,
      hidden: !orgUser?.user?.collects || !orgUser?.user?.collects.length || !orgUser?.user?.collects[0].parent1Phone
    },
    {
      title: 'Course',
      value: orgUser?.courseCount.toString(),
      col: 2
    }
  ]

  const handleUploadFiles = async (fileList: File[], isUploadResume?: boolean) => {
    if (fileList[0].name.toLowerCase().indexOf('.pdf') === -1) {
      error('Please upload pdf file!')

      return
    }
    const { data } = await uploadMultiple(user as UserTable, fileList)

    if (isUploadResume) {
      setUploadResumeLoading(true)
      setResumeFiles(data)
      saveOrganizationUser(user as UserTable, orgUser?.user?._id as string, organizationId, data, bgFiles)
    } else {
      setUploadBgLoading(true)
      setBgFiles(data)
      saveOrganizationUser(user as UserTable, orgUser?.user?._id as string, organizationId, resumeFiles, data)
    }

    if (isUploadResume) {
      setUploadResumeLoading(false)
    } else {
      setUploadBgLoading(false)
    }
  }

  return (
    <Card>
      <CardContent>
        <DataList items={items} />
        {(orgUser?.userType as string) === 'Instructor' && (
          <Grid container spacing={5} pt={4}>
            <Grid item xs={12} className='flex flex-col gap-4'>
              <Typography variant='h6'>Resume</Typography>
              <FileUpload
                loading={uploadResumeLoading}
                multiple
                accept='application/pdf'
                sx={{ width: '20%' }}
                handleUploadFiles={async file => {
                  handleUploadFiles(file, true)
                }}
              />
              <FileList files={resumeFiles} setFiles={setResumeFiles} />
            </Grid>
            <Grid item xs={12} className='flex flex-col gap-4'>
              <Typography variant='h6'>Background Investigation</Typography>
              <FileUpload
                loading={uploadBgLoading}
                accept='application/pdf'
                sx={{ width: '20%' }}
                handleUploadFiles={handleUploadFiles}
              />
              <FileList files={bgFiles} setFiles={setBgFiles} />
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  )
}

export default Info
