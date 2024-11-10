'use client'

// MUI Imports
import { useEffect, useState } from 'react'

import Grid from '@mui/material/Grid'

// Component Imports
import type { ColumnDef } from '@tanstack/react-table'

import ListTable from '@/components/list-table'

import type { TypeWithAction } from '@/components/list-table/types'

import { useOrganization } from '@/hooks/useOrganization'
import { useUser } from '@/hooks/useGlobal'
import { Box, Chip, Typography } from '@mui/material'
import { formatUtcDateToDateTime, sessionDateTimeFormat } from '@/utils/date'
import { getUserSurveys } from '@/api/organization/enrollment-survey/getUserSurveys'
import { LightTooltip } from '../UserList'
import TargetDialog from '@/components/dialog'
import SurveyAnswer from './SurveyAnswer'

const Surveys = ({ userId }: { userId: string }) => {
  //States
  const [data, setData] = useState<any>()
  const [open, setOpen] = useState(false)
  const [answer, setAnswer] = useState<any>()

  //Hooks
  const { organizationId } = useOrganization()
  const user = useUser()

  useEffect(() => {
    const loadSurveys = async () => {
      if (user && organizationId && userId) {
        const { data } = await getUserSurveys(user, organizationId, userId, 1, 1)
        setData(data)
      }
    }

    loadSurveys()
  }, [userId, organizationId, user])

  const columns: ColumnDef<TypeWithAction, any>[] = [
    {
      id: 'enrollmentPlan',
      header: 'Title',
      cell: ({ row }) => row.original.enrollmentPlan.title
    },
    {
      id: 'postAt',
      header: 'Submit time',
      cell: ({ row }) =>
        row.original.postAt ? formatUtcDateToDateTime(row.original.createdAt || row.original.postAt) : ''
    },
    {
      id: 'lessonDate',
      header: 'Session Date',
      cell: ({ row }) => sessionDateTimeFormat(row.original.lessonDate, user?.timeZone)
    },
    {
      id: 'status',
      header: 'Tags',
      cell: ({ row }) => {
        const labels = row.original.userInfo?.[0]?.labels || []
        const validLabels = labels.filter((label: { title: any; _id: any }) => label.title && label._id).slice(0, 4)

        return (
          <LightTooltip
            title={
              <Box width={'100%'}>
                {validLabels?.map(
                  (o: any) =>
                    o.title && (
                      <Chip
                        key={o.title}
                        size='small'
                        label={o.title}
                        color={'info'}
                        sx={{
                          height: 20,
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          borderRadius: '5px',
                          textTransform: 'capitalize',
                          '& .MuiChip-label': { mt: -0.25 },
                          mr: 10,
                          mb: 1
                        }}
                      />
                    )
                )}
              </Box>
            }
          >
            <Typography mr={4} display={'flex'} noWrap sx={{ maxWidth: '80%' }}>
              {validLabels?.map(
                (o: any) =>
                  o.title && (
                    <Chip
                      key={o.title}
                      size='small'
                      label={o.title}
                      color={'info'}
                      sx={{
                        height: 20,
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        borderRadius: '5px',
                        textTransform: 'capitalize',
                        '& .MuiChip-label': { mt: -0.25 },
                        mr: 10,
                        maxWidth: 80
                      }}
                    />
                  )
              )}
            </Typography>
          </LightTooltip>
        )
      }
    }
  ]

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <ListTable
          tableData={data}
          tableColumns={columns}
          handleRowClick={row => {
            setOpen(true)
            setAnswer(row)
          }}
        />
      </Grid>
      <TargetDialog
        title='Enrollment Survey answer'
        open={open}
        setOpen={setOpen}
        content={<SurveyAnswer answer={answer} />}
      />
    </Grid>
  )
}

export default Surveys
