'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import {
  Autocomplete,
  Box,
  Select,
  TextField,
  Tooltip,
  TooltipProps,
  Typography,
  styled,
  tooltipClasses
} from '@mui/material'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import { LoadingButton } from '@mui/lab'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// Types Imports
import type { ColumnDef, Row } from '@tanstack/react-table'
import type { TypeWithAction } from '@/components/list-table/types'
import { PlatformUser, UserType } from '@/types/organization'
import { UserTable } from '@/types/user/UserTable'
import { Course } from '@/types/course'

// Hooks Imports
import { useOrganization, useOrganizationManager } from '@/hooks/useOrganization'
import { useUser } from '@/hooks/useGlobal'
import { useListTable } from '@/hooks/useListTable'

// Api Imports
import { getOrganizationUsers } from '@/api/organization/getOrganizationUser'
import { getCourses } from '@/api/course/getCourses'
import { addStudent } from '@/api/course/addStudent'
import { getEnrollmentAnswers } from '@/api/organization/enrollment-survey/getEnrollmentSurveys'

// Component Imports
import ListTable from '@/components/list-table'
import UserAvatar from '@/components/user-avatar'
import { formatUtcDateToDateTime } from '@/utils/date'
import PermissionButton from '@/components/buttons/PermissionButton'
import AddOrganizationUser from './AddOrganizationUser'
import OptionsMenu from '@core/components/option-menu'
import { deleteOrganizationUser } from '@/api/organization/user/deleteOrganizationUser'
import { getLocalizedUrl } from '@/utils/i18n'
import { Locale } from '@/configs/i18n'
import TargetDialog from '@/components/dialog'
import { error, success } from '@/utils/toasts'
import * as XLSX from 'xlsx'
import SendOrgMail from '@/components/send-mail/SendOrgMail'
import FilterByTag from '@/components/FilteByTag'
import Chips from '@/components/chip/Chip'

export const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.white,
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: theme.shadows[1],
    fontSize: 11
  }
}))

