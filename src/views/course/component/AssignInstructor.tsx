'use client'
// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import { LoadingButton } from '@mui/lab'
import { Autocomplete, Box, Button, Grid, TextField, Typography } from '@mui/material'

// Hook Imports
import { useCourse } from '@/hooks/useCourse'

// Third-party Imports
import { error, success } from '@/utils/toasts'
import { useOrganization } from '@/hooks/useOrganization'
import { PlatformUser, UserType } from '@/types/organization'
import { UserTable } from '@/types/user/UserTable'
import UserAvatar from '@/components/user-avatar'
import { assignCourse } from '@/api/organization/course/assignInstructor'
import { useUser } from '@/hooks/useGlobal'
import TargetDialog from '@/components/dialog'

export default function AssignInstructor({
  refresh
}: {
  refresh: (user: UserTable, couseId: string) => Promise<void>
}) {
  //States
  const { courseId } = useCourse()
  const [options, setoptions] = useState<PlatformUser[]>()
  const [loading, setLoading] = useState<boolean>(false)
  const [searchValue, setSearchValue] = useState<string>('')
  const [selectUser, setSelectUser] = useState<PlatformUser>()
  const [open, setOpen] = useState(false)

  //Hooks
  const { organization } = useOrganization()
  const user = useUser()
  const { course } = useCourse()

  const handleChange = (e: any) => {
    setSearchValue(e)
  }

  const handleOnChange = (value: PlatformUser) => {
    if (value) {
      setSelectUser(value)
    }
  }

  const onSubmit = async () => {
    try {
      setLoading(true)
      if (!selectUser) {
        setLoading(false)
        error('Please choose a Instructor!')

        return false
      }
      await assignCourse(user as UserTable, {
        courseId: courseId as string,
        userId: (selectUser?.userId as UserTable)?._id as string
      })
      success('successful!')
      setLoading(false)
      setOpen(false)
      setSelectUser(undefined)
      if (refresh) {
        await refresh(user as UserTable, courseId as string)
      }
    } catch {}
  }

  useEffect(() => {
    if (organization) setoptions(organization.platformUsers?.filter(c => c.userType === UserType.Teacher))
  }, [organization])

  useEffect(() => {
    return () => {
      setoptions([])
      setSearchValue('')
    }
  }, [])

  return (
    <TargetDialog
      title={`${course?.user ? 'Update' : 'Assign'}  Instructor`}
      open={open}
      setOpen={setOpen}
      content={
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Autocomplete
              fullWidth
              options={options || []}
              filterOptions={x =>
                x.filter((c: PlatformUser) =>
                  !searchValue
                    ? true
                    : (c.userId as UserTable)?.nickName?.includes(searchValue) ||
                      (c.userId as UserTable)?.username?.includes(searchValue)
                )
              }
              autoHighlight
              getOptionLabel={option =>
                (option.userId as UserTable)?.nickName || (option.userId as UserTable)?.username
              }
              renderOption={(props, option) => (
                <Box component='li' {...props}>
                  <UserAvatar
                    userImg={(option.userId as UserTable)?.userImg}
                    name={(option.userId as UserTable)?.nickName || (option.userId as UserTable)?.username}
                  />
                  <Typography className='ml-2'>{option?.nickName || option?.username}</Typography>
                </Box>
              )}
              renderInput={params => (
                <TextField
                  {...params}
                  label='Select Instructor'
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
              Confirm
            </LoadingButton>
          </Grid>
        </Grid>
      }
      width={'40%'}
    >
      <Button key='assign-Instructor' size='small'>
        {course?.user ? 'Update Instructor' : 'Assign Instructor'}
      </Button>
    </TargetDialog>
  )
}
