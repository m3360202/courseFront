'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

// Hooks Imports
import { useUser } from '@/hooks/useGlobal'
import { useGlobal } from '@/hooks/useGlobal'

// Type Imports
import { UserTable } from '@/types/user/UserTable'

//Api Imports
import { uploadMultiple } from '@/api/upload'
import { changeUserProfile } from '@/api/user/profile/changeUserProfile'

// Third-party Imports
import { getTimeZoneNames } from '@/utils/getTimeZoneName'
import { error, success } from '@/utils/toasts'
import { cloneDeep } from 'lodash'
import FileUpload from '@/components/file-upload'
import Crop from '@/components/crop'
import TargetDialog from '@/components/dialog'
import UserAvatar from '@/components/user-avatar'

type Data = {
  userName: string
  nickName: string | undefined
  email: string
  state: string | undefined
  phone: number | string | undefined
  fax: string | undefined
  city: string | undefined
  website: string | undefined
  bio: string | undefined
  timezone: string
}

// Vars
const initialData: Data = {
  userName: '',
  email: '',
  nickName: '',
  state: '',
  city: '',
  phone: '',
  fax: '',
  bio: '',
  website: '',
  timezone: ''
}

const AccountDetails = () => {
  // Hooks
  const user = useUser()
  const { setUser } = useGlobal()
  // States
  const [formData, setFormData] = useState<Data>(initialData)
  const [uploadAvatarLoading, setUploadAvatarLoading] = useState(false)
  const [cropOpen, setCropOpen] = useState<boolean>(false)
  const [uploadAvatar, setUploadAvatar] = useState<boolean>()
  const [file, setFile] = useState<File>()

  const handleUploadFiles = async (fileList: File[], isUploadBanner?: boolean) => {
    if (fileList && fileList[0]) {
      setFile(fileList[0])
      setCropOpen(true)
      setUploadAvatar(isUploadBanner)
    }
  }

  const onUploadHandle = async (file: File) => {
    try {
      if (uploadAvatar) setUploadAvatarLoading(true)
      const { data } = await uploadMultiple(user as UserTable, [file])
      if (data && data[0] && data[0].temporary) {
        await changeUserProfile(user as UserTable, user?._id as string, { userImg: data[0].temporary })
        const globalUserCopy = cloneDeep({
          ...user,
          userImg: data[0].temporary
        }) as UserTable
        setUser(globalUserCopy)
        success('Save avatar success')
      }
      setCropOpen(false)
    } catch (err: any) {
      error(err.response.data)
    } finally {
      setUploadAvatarLoading(false)
    }
  }
  const handleFormChange = (field: keyof Data, value: Data[keyof Data]) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = async () => {
    const userId = user?._id ?? ''
    const result: any = await changeUserProfile(user as UserTable, userId, formData)
    if (result && result.success) {
      const name = formData.nickName || formData.userName
      const globalUserCopy = cloneDeep({
        ...user,
        name,
        nickName: formData.nickName,
        address: {
          state: formData.state,
          city: formData.city
        },
        personal: {
          phone: formData.phone,
          fax: formData.fax
        },
        website: formData.website,
        bio: formData.bio,
        timeZone: formData.timezone
      }) as UserTable
      setUser(globalUserCopy)
      success('Save profile success')
    }
    if (result && !result.success && result.message) {
      error(result.message)
    }
  }

  useEffect(() => {
    if (user) {
      setFormData({
        userName: user.username,
        nickName: user.nickName,
        email: user.email,
        state: user.address?.state,
        city: user.address?.city,
        phone: user.personal?.phone,
        fax: user.personal?.fax,
        website: user.website,
        bio: user.bio,
        timezone: user.timeZone
      })
    }
  }, [user])

  return (
    <Card>
      <CardContent className='mbe-5'>
        <div className='flex max-sm:flex-col items-center gap-6'>
          <UserAvatar userImg={user?.userImg} name={user?.name} hiddenName={true} size={140} />
          <div className='flex flex-grow flex-col gap-4'>
            <div className='flex flex-col sm:flex-row gap-4'>
              <FileUpload accept='image/*' loading={uploadAvatarLoading} handleUploadFiles={handleUploadFiles} />
            </div>
            <Typography>Allowed JPG, GIF or PNG. Max size of 800K</Typography>
          </div>
          <TargetDialog
            title='Crop Image'
            open={cropOpen}
            setOpen={setCropOpen}
            content={
              <Crop
                file={file}
                aspectRatio={960 / 960}
                onUploadHandle={onUploadHandle}
                loading={uploadAvatarLoading}
              />
            }
          />
        </div>
      </CardContent>
      <CardContent>
        <form onSubmit={e => e.preventDefault()}>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                disabled
                label='User Name'
                value={formData.userName}
                placeholder=''
                onChange={e => handleFormChange('userName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                disabled
                label='Email'
                value={formData.email}
                placeholder=''
                onChange={e => handleFormChange('email', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Nick Name'
                value={formData.nickName}
                placeholder=''
                onChange={e => handleFormChange('nickName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='State'
                value={formData.state}
                placeholder=''
                onChange={e => handleFormChange('state', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='City'
                value={formData.city}
                placeholder='City'
                onChange={e => handleFormChange('city', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Phone Number'
                value={formData.phone}
                placeholder=''
                onChange={e => handleFormChange('phone', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Fax'
                value={formData.fax}
                placeholder=''
                onChange={e => handleFormChange('fax', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Website'
                value={formData.website}
                placeholder=''
                onChange={e => handleFormChange('website', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Bio'
                value={formData.bio}
                placeholder=''
                onChange={e => handleFormChange('bio', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>TimeZone</InputLabel>
                <Select
                  label='TimeZone'
                  value={formData.timezone}
                  onChange={e => handleFormChange('timezone', e.target.value)}
                  MenuProps={{ PaperProps: { style: { maxHeight: 250 } } }}
                >
                  {getTimeZoneNames().map((item: any, index: number) => (
                    <MenuItem key={index} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} className='flex gap-4 flex-wrap'>
              <Button variant='contained' type='submit' onClick={handleSubmit}>
                Save Changes
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default AccountDetails
