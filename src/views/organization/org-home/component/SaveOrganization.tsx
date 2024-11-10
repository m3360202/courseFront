import { uploadMultiple } from '@/api/upload'
import Crop from '@/components/crop'
import TargetDialog from '@/components/dialog'
import FileUpload from '@/components/file-upload'
import FileList from '@/components/file-upload/FileList'
import { useUser } from '@/hooks/useGlobal'
import { FileType } from '@/types/file/file'
import { UserTable } from '@/types/user/UserTable'
import { error, success } from '@/utils/toasts'
import { LoadingButton } from '@mui/lab'
import { Grid, Card, CardHeader, CardContent, TextField, Alert } from '@mui/material'
import { useEffect, useState } from 'react'
import { useOrganization } from '@/hooks/useOrganization'
import saveOrganization from '@/api/organization/saveOrganization'
import { Organization } from '@/types/organization'
import { unknown } from 'valibot'
import AddressInput from '@/components/address-input'

const SaveOrganization = () => {
  //States
  const [imgFiles, setImgFiles] = useState<FileType[]>()
  const [file, setFile] = useState<File>()
  const [uploadImgLoading, setUploadImgLoading] = useState(false)
  const [cropOpen, setCropOpen] = useState<boolean>(false)
  const [submitLoading, setSubmitLoading] = useState(false)

  //Hooks
  const user = useUser()
  const { organization, setOrganization } = useOrganization()

  const [name, setName] = useState<string | undefined>(organization?.name)
  const [email, setEmail] = useState<string | undefined>(organization?.email)
  const [phone, setPhone] = useState<string | undefined>(organization?.phone)
  const [website, setWebsite] = useState<string | undefined>(organization?.website)
  const [address, setAddress] = useState<string | undefined>(organization?.address)
  const [description, setDescription] = useState<string | undefined>(organization?.description)
  const [stripeKey, setStripeKey] = useState<string | undefined>(organization?.stripeKey)
  const [planId, setPlanId] = useState<string | undefined>(organization?.planId)

  useEffect(() => {
    if (organization) {
      organization.orgImg && setImgFiles([organization.orgImg])
    }
  }, [organization])

  const handleUploadFiles = async (fileList: File[]) => {
    setFile(fileList[0])
    setCropOpen(true)
  }

  const onUploadHandle = async (file: File) => {
    try {
      setUploadImgLoading(true)
      const { data } = await uploadMultiple(user as UserTable, [file])
      setImgFiles([...data])
      setCropOpen(false)
    } catch (err: any) {
      error(err.response.data)
    } finally {
      setUploadImgLoading(false)
    }
  }

  const handleSubmit = async () => {
    setSubmitLoading(true)
    const updateOrg = { ...organization }
    updateOrg.email = email
    updateOrg.phone = phone
    updateOrg.website = website
    updateOrg.address = address
    updateOrg.orgImg = imgFiles && imgFiles.length ? imgFiles[0] : undefined
    updateOrg.description = description
    updateOrg.name = name
    updateOrg.stripeKey = stripeKey
    updateOrg.planId = planId
    await saveOrganization(user as UserTable, updateOrg as unknown as Organization)
    setSubmitLoading(false)
    setOrganization(updateOrg as unknown as Organization)
    success('Save successful!')
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Information' />
          <CardContent>
            <Grid container spacing={5}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='Name'
                  value={name || unknown}
                  onChange={e => {
                    setName(e.target.value)
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='Email'
                  value={email || unknown}
                  onChange={e => {
                    setEmail(e.target.value)
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='Phone'
                  value={phone || unknown}
                  onChange={e => {
                    setPhone(e.target.value)
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='Website'
                  value={website || unknown}
                  onChange={e => {
                    setWebsite(e.target.value)
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <AddressInput
                  value={address as string}
                  onChange={e => setAddress(e)}
                  label='Address'
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Organization Image' />
          <CardContent>
            <Grid container spacing={5}>
              <Grid item xs={12} className='flex flex-col gap-4'>
                <FileUpload loading={uploadImgLoading} handleUploadFiles={handleUploadFiles} />
                <FileList files={imgFiles} setFiles={setImgFiles} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Payment setting' />
          <CardContent>
            <Grid container spacing={5}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='StripeKey'
                  value={stripeKey || unknown}
                  onChange={e => {
                    setStripeKey(e.target.value)
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='PlanId'
                  value={planId || unknown}
                  onChange={e => {
                    setPlanId(e.target.value)
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Alert severity='warning'>
                  Please keep your apiKey safe, the platform will not disclose any of your private data
                </Alert>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Bio' />
          <CardContent>
            <TextField
              fullWidth
              label='Bio'
              multiline
              minRows={3}
              maxRows={6}
              inputProps={{ maxLength: 500 }}
              value={description || unknown}
              onChange={e => {
                setDescription(e.target.value)
              }}
            />
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
        sx={{ maxWidth: '600px', margin: '0 auto' }}
        title='Crop Image'
        open={cropOpen}
        setOpen={setCropOpen}
        content={
          <Crop file={file} aspectRatio={960 / 960} onUploadHandle={onUploadHandle} loading={uploadImgLoading} />
        }
      />
    </Grid>
  )
}

export default SaveOrganization
