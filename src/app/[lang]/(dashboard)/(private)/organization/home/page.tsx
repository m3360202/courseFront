'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import { useGlobal, useUser } from '@/hooks/useGlobal'
import { getOrganizations } from '@/api/organization/getOrganizations'
import { Organization } from '@/types/organization'
import { OrgCard } from '@/views/organization/home/OrgCard'
import BackdropLoading from '@/components/backdrop'
import { Typography } from '@mui/material'

const HomeApp = () => {
  //States
  const [organizations, setOrganizations] = useState<Organization[]>()
  const [loading, setLoading] = useState(true)

  //Hooks
  const user = useUser()

  const { setTitle } = useGlobal()

  useEffect(() => {
    setTitle('Organization')
  }, [])

  useEffect(() => {
    const loadOrganizations = async () => {
      if (user) {
        const { data } = await getOrganizations(user)
        setOrganizations(data)
        setLoading(false)
      }
    }
    loadOrganizations()
  }, [user])

  return loading ? (
    <BackdropLoading loading={loading} />
  ) : (
    <Grid container spacing={2}>
      {organizations?.length === 0 && (
        <div className='flex justify-center items-center h-[100vh] w-[100vw]'>

          <Typography>It's empty here</Typography>
        </div>
      )}
      {organizations?.map((org, index: number) => (
        <Grid xs={12} md={4} key={index} mb={4}>
          <OrgCard item={org} />
        </Grid>
      ))}
    </Grid>
  )
}

export default HomeApp
