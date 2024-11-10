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
import { getCourses } from '@/api/course/getCourses'
import { useUser } from '@/hooks/useGlobal'
import { Course } from '@/types/course'
import { LoadingButton } from '@mui/lab'
import saveOrganization from '@/api/organization/saveOrganization'
import { Organization } from '@/types/organization'
import { UserTable } from '@/types/user/UserTable'
import { success } from '@/utils/toasts'

const CourseSettings = () => {
  // States
  const [courses, setCourses] = useState<Course[]>()
  const [checked, setChecked] = useState<{ [key: string]: boolean }>({})
  const [submitLoading, setSubmitLoading] = useState(false)

  //Hooks
  const { organization, setOrganization } = useOrganization()
  const user = useUser()

  useEffect(() => {
    const loadOrgCourses = async () => {
      if (organization && user) {
        const { data } = await getCourses(user, organization._id)
        setCourses(data)
        data.map(course => {
          if (organization.defineCourses?.find(c => (c.id as Course)?._id === course._id)) {
            setChecked(prevState => ({
              ...prevState,
              [course._id]: true
            }))
          }
        })
      }
    }
    loadOrgCourses()
  }, [organization])

  const handleChange = (name: string) => (event: SyntheticEvent<Element, Event>, checked: boolean) => {
    setChecked(prevState => ({
      ...prevState,
      [name]: checked
    }))
  }

  const getCheckedValues = () => {
    return Object.entries(checked)
      .filter(([, value]) => value)
      .map(([key]) => ({ id: key }))
  }

  const handleSubmit = async () => {
    setSubmitLoading(true)
    const updateOrg = { ...organization }
    updateOrg.defineCourses = getCheckedValues()
    await saveOrganization(user as UserTable, updateOrg as unknown as Organization)
    setSubmitLoading(false)
    setOrganization(updateOrg as unknown as Organization)
    success('Save successful!')
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Customer courses' subheader='Select which courses to display.' />
          <CardContent>
            <FormGroup>
              {courses?.map(course => (
                <FormControlLabel
                  key={course._id}
                  value={course._id}
                  checked={checked[course._id]}
                  control={<Checkbox />}
                  label={course.title}
                  onChange={handleChange(course._id)}
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

export default CourseSettings
