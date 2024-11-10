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
import { Box, Button } from '@mui/material'
import { getUserSignedFile } from '@/api/organization/enrollment-policy/getUserSignedFile'
import { EnrollmentSigned } from '@/types/organization/enrollment/policy'
import { FILE_PATH } from '@/types'
import downloadFile from '@/utils/document/download'

const SignedFiles = ({ userId }: { userId: string }) => {
  //States
  const [data, setData] = useState<EnrollmentSigned[]>()

  //Hooks
  const { organizationId } = useOrganization()
  const user = useUser()

  useEffect(() => {
    const loadSignedFiles = async () => {
      if (user && organizationId && userId) {
        const { data } = await getUserSignedFile(user, organizationId, userId)
        setData(data)
      }
    }

    loadSignedFiles()
  }, [userId, organizationId, user])

  const columns: ColumnDef<TypeWithAction, any>[] = [
    {
      id: 'final',
      header: 'Signature',
      cell: ({ row }) => row.original.final
    },
    {
      id: 'view',
      header: ' ',
      cell: ({ row }) => (
        <Box display={'flex'} gap={4}>
          <Button
            onClick={() => {
              window.open(FILE_PATH + row.original.temporary, row.original.final)
            }}
          >
            View
          </Button>
          <Button
            onClick={() => {
              downloadFile(FILE_PATH + row.original.temporary, row.original.final)
            }}
          >
            Download
          </Button>
        </Box>
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

export default SignedFiles
