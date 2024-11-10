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
import { Chip } from '@mui/material'
import { sessionDateTimeFormat } from '@/utils/date'
import { getAttended } from '@/api/course/session/getAttended'
import { Attended } from '@/types/course/session'

const Attendance = ({ userId }: { userId: string }) => {
  //States
  const [data, setData] = useState<Array<Attended>>()

  //Hooks
  const { organizationId } = useOrganization()
  const user = useUser()

  useEffect(() => {
    const loadAttendeds = async () => {
      if (user && organizationId && userId) {
        const { data } = await getAttended(user, userId, organizationId)
        setData(data)
      }
    }

    loadAttendeds()
  }, [userId, organizationId, user])

  const columns: ColumnDef<TypeWithAction, any>[] = [
    {
      id: 'courseTitle',
      header: 'Course Title',
      cell: ({ row }) => row.original.courseTitle
    },
    {
      id: 'lessonTitle',
      header: 'Session Title',
      cell: ({ row }) => row.original.lessonTitle
    },
    {
      id: 'lessonDate',
      header: 'Session Date',
      cell: ({ row }) => sessionDateTimeFormat(row.original.lessonDate, user?.timeZone)
    },
    {
      id: 'statusTitle',
      header: 'Status',
      cell: ({ row }) => (
        <Chip
          size='small'
          label={row.original.statusTitle}
          color={'info'}
          sx={{
            height: 20,
            fontSize: '0.875rem',
            fontWeight: 600,
            borderRadius: '5px',
            textTransform: 'capitalize',
            ml: 1,
            '& .MuiChip-label': { mt: -0.25 }
          }}
        />
      )
    }
  ]

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <ListTable tableData={data} tableColumns={columns} />
      </Grid>
    </Grid>
  )
}

export default Attendance
