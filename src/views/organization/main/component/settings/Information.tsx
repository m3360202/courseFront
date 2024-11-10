// React Imports
import { useEffect, useState } from 'react'

// Types Imports
import { FileType } from '@/types/file/file'
import { UserTable } from '@/types/user/UserTable'
import { Organization } from '@/types/organization'

// Components Imports
import Crop from '@/components/crop'
import TargetDialog from '@/components/dialog'
import FileUpload from '@/components/file-upload'
import FileList from '@/components/file-upload/FileList'
import { error, success } from '@/utils/toasts'

// Api Imports
import { uploadMultiple } from '@/api/upload'
import saveOrganization from '@/api/organization/saveOrganization'

// Hooks Imports
import { useUser } from '@/hooks/useGlobal'
import { useOrganization } from '@/hooks/useOrganization'

// Mui Imports
import { LoadingButton } from '@mui/lab'
import { Grid, Card, CardHeader, CardContent, Typography } from '@mui/material'

const Information = () => {
  //States
  const [bannerFiles, setBannerFiles] = useState<FileType[]>()
  const [imgFiles, setImgFiles] = useState<FileType[]>()
  const [file, setFile] = useState<File | null>()
  const [uploadBannerLoading, setUploadBannerLoading] = useState(false)
  const [uploadImgLoading, setUploadImgLoading] = useState(false)
  const [cropOpen, setCropOpen] = useState<boolean>(false)
  const [cropMode, setCropMode] = useState<string>('big')
  const [uploadBanner, setUploadBanner] = useState<boolean>()
  const [submitLoading, setSubmitLoading] = useState(false)

  //Hooks
  const user = useUser()
  const { organization, setOrganization } = useOrganization()

  useEffect(() => {
    if (organization) {
      organization.orgBanners && setBannerFiles(organization.orgBanners)
      organization.orgImg && setImgFiles([organization.orgImg])
    }
  }, [organization])

  const handleUploadFiles = async (fileList: File[], isUploadBanner?: boolean) => {
    setFile(fileList[0])
    setCropOpen(true)
    setCropMode(isUploadBanner ? 'big' : 'small' )
    setUploadBanner(isUploadBanner)
  }

  const onUploadHandle = async (file: File) => {
    try {
      if (uploadBanner) setUploadBannerLoading(true)
      else setUploadImgLoading(true)
      const { data } = await uploadMultiple(user as UserTable, [file])
      if (uploadBanner) setBannerFiles([...(bannerFiles ?? [])])
      else setImgFiles([...data])
      setCropOpen(false)
      setFile(null) 
    } catch (err: any) {
      error(err.response.data)
    } finally {
      setUploadBannerLoading(false)
      setUploadImgLoading(false)
    }
  }

  const handleSubmit = async () => {
    setSubmitLoading(true)
    const updateOrg = { ...organization }
    updateOrg.orgImg = imgFiles && imgFiles.length ? imgFiles[0] : undefined
    updateOrg.orgBanners = bannerFiles
    await saveOrganization(user as UserTable, updateOrg as unknown as Organization)
    setSubmitLoading(false)
    setOrganization(updateOrg as unknown as Organization)
    success('Save successful!')
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Upload Image' />
          <CardContent>
            <Grid container spacing={5}>
              <Grid item xs={12} className='flex flex-col gap-4'>
                <Typography variant='h6'>Banners</Typography>
                <FileUpload
                  loading={uploadBannerLoading}
                  handleUploadFiles={async file => {
                    handleUploadFiles(file, true)
                  }}
                />
                <FileList files={bannerFiles} setFiles={setBannerFiles} />
              </Grid>
              <Grid item xs={12} className='flex flex-col gap-4'>
                <Typography variant='h6'>Organization Image</Typography>
                <FileUpload loading={uploadImgLoading} handleUploadFiles={handleUploadFiles} />
                <FileList files={imgFiles} setFiles={setImgFiles} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <div className='flex justify-center gap-4'>
          <LoadingButton variant='contained' loading={submitLoading} onClick={handleSubmit}>
            Save Changes
          </LoadingButton>
        </div>
      </Grid>
      <TargetDialog
        title='Crop Image'
        open={cropOpen}
        sx={{ maxWidth: '600px', margin: '0 auto' }}
        setOpen={setCropOpen}
        content={
          <Crop
            file={file as File}
            aspectRatio={cropMode === 'small' ? 960 / 960 : 1280 / 282}
            onUploadHandle={onUploadHandle}
            loading={uploadBanner ? uploadBannerLoading : uploadImgLoading}
          />
        }
      />
    </Grid>
  )
}

export default Information
