'use client'

// MUI Imports
import Grid from '@mui/material/Grid'
import CourseList from '../my-space/component/Courses'
import Users from '../my-space/component/Users'

// Component Imports
import Header from '../my-space/component/Header'
import { UserType } from '@/types/organization'

const OrgHome = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Header isOrgHome />
      </Grid>
      <Grid item xs={12}>
        <CourseList />
      </Grid>
      <Grid item xs={12}>
        <Users userType={UserType.Teacher} />
      </Grid>
      <Grid item xs={12}>
        <Users userType={UserType.Student} />
      </Grid>
    </Grid>
  )
}

export default OrgHome
