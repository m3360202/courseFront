'use client'
// React Imports
import { SyntheticEvent, useEffect, useState } from 'react'

// MUI Imports
import { LoadingButton } from '@mui/lab'
import { Autocomplete, Box, Grid, TextField, Typography } from '@mui/material'

// Api Imports
import { fetchUserByCode } from '@/api/course/roster/fetchUserByCode'
import { inviteStudent } from '@/api/course/roster/inviteStudent'

// Hook Imports
import { useCourse } from '@/hooks/useCourse'
import { useDictionary } from '@/hooks/useDictionary'

// Third-party Imports
import { error, success } from '@/utils/toasts'
import { Organization, UserType } from '@/types/organization'
import UserAvatar from '@/components/user-avatar'
import { UserTable } from '@/types/user/UserTable'

export default function InviteStudent({
  setInviteStudentOpen,
  loadStudents,
  setLoadStudents,
  organization
}: {
  setInviteStudentOpen: (newValue: boolean) => void,
  loadStudents: number,
  setLoadStudents: (newValue: number) => void,
  organization?: Organization,

}) {
  //state hooks
  const { courseId } = useCourse()
  const dictionary = useDictionary()
  const [options, setoptions] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [searchValue, setSearchValue] = useState<string>('')
  const [selectUser, setSelectUser] = useState<any>(null)
  const [feachLoading, setFeachLoading] = useState(false)

  const handleChange = (e: any) => {
    setSearchValue(e)
  }

  const handleOnChange = (value: any) => {
    if (value && value.length > 0) {
      setSelectUser(value)
    }
  }

  const onSubmit = async () => {
    try {
      setLoading(true)
      if (!selectUser) {
        setLoading(false)
        error('Please choose a student!')

        return false
      }
      const result: any = await inviteStudent({
        _id: courseId,
        code: selectUser.map((c: any) => c.code).join(';'),
        userId: selectUser._id,
        instructorId: organization?._id
      })
      if (result && result.success) {
        if (organization) {
          success(dictionary.course.inviteOrgUserSuccess)
          setLoadStudents(loadStudents + 1)
        } else {
          success(dictionary.course.inviteSuccess)
        }
        setInviteStudentOpen(false)
      } else {
        error(result.message)
      }
      setLoading(false)
    } catch { }
  }

  async function fetchUserList(inputValue: string) {
    setFeachLoading(true);
    const resultUserList = await fetchUserByCode(inputValue);
    if (resultUserList && resultUserList.data && resultUserList.data.length > 0) {
      setoptions(resultUserList.data);
    }
    setFeachLoading(false);
  }

  useEffect(() => {
    if (organization)
      setoptions(
        organization.platformUsers
          ?.filter(c => c.userType === UserType.Student)
          ?.map(u => ({
            _id: (u.userId as UserTable)?._id,
            code: (u.userId as UserTable)?.code,
            userImg: (u.userId as UserTable)?.userImg,
            nickName: (u.userId as UserTable)?.nickName,
            username: (u.userId as UserTable)?.username,
            email: (u.userId as UserTable)?.email
          })) as any[]
      )
  }, [organization])

  useEffect(() => {
    return () => {
      setoptions([])
      setSearchValue('')
    }
  }, [])

  const handleInputChange = async (event: SyntheticEvent<Element, Event>, newValue: string) => {
    if (!organization) await fetchUserList(newValue)
  }

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Autocomplete
          fullWidth
          loading={feachLoading}
          options={options}
          multiple
          filterOptions={x =>
            x.filter(c =>
              !searchValue
                ? true
                : c?.code?.includes(searchValue) ||
                c?.username?.includes(searchValue) ||
                c?.nickName?.includes(searchValue) ||
                c?.email?.includes(searchValue)
            )
          }
          autoHighlight
          getOptionLabel={option => option.nickName || option.username}
          onInputChange={handleInputChange}
          noOptionsText={<Typography>No options</Typography>}
          renderOption={(props, option) => (
            <Box component='li' {...props}>
              <UserAvatar userImg={option.userImg} name={option.nickName || option.username} />
            </Box>
          )}
          renderInput={params => (
            <TextField
              {...params}
              label={organization ? 'Select user' : 'Input userId'}
              onChange={e => {
                handleChange(e.target.value)
              }}
              inputProps={{
                ...params.inputProps
                //autoComplete: 'new-password' // disable autocomplete and autofill
              }}
            />
          )}
          onChange={(e: any, value: any) => {
            handleOnChange(value)
          }}
        />
      </Grid>

      <Grid item xs={12} textAlign={'center'}>
        <LoadingButton loading={loading} variant='contained' onClick={onSubmit} sx={{ width: '50%' }}>
          Invite
        </LoadingButton>
      </Grid>
    </Grid>
  )
}
