'use client'

import { OptionType } from '@/@core/components/option-menu/types'
import { getRosters } from '@/api/course/roster/getRosters'
import ListTable from '@/components/list-table'
import { TypeWithAction } from '@/components/list-table/types'
import NoWrapTitle from '@/components/title/NoWrapTitle'
import UserAvatar from '@/components/user-avatar'
import { useCourse } from '@/hooks/useCourse'
import { useDictionary } from '@/hooks/useDictionary'
import { useUser } from '@/hooks/useGlobal'
import { Student, StudentStatus } from '@/types/course/student'
import { UserTable } from '@/types/user/UserTable'
import format from '@/utils/format'
import { success } from '@/utils/toasts'
import { Button, Grid } from '@mui/material'
import type { ColumnDef, Row } from '@tanstack/react-table'
import { useEffect, useState, ReactNode, Dispatch, SetStateAction } from 'react'
import OptionsMenu from '@core/components/option-menu'
import { unRegister } from '@/api/course/roster/unRegister'
import TargetDialog from '@/components/dialog'
import UnregisteredList from './UnregisteredList'
import InviteStudent from '@/views/course/component/inviteStudent'
import { useParams, useRouter } from 'next/navigation'
import { getLocalizedUrl } from '@/utils/i18n'
import { Locale } from '@/configs/i18n'
import sendMessage from '@/utils/sendMessage'
import { Organization } from '@/types/organization'

const DialogButton = ({
  title,
  open,
  setOpen,
  status,
  children,
  toggle
}: {
  title: string
  open: boolean
  status: StudentStatus[]
  setOpen: Dispatch<SetStateAction<boolean>>
  children: ReactNode
  toggle?: () => Promise<void>
}) => (
  <TargetDialog
    title={title}
    open={open}
    setOpen={setOpen}
    content={<UnregisteredList status={status} toggle={toggle} />}
    width={'80%'}
  >
    {children}
  </TargetDialog>
)

const RosterList = ({ organization }: { organization?: Organization }) => {
  //States
  const [data, setData] = useState<Array<Student>>()
  const { courseId } = useCourse()
  const [registerLoading, setRegisterLoading] = useState<boolean>()
  const [item, setItem] = useState<Row<TypeWithAction>>()
  const [appplicantOpen, setAppplicantOpen] = useState(false)
  const [WaitingOpen, setWaitingOpen] = useState(false)
  const [payingOpen, setPayingOpen] = useState(false)
  const [inviteStudentOpen, setInviteStudentOpen] = useState<boolean>(false)
  const [loadStudents, setLoadStudents] = useState<number>(0)
  //Hooks
  const user = useUser()
  const dictionary = useDictionary()
  const { push } = useRouter()
  const { lang } = useParams()

  const loadRosters = async () => {
    if (user) {
      const { data } = await getRosters(user, courseId, 0)
      setData(data?.students || [])
    }
  }

  useEffect(() => {
    loadRosters()
  }, [user, courseId, registerLoading, loadStudents])

  const handleUnregister = async () => {
    setRegisterLoading(true)
    await unRegister(user as UserTable, courseId, item?.original.userId)
    success('Unregister successful')
    setRegisterLoading(false)
  }

  //Vars
  const menuOptions = (row: Row<TypeWithAction>) => {
    const options: OptionType[] = [
      {
        text: 'View Profile',
        menuItemProps: {
          onClick: () => {
            push(getLocalizedUrl(`/account/${row.original.userId}/profile`, lang as Locale))
          }
        }
      },
      {
        text: 'Send Message',
        menuItemProps: {
          onClick: async () => {
            await sendMessage(user as UserTable, row.original.userId, lang as Locale, push)
          }
        }
      },
      {
        text: 'Unregister',
        confirmText: 'Unregister',
        confirm: handleUnregister
      }
    ]
    setItem(row)

    return options
  }

  const columns: ColumnDef<TypeWithAction, any>[] = [
    {
      id: 'name',
      header: 'Student',
      cell: ({ row }) => (
        <UserAvatar name={row.original.name} userImg={row.original.userImg} email={row.original.email} />
      )
    },
    {
      id: 'postAt',
      header: 'Joining Time',
      cell: ({ row }) => <NoWrapTitle>{format(row.original.postAt, 'YYYY-MM-DD HH:mm:ss', false)}</NoWrapTitle>
    },

    {
      header: dictionary.common.action,
      cell: ({ row }) => <OptionsMenu iconClassName='text-textPrimary' options={menuOptions(row)} />
    }
  ]

  const actionButtons = (
    <>
      <DialogButton
        title='Appplicant List'
        open={appplicantOpen}
        setOpen={setAppplicantOpen}
        status={[StudentStatus.Active, StudentStatus.Reject]}
        toggle={loadRosters}
      >
        <Button variant='contained'>Appplicant</Button>
      </DialogButton>
      <DialogButton
        title='Waiting List'
        open={WaitingOpen}
        setOpen={setWaitingOpen}
        status={[StudentStatus.Wating]}
        toggle={loadRosters}
      >
        <Button variant='contained'>Waiting List</Button>
      </DialogButton>
      <DialogButton
        title='Paying List'
        open={payingOpen}
        setOpen={setPayingOpen}
        status={[StudentStatus.Paying]}
        toggle={loadRosters}
      >
        <Button variant='contained'>Paying List</Button>
      </DialogButton>
      <TargetDialog
        title='Invite Student'
        open={inviteStudentOpen}
        setOpen={setInviteStudentOpen}
        content={
          <InviteStudent
            setInviteStudentOpen={setInviteStudentOpen}
            organization={organization}
            setLoadStudents={setLoadStudents}
            loadStudents={loadStudents}
          />}
        width={'40%'}
      >
        <Button variant='contained'>Invite Student</Button>
      </TargetDialog>
    </>
  )

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <ListTable tableData={data} tableColumns={columns} searchTitle='Student' actionButtons={actionButtons} />
      </Grid>
    </Grid>
  )
}

export default RosterList
