'use client'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import FormControlLabel from '@mui/material/FormControlLabel'
import { SyntheticEvent, useEffect, useState } from 'react'
import { Checkbox, FormGroup } from '@mui/material'
import { useOrganization } from '@/hooks/useOrganization'
import { useUser } from '@/hooks/useGlobal'
import { LoadingButton } from '@mui/lab'
import saveOrganization from '@/api/organization/saveOrganization'
import { Organization, PlatformUser, UserType } from '@/types/organization'
import { UserTable } from '@/types/user/UserTable'
import { success } from '@/utils/toasts'

const Teacher = () => {
  // States
  const [teachers, setTeachers] = useState<PlatformUser[]>()
  const [checked, setChecked] = useState<{ [key: string]: boolean }>()
  const [submitLoading, setSubmitLoading] = useState(false)

  //Hooks
  const { organization, setOrganization } = useOrganization()
  const user = useUser()

  useEffect(() => {
    if (organization) {
      const pTeachers = organization.platformUsers?.filter(c => c.userType === UserType.Teacher)
      pTeachers?.map(teacher => {
        if (organization.defineTeachers?.find(c => (c.id as UserTable)?._id === (teacher.userId as UserTable)?._id)) {
          setChecked(prevState => ({
            ...prevState,
            [(teacher.userId as UserTable)._id]: true
          }))
        }
      })
      setTeachers(pTeachers)
    }
  }, [organization])

  useEffect(() => {
    console.log(checked)
  }, [checked])

  const handleChange = (name: string) => (event: SyntheticEvent<Element, Event>, checked: boolean) => {
    setChecked(prevState => ({
      ...prevState,
      [name]: checked
    }))
  }

  const getCheckedValues = () => {
    if (checked)
      return Object.entries(checked)
        .filter(([, value]) => value)
        .map(([key]) => ({ id: key }))
  }

  const handleSubmit = async () => {
    setSubmitLoading(true)
    const updateOrg = { ...organization }
    updateOrg.defineTeachers = getCheckedValues()
    await saveOrganization(user as UserTable, updateOrg as unknown as Organization)
    setSubmitLoading(false)
    setOrganization(updateOrg as unknown as Organization)
    success('Save successful!')
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Customer instructors' subheader='Select which instructors to display.' />
          <CardContent>
            <FormGroup>
              {teachers?.map(teacher => (
                <FormControlLabel
                  key={(teacher.userId as UserTable)._id}
                  value={(teacher.userId as UserTable)._id}
                  checked={checked ? checked[(teacher.userId as UserTable)._id] : undefined}
                  defaultChecked={checked ? checked[(teacher.userId as UserTable)._id] : undefined}
                  control={<Checkbox />}
                  label={(teacher.userId as UserTable).nickName || (teacher.userId as UserTable).username}
                  onChange={handleChange((teacher.userId as UserTable)._id)}
                />
              ))}
            </FormGroup>
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
    </Grid>
  )
}

export default Teacher
