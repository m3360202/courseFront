'use client'

import { useGlobal } from '@/hooks/useGlobal'
import Grid from '@mui/material/Grid'
import CourseList from '@views/course/list'
import TodoList from '@views/dashboard/todo-list'
import UserInfo from '@views/dashboard/user-info'
import { useEffect } from 'react'

const Dashboard = () => {
  const source = 'dashboardPage'
  const { setSource } = useGlobal()

  useEffect(() => {
    setSource(source)
  }, [])

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} md={3}>
        <UserInfo />
      </Grid>
      <Grid item xs={12} md={9}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <TodoList source={source} hiddenActions />
          </Grid>
          <Grid item xs={12}>
            <CourseList source={source} hiddenActions />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default Dashboard
