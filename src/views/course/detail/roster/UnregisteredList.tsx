'use client'

import { getRosters } from '@/api/course/roster/getRosters'
import ConfirmDialog from '@/components/confirm'
import ListTable from '@/components/list-table'
import { TypeWithAction } from '@/components/list-table/types'
import UserAvatar from '@/components/user-avatar'
import { useCourse } from '@/hooks/useCourse'
import { useDictionary } from '@/hooks/useDictionary'
import { useUser } from '@/hooks/useGlobal'
import { Student, StudentStatus } from '@/types/course/student'
import { UserTable } from '@/types/user/UserTable'
import { success } from '@/utils/toasts'
import { Button, Chip, Grid } from '@mui/material'
import type { ColumnDef } from '@tanstack/react-table'
import { useEffect, useState } from 'react'
import { unRegister } from '@/api/course/roster/unRegister'
import { updateStudentStatus } from '@/api/course/roster/updateStudentStatus'
import getStatusChipColor from '@/utils/course/getStatusChipColor'

const UnregisteredList = ({ status, toggle }: { status: StudentStatus[]; toggle?: () => Promise<void> }) => {
  //States
  const [data, setData] = useState<Array<Student>>()
  const { courseId } = useCourse()
  const [registerLoading, setRegisterLoading] = useState<boolean>()
  const [rejectLoading, setRejectLoading] = useState<boolean>()
  const [acceptLoading, setAcceptLoading] = useState<boolean>()

  //Hooks
  const user = useUser()
  const dictionary = useDictionary()

  useEffect(() => {
    const loadRosters = async () => {
      if (user) {
        const { data } = await getRosters(user, courseId, 1)
        const filterData = data?.students?.filter(c => status.includes(c.status as StudentStatus)) || []
        setData(filterData)
      }
    }
    loadRosters()
  }, [user, courseId, registerLoading, rejectLoading, acceptLoading])

  const handleUnregister = async (userId: string) => {
    setRegisterLoading(true)
    await unRegister(user as UserTable, courseId, userId)
    success('Unregister successful')
    setRegisterLoading(false)
  }

  const reject = async (userId: string) => {
    setRejectLoading(true)
    await updateStudentStatus(user as UserTable, courseId, userId, StudentStatus.Reject)
    success('Unregister successful')
    setRejectLoading(false)
    toggle && (await toggle())
  }

  const accept = async (userId: string) => {
    setAcceptLoading(true)
    await updateStudentStatus(user as UserTable, courseId, userId, StudentStatus.Accept)
    success('Unregister successful')
    setAcceptLoading(false)
    toggle && (await toggle())
  }

  const getColButton = (row: TypeWithAction) => {
    if (row.status === StudentStatus.Reject) return <></>
    else if (row.applyType === 0)
      return (
        <ConfirmDialog
          title='Withdraw invitation'
          confirm={async () => {
            await handleUnregister(row.userId)
          }}
        >
          <Button color='error' variant='outlined'>
            Withdraw invitation
          </Button>
        </ConfirmDialog>
      )
    else if (row.applyType === 1 && row.status === StudentStatus.Paying)
      return (
        <ConfirmDialog
          title='Kick out'
          confirm={async () => {
            await handleUnregister(row.userId)
          }}
        >
          <Button color='error' variant='outlined'>
            Kick out
          </Button>
        </ConfirmDialog>
      )
    else if (row.applyType === 1 && row.status !== StudentStatus.Paying)
      return (
        <div className='flex gap-4'>
          <ConfirmDialog
            title='Reject'
            confirm={async () => {
              await reject(row.userId)
            }}
          >
            <Button color='error' variant='outlined'>
              Reject
            </Button>
          </ConfirmDialog>
          <ConfirmDialog
            title='Accept'
            confirm={async () => {
              await accept(row.userId)
            }}
          >
            <Button color='success' variant='outlined'>
              Accept
            </Button>
          </ConfirmDialog>
        </div>
      )
    else <></>
  }

  const columns: ColumnDef<TypeWithAction, any>[] = [
    {
      id: 'name',
      header: 'Student',
      cell: ({ row }) => <UserAvatar name={row.original.name} userImg={row.original.userImg} email={row.original.email} />
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const statusChip = getStatusChipColor(row.original.status)

        return (
          <Chip variant='tonal' label={statusChip.label} size='small' color={statusChip.color} className='capitalize' />
        )
      }
    },

    {
      header: dictionary.common.action,
      cell: ({ row }) => getColButton(row.original)
    }
  ]

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <ListTable tableData={data} tableColumns={columns} searchTitle='Student' noCard />
      </Grid>
    </Grid>
  )
}

export default UnregisteredList
