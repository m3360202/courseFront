'use client'

// Components Imports
import { useCourse } from '@/hooks/useCourse'
import { useUser } from '@/hooks/useGlobal'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { getLocalizedUrl } from '@/utils/i18n'
import { Locale } from '@/configs/i18n'
import { useParams } from 'next/navigation'
import { UserTable } from '@/types/user/UserTable'
import { FormControlLabel, Grid, Switch } from '@mui/material'
import { getStudentList } from '@/api/course/getSessionStudents'
import { StatusList, Student, StudentStatusList } from '@/types/course/student'
import ListTable from '@/components/list-table'
import type { ColumnDef } from '@tanstack/react-table'
import type { TypeWithAction } from '@/components/list-table/types'
import UserAvatar from '@/components/user-avatar'
import ChangeStudentStatus from '../component/ChangeStudentStatus'
import OptionsMenu from '@core/components/option-menu'
import { OptionType } from '@/@core/components/option-menu/types'
import TargetDialog from '@/components/dialog'
import SendMail from '@/components/send-mail'
import { updateSessionStudentStatus } from '@/api/course/updateSessionStudentStatus'
import { success, error } from '@/utils/toasts'
import FilterByTag from '@/components/FilteByTag'
import Chips from '@/components/chip/Chip'

const sort = (arr: Student[] | undefined, field: keyof Student) =>
  !arr
    ? []
    : arr?.sort((a, b) => {
      if (a[field] === '') return 1 // a 是空字符串，排后面
      if (b[field] === '') return -1 // b 是空字符串，a 排前面
      if (a[field] && b[field])
        return (a[field] as string).localeCompare(b[field] as string) // 正常按字母顺序排序
      else return 0
    })

