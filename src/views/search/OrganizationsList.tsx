'use client'

// React Imports
import React, { useState, useEffect } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Pagination from '@mui/material/Pagination'
import Box from '@mui/material/Box'

// Type Imports
import type { Organization } from '@/types/organization'
import type { Locale } from '@configs/i18n'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import UserAvatar from '@components/user-avatar'

// Style Imports

type Props = {
  organizations: Organization[]
}

const OrganizationsList = ({ organizations }: Props) => {
  // States
  const [filteredOrganizations, setFilteredOrganizations] = useState<Organization[]>([])
  const [activePage, setActivePage] = useState(1)

  // Hooks
  const { lang: locale } = useParams()

  useEffect(() => {
    const newData = organizations

    if (activePage > Math.ceil(newData.length / 6)) {
      setActivePage(1)
    }

    setFilteredOrganizations(newData)
  }, [activePage, organizations])

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setActivePage(page)
  }

  return (
    <Card>
      <CardContent className='flex flex-col gap-6'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div>
            <Typography variant='h5'>Organizations</Typography>
            <Typography>Total {organizations.length} organizations found</Typography>
          </div>
        </div>

        {filteredOrganizations.length > 0 ? (
          <Grid container spacing={6}>
            {filteredOrganizations.slice((activePage - 1) * 6, activePage * 6).map(item => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <div className='border rounded-lg'>
                  <div className='flex flex-col gap-4 p-5'>
                    <div className='flex gap-10 justify-start'>
                      <UserAvatar userImg={item.img} name={item.name} hiddenName size={150} />
                      <div className='flex flex-col gap-1 mt-4'>
                        <Typography variant='h6'>{item.name}</Typography>
                        <Typography display={'flex'} gap={1}>
                          <i className='ri-group-line' />
                          {item.platformUsers && item.platformUsers.length > 0 ? item.platformUsers.length + 1 : 0}
                        </Typography>
                      </div>
                    </div>
                    <Button
                      color='primary'
                      variant='outlined'
                      component={Link}
                      target='_blank'
                      href={getLocalizedUrl(`/organization/${item._id}/main`, locale as Locale)}
                    >
                      View organization
                    </Button>
                  </div>
                </div>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography className='text-center'>No organizations found.</Typography>
        )}

        {filteredOrganizations.length > 6 && (
          <Box className='flex justify-center mt-6'>
            <Pagination
              count={Math.ceil(filteredOrganizations.length / 6)}
              page={activePage}
              showFirstButton
              showLastButton
              color='primary'
              onChange={handlePageChange}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default OrganizationsList