const UserList = ({ userType }: { userType: UserType }) => {
  //States
  const [data, setData] = useState<Array<PlatformUser>>()
  const [filteredData, setFilteredData] = useState<Array<PlatformUser>>()
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [selected, setSelected] = useState<PlatformUser[]>()
  const [assignOpen, setAssignOpen] = useState(false)
  const [courses, setCourses] = useState<Course[]>()
  const [searchCourseValue, setSearchCourseValue] = useState<string[]>()
  const [selectCourse, setSelectCourse] = useState<Course>()
  const [assignLoading, setAssignLoading] = useState(false)
  const [emailOpen, setEmailOpen] = useState(false)
  const [exportAllLoading, setExportAllLoading] = useState(false)
  //Hooks
  const { organizationId, setBackUrl, setTitle, organization } = useOrganization()
  const user = useUser()
  const isManager = useOrganizationManager()
  const { lang: locale } = useParams()
  const { push } = useRouter()
  const { pageIndex, pageSize, searchValue, rowSelectionData, setTotal } = useListTable()

  const loadUsers = async () => {
    if (user && organizationId && userType) {
      setFilteredData(undefined)
      const { data: result } = await getOrganizationUsers(
        user,
        organizationId,
        userType,
        pageIndex,
        pageSize,
        searchValue
      )
      if (result) {
        let filterData: Array<PlatformUser> = []
        if (type === 'Manager') {
          filterData?.push({
            userType: UserType.PlatformAdmin,
            userId: organization?.userId,
            state: 1
          } as unknown as PlatformUser)
        }
        filterData = filterData.concat(result.platformUsers || [])
        setData(filterData)
        setFilteredData(filterData)
        setTotal(result.total)
      }
    }
  }

  const exportAll = async () => {
    setExportAllLoading(true)
    if (user && organizationId && userType) {
      const { data: result } = await getOrganizationUsers(
        user,
        organizationId,
        userType,
        0,
        999,
        searchValue
      )
      if (result && result.platformUsers) {
        if (Array.isArray(result.platformUsers)) {
          await download(result.platformUsers as PlatformUser[])
        }
        setExportAllLoading(false)
      }
    }
  }

  const loadCourses = async () => {
    if (user && organizationId) {
      const { data } = await getCourses(user, organizationId)
      setCourses(data)
    }
  }

  useEffect(() => {
    loadUsers()
    if (userType === UserType.Student) {
      if (organizationId) loadCourses()
    }
  }, [userType, organizationId, user, deleteLoading, organizationId, pageIndex, pageSize, searchValue])

  useEffect(() => {
    if (rowSelectionData) {
      const arrays = Object.values(rowSelectionData)
      const nonEmptyArrays = arrays.filter(array => array.length > 0)
      const combinedArray = nonEmptyArrays.reduce((acc, currentArray) => acc.concat(currentArray), [])
      setSelected(combinedArray)
    }
  }, [rowSelectionData])

  //var
  const type =
    userType === UserType.PlatformAdmin ? 'Manager' : userType === UserType.Student ? 'Student' : 'Instructor'

  const columns: ColumnDef<TypeWithAction, any>[] = [
    {
      id: 'name',
      header: 'User',
      cell: ({ row }) => (
        <>
          <UserAvatar
            userImg={row.original.userId?.userImg}
            name={row.original.userId?.nickName || row.original.userId?.username}
          />
        </>
      )
    },
    {
      id: 'firstName',
      header: 'FirstName',
      cell: ({ row }) => row.original.userId?.collects?.[0]?.firstName
    },
    {
      id: 'lastName',
      header: 'LastName',
      cell: ({ row }) => row.original.userId?.collects?.[0]?.lastName
    },
    {
      id: 'payment',
      header: 'Payments',
      cell: ({ row }) => (
        <span style={{ color: '#1976d2' }}>${row?.original.feeSum > 0 ? row?.original.feeSum / 100 : 0}</span>
      )
    },
    {
      id: 'label',
      header: 'Labels',
      cell: ({ row }) => userType === UserType.Student && <Chips data={row?.original.userId?.labels} />
    },
    {
      id: 'joinTime',
      header: 'JoinTime',
      cell: ({ row }) => formatUtcDateToDateTime(row?.original.postAt)
    },
    {
      header: ' ',
      cell: ({ row }) => <OptionsMenu iconClassName='text-textPrimary' options={menuOptions(row)} />
    }
  ]

  const menuOptions = (row: Row<TypeWithAction>) => {
    if (
      row.original.userId?._id === (organization?.userId as UserTable)?._id ||
      row.original.userId?._id === (organization?.postedByUser as UserTable)?._id
    )
      return null

    return [
      {
        text: 'Delete',
        confirmText: 'Delete',
        confirm: async () => {
          await handleDelete(row.original.userId?._id)
        }
      }
    ]
  }

  const actionOptions = () => {
    const allOptions = [
      {
        text: 'Assign course',
        menuItemProps: {
          onClick: () => {
            setAssignOpen(true)
          }
        }
      },
      {
        text: 'Export ALL',
        menuItemProps: {
          onClick: async () => {
            exportAll()
          }
        }
      },
      {
        text: 'Send email',
        menuItemProps: {
          onClick: async () => {
            setEmailOpen(true)
          }
        }
      }
    ]

    return userType === UserType.Student ? allOptions : allOptions.filter(option => option.text === 'Send email')
  }

  const actionButtons = (
    <>
      {
        <>
          <PermissionButton variant='contained' isShow={isManager}>
            <AddOrganizationUser userType={userType} refresh={loadUsers} />
          </PermissionButton>
          {selected && selected.length > 0 && type === 'Student' && (
            <PermissionButton variant='contained' isShow={isManager}>
              <LoadingButton loading={exportAllLoading} variant='contained' onClick={async () => { await download(selected as PlatformUser[]) }}>
                Export
              </LoadingButton>
            </PermissionButton>
          )}
        </>
      }
      {selected && selected.length > 0 && <OptionsMenu iconClassName='text-textPrimary' options={actionOptions()} />}
    </>
  )

  const handleDelete = async (userId: string) => {
    setDeleteLoading(true)
    await deleteOrganizationUser(user as UserTable, organizationId, userId)
    setDeleteLoading(false)
  }

  const handleRowClick = (row: TypeWithAction) => {
    setTitle(type)
    setBackUrl([getLocalizedUrl(`/organization/${organizationId}/detail/user/${type.toLowerCase()}`, locale as Locale)])
    push(
      getLocalizedUrl(
        `/organization/${organizationId}/detail/user/${type.toLowerCase()}/${row.userId?._id}`,
        locale as Locale
      )
    )
  }

  const rendFilter = () => {
    if (userType !== UserType.Student) return undefined

    return (
      <div className='flex gap-4'>
        <FilterByTag organizationId={organizationId} data={data} setData={setFilteredData} />

        <Select
          className='w-[110px]'
          defaultValue='All'
          onChange={e => {
            switch (e.target.value) {
              case 'All':
                setFilteredData(data)
                break
              case 'Paid':
                setFilteredData(data?.filter(c => c.feeSum > 0))
                break
              case 'UnPaid':
                setFilteredData(data?.filter(c => !c.feeSum))
                break
            }
          }}
        >
          <MenuItem value='All'>All</MenuItem>
          <MenuItem value='Paid'>Paid</MenuItem>
          <MenuItem value='UnPaid'>UnPaid</MenuItem>
        </Select>
      </div>
    )
  }

  const handleAssignCourse = async () => {
    if (!selectCourse) {
      error('Please select course!')

      return
    }
    if (!selected || selected.length === 0) {
      error('Please select student!')

      return
    }
    if (
      selectCourse.students &&
      selectCourse.capacity &&
      selectCourse.capacity < selected.length + selectCourse.students?.length
    ) {
      error('This course has reached its max capacity')

      return
    }
    setAssignLoading(true)
    await addStudent(
      user as UserTable,
      selectCourse as Course,
      selected?.map(item => ({ userId: (item.userId as UserTable)?._id, code: (item.userId as UserTable)?.code }))
    )
    success('Arranged!')
    setAssignOpen(false)
    setSelectCourse(undefined)
    setAssignLoading(false)
  }

  const download = async (selected: PlatformUser[]) => {
    if (!selected || selected.length === 0) return
    const existingStudentUserIds = selected.map(s => (s.userId as UserTable)?._id)
    const platformUsers =
      filteredData && filteredData.length > 0
        ? filteredData.filter(user => {
          return existingStudentUserIds?.includes((user.userId as UserTable)?._id)
        })
        : []
    if (platformUsers && platformUsers.length > 0) {
      //deal with platform user
      const headerUserInfo = [
        'Order',
        'Student Username',
        'Student First Name',
        'Student last name',
        'Student id',
        'Student email',
        'Student phone number',
        'City',
        'Parent1 Name',
        'Parent1 Email',
        'Parent1 Phone Number',
        'Parent2 Name',
        'Parent2 Email',
        'Parent2 Phone Number',
        'Enrollment survey1',
        'Enrollment survey2',
        'Enrollment survey3',
        'Payment Amount'
      ]
      const userInfoData: any[] = []
      platformUsers.forEach((user: any, index: number) => {
        const collect: any = user.collect ?? {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          city: '',
          parentFirstName: '',
          parentLastName: '',
          parentEmail: '',
          parentPhone: '',
          parent1FirstName: '',
          parent1LastName: '',
          parent1Email: '',
          parent1Phone: ''
        }
        const data = {
          Order: index + 1,
          'Student Username': user?.userId?.username,
          'Student First Name': collect.firstName ?? '',
          'Student last name': collect.lastName ?? '',
          'Student id': user.userId?.code,
          'Student email': collect.email ?? '',
          'Student phone number': collect.phone ?? '',
          City: collect.city ?? '',
          'Parent1 Name': collect.parentFirstName + ' ' + collect.parentLastName,
          'Parent1 Email': collect.parentEmail,
          'Parent1 Phone Number': collect.parentPhone,
          'Parent2 Name': collect.parent1FirstName + ' ' + collect.parent1LastName,
          'Parent2 Email': collect.parent1Email,
          'Parent2 Phone Number': collect.parent1Phone,
          'Payment Amount': user?.feeSum
        }
        userInfoData.push(data)
      })
      const wb = XLSX.utils.book_new()
      // StudentInfo create excel sheet
      const wsInfo = XLSX.utils.aoa_to_sheet([headerUserInfo])
      XLSX.utils.sheet_add_json(wsInfo, userInfoData, { origin: 'A2', skipHeader: true })
      XLSX.utils.book_append_sheet(wb, wsInfo, 'StudentInfo')

      //enrollmentSurvey data sheet
      const userIds = platformUsers.map(s => (s.userId as UserTable)?._id)
      const getAnswerResult: any = await getEnrollmentAnswers(user as UserTable, organizationId as string, userIds)
      if (getAnswerResult && getAnswerResult.data && getAnswerResult.data.length > 0) {
        getAnswerResult.data.forEach((item: any) => {
          const header = item.header
          const data = item.data
          if (data && data.length > 0) {
            //添加到sheet
            const wsInfo = XLSX.utils.aoa_to_sheet([header])
            XLSX.utils.sheet_add_json(wsInfo, data, { origin: 'A2', skipHeader: true })
            XLSX.utils.book_append_sheet(wb, wsInfo, item.title)
          }
        })
      }

      //download excel
      XLSX.writeFile(wb, 'xtatics-students-infomation.xlsx')
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <ListTable
          title={rendFilter()}
          tableData={filteredData}
          tableColumns={columns}
          searchTitle='User'
          actionButtons={actionButtons}
          realPage
          handleRowClick={handleRowClick}
          selectAll={true}
        />
      </Grid>
      <TargetDialog
        title='Assign courses'
        width={'70%'}
        open={assignOpen}
        setOpen={setAssignOpen}
        content={
          <div className='flex flex-col gap-10'>
            <Autocomplete
              fullWidth
              options={
                courses?.filter(
                  c =>
                    !c.capacity ||
                    (c.capacity &&
                      (!c.students || c.students.length === 0 || (c.students && c.capacity > c.students?.length)))
                ) || []
              }
              filterOptions={(x: any[]) =>
                x.filter((c: { title: string; labels: any[] }) =>
                  !searchCourseValue
                    ? true
                    : searchCourseValue.some((k: string) => c.title.toLowerCase().includes(k.toLowerCase())) ||
                    searchCourseValue.every((tag: string) =>
                      c.labels?.some((t: { title: string }) => t.title.toLowerCase().includes(tag.toLowerCase()))
                    )
                )
              }
              autoHighlight
              disableCloseOnSelect={false}
              getOptionLabel={(option: Course) => option.title}
              renderOption={(
                props: any,
                option: {
                  user: { userImg: string; username: string; nickName: string }
                  title: any
                  labels: any[]
                  students: string | any[]
                  capacity: any
                }
              ) => (
                <Box width={'100%'} component='li' {...props} display={'flex'} justifyContent={'space-between'}>
                  <Box width={'50%'} display={'flex'} gap={2} alignItems={'center'}>
                    <UserAvatar
                      userImg={option.user?.userImg}
                      name={option.user?.nickName || option.user?.username}
                      hiddenName
                    />
                    {option.title}
                  </Box>
                  <Box width={'30%'} display={'flex'}>
                    <Chips data={option?.labels} />
                  </Box>
                  <Typography>
                    Class Capacity:{option.students?.length || 0}/{option.capacity}
                  </Typography>
                </Box>
              )}
              renderInput={(params: any) => (
                <TextField
                  {...params}
                  label='Search by title or tag'
                  placeholder={`To search using multiple tags, please use ";" to separate the tags`}
                  inputProps={{
                    ...params.inputProps
                    //autoComplete: 'new-password' // disable autocomplete and autofill
                  }}
                  onChange={(e: { target: { value: string } }) => {
                    setSearchCourseValue(e.target.value?.split(';') || [])
                  }}
                />
              )}
              onChange={(e: any, value: Course) => {
                setSelectCourse(value)
              }}
            />
            <div className=' text-center'>
              <LoadingButton variant='contained' loading={assignLoading} onClick={handleAssignCourse}>
                Confirm
              </LoadingButton>
            </div>
          </div>
        }
      />
      <TargetDialog
        title='Send mail'
        width={'70%'}
        open={emailOpen}
        setOpen={setEmailOpen}
        content={<SendOrgMail selectValue={selected?.map(u => u.userId as UserTable)} />}
      />
    </Grid>
  )
}

export default UserList