const StudentAttendance = ({
  sessionId,
  changeStatus,
  statusCountList,
  organizationId,
  setChangeStatus
}: {
  sessionId: string
  changeStatus: boolean
  organizationId?: string
  setChangeStatus: Dispatch<SetStateAction<boolean>>
  statusCountList: StatusList[] | undefined
}) => {
  //States
  const [mailOpen, setMailOpen] = useState(false)
  const [studentList, setStudentList] = useState<StudentStatusList | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [studentIds, setStudentIds] = useState<string[]>([])
  const [showRealName, setShowRealName] = useState(false)
  const [attendanceStudents, setAttendanceStudents] = useState<Student[]>()

  // Hooks
  const { lang: locale } = useParams()
  const { courseId, setBackUrl } = useCourse()
  const user = useUser()

  useEffect(() => {
    const loadStudentList = async () => {
      if (user && courseId && sessionId) {
        const { data } = await getStudentList(user, courseId, sessionId, organizationId || user?._id)
        setStudentList(data)
      }
    }
    loadStudentList()
  }, [user, courseId, sessionId, organizationId, changeStatus])

  useEffect(() => {
    const ids = (students as Student[]).map(student => student._id).filter(id => id !== undefined) as string[]
    setStudentIds(ids)
  }, [students])

  useEffect(() => {
    courseId && setBackUrl([getLocalizedUrl(`/course/${courseId}/detail/session/${sessionId}/view`, locale as Locale)])

    return () => {
      setBackUrl(null)
    }
  }, [courseId, sessionId])

  useEffect(() => {
    if (studentList && studentList.students?.length > 0) {
      if (showRealName) setAttendanceStudents(sort(studentList?.students, 'realName'))
      else setAttendanceStudents(sort(studentList?.students, 'name'))
    } else setAttendanceStudents([])
  }, [showRealName, studentList])

  const columns: ColumnDef<TypeWithAction, any>[] = [
    {
      id: showRealName ? 'realName' : 'name',
      header: 'Name',
      enableHiding: true,
      cell: ({ row }) => (
        <UserAvatar
          userImg={row.original.userImg}
          name={row.original.name}
          realName={showRealName ? row.original.realName : ''}
          email={row.original.email}
        />
      )
    },
    {
      id: 'label',
      header: 'Labels',
      cell: ({ row }) => <Chips data={row?.original.userId?.labels} />
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        return (
          <ChangeStudentStatus
            statusList={statusCountList}
            user={user as UserTable}
            courseId={courseId}
            sessionId={sessionId}
            student={row.original as Student}
            setChangeStatus={setChangeStatus}
          />
        )
      }
    }
  ]

  const handleChangeStudentStatus = async (lessonStatus: string) => {
    if (!studentIds || studentIds.length === 0) {
      error('Please select at least one student')

      return false
    }
    await updateSessionStudentStatus(user as UserTable, courseId, sessionId, {
      userId: studentIds,
      lessonStatus
    })
    setChangeStatus(true)
    success('Status changed!')
  }

  const menuOptions = () => {
    const options: OptionType[] = [
      {
        text: 'Send mail',
        menuItemProps: {
          onClick: (e: any) => {
            e.preventDefault()
            e.stopPropagation()
            setMailOpen(true)
          }
        }
      }
    ]

    if (students.length > 0) {
      options.push(
        ...[
          {
            text: 'Switch Status to Absent',
            menuItemProps: {
              onClick: async (e: any) => {
                e.preventDefault()
                e.stopPropagation()
                await handleChangeStudentStatus('hw85fda43441416a9a92eb61c136b5bc')
              }
            }
          },
          {
            text: 'Switch Status to Attended',
            menuItemProps: {
              onClick: async (e: any) => {
                e.preventDefault()
                e.stopPropagation()
                await handleChangeStudentStatus('gk85fda43441416a9a92eb61c136b5bc')
              }
            }
          },
          {
            text: 'Switch Status to Early dismissal',
            menuItemProps: {
              onClick: async (e: any) => {
                e.preventDefault()
                e.stopPropagation()
                await handleChangeStudentStatus('wt85fda43441416a9a92eb61c136b5bc')
              }
            }
          },
          {
            text: 'Switch Status to Tardy',
            menuItemProps: {
              onClick: async (e: any) => {
                e.preventDefault()
                e.stopPropagation()
                await handleChangeStudentStatus('or85fda43441416a9a92eb61c136b5bc')
              }
            }
          },
          {
            text: 'Switch Status to Leave',
            menuItemProps: {
              onClick: async (e: any) => {
                e.preventDefault()
                e.stopPropagation()
                await handleChangeStudentStatus('op85fda43441416a9a92eb61c136b5bc')
              }
            }
          }
        ]
      )
    }

    return options
  }

  const renderFilter = () => (
    <div className='flex gap-4'>
      <FilterByTag organizationId={organizationId} data={studentList?.students} setData={setAttendanceStudents} />
      <FormControlLabel
        control={
          <Switch
            value={showRealName}
            onChange={(e, c) => {
              setShowRealName(c)
              setAttendanceStudents([])
            }}
          />
        }
        label='Show Real Name'
      />
    </div>
  )

  return (
    <>
      {/* <Card sx={{ mt: 4 }}>
        <CardContent> */}
      <Grid container spacing={2} mt={4}>
        {/* <Grid item xs={12}>
          <Typography variant='h5'>Student List ({studentList?.students?.length || 0})</Typography>
        </Grid> */}
        <Grid item xs={12}>
          <ListTable
            title={renderFilter()}
            tableData={attendanceStudents}
            tableColumns={columns}
            searchTitle={`by ${showRealName ? 'Real Name' : 'UserName or NickName'}`}
            selectAll
            pagination={false}
            actionButtons={<OptionsMenu iconClassName='text-textPrimary' options={menuOptions()} />}
            handleRowSelection={(selections: TypeWithAction[]) => {
              setStudents(selections as Student[])
            }}
          />
        </Grid>
      </Grid>
      {/* </CardContent>
      </Card> */}
      <TargetDialog
        title={'Send Email'}
        width={'80%'}
        height={'80%'}
        open={mailOpen}
        setOpen={setMailOpen}
        content={
          <SendMail
            students={attendanceStudents}
            statusList={studentList?.statusCountList}
            selectValue={students}
            setOpen={setMailOpen}
          />
        }
      />
    </>
  )
}

export default StudentAttendance
