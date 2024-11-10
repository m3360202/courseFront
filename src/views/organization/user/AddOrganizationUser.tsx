'use client'
// React Imports
import { SyntheticEvent, useEffect, useState } from 'react'

// MUI Imports
import { LoadingButton } from '@mui/lab'
import { Autocomplete, Box, Button, Checkbox, FormControlLabel, FormGroup, Grid, TextField } from '@mui/material'

// Api Imports
import { fetchUserByCode } from '@/api/course/roster/fetchUserByCode'
import { error } from '@/utils/toasts'
import TargetDialog from '@/components/dialog'
import { UserTable } from '@/types/user/UserTable'
import UserAvatar from '@/components/user-avatar'
import OrganizationRole from '@/types/organization/organizationRole'
import { addOrganizationUser } from '@/api/organization/user/addOrganizationUser'
import { useUser } from '@/hooks/useGlobal'
import { useOrganization } from '@/hooks/useOrganization'
import { UserType } from '@/types/organization'
import { convertOrganizationUserType } from '@/utils/organization'

const roleData = [
  { title: 'Manage platform information permissions', value: OrganizationRole.Information },
  { title: 'Manage platform personnel permissions', value: OrganizationRole.User },
  { title: 'Manage platform course permissions', value: OrganizationRole.Course },
  { title: 'Manage platform mail permissions', value: OrganizationRole.Mail }
]

export default function AddOrganizationUser({
  userType,
  refresh
}: {
  userType: UserType
  refresh: () => Promise<void>
}) {
  //State
  const [options, setoptions] = useState<UserTable[]>([])
  const [addLoading, setAddLoading] = useState<boolean>(false)
  const [searchValue, setSearchValue] = useState<string>('')
  const [selectUser, setSelectUser] = useState<UserTable | null>(null)
  const [open, setOpen] = useState(false)
  const [roles, setRoles] = useState<{ [key: number]: boolean }>({})

  //Hooks
  const user = useUser()
  const { organizationId } = useOrganization()

  //var
  const type = convertOrganizationUserType(userType)
  const handleChange = (e: string) => {
    setSearchValue(e)
  }

  const handleRoleChange = (name: number) => (event: SyntheticEvent<Element, Event>, checked: boolean) => {
    setRoles(prevState => ({
      ...prevState,
      [name]: checked
    }))
  }

  const handleOnChange = (value: UserTable | null) => {
    setSelectUser(value)
  }

  useEffect(() => {
    const fetchUserList = async () => {
      if (searchValue) {
        const resultUserList = await fetchUserByCode(searchValue)
        if (resultUserList && resultUserList.data && resultUserList.data.length > 0) {
          setoptions(resultUserList.data)
        }
      }
    }
    fetchUserList()
  }, [searchValue])

  useEffect(() => {
    return () => {
      setoptions([])
      setSearchValue('')
    }
  }, [])

  const getCheckedValues = () => {
    return Object.entries(roles)
      .filter(([, value]) => value)
      .map(([key]) => parseInt(key))
  }

  const handleAdd = async () => {
    const orgRoles = getCheckedValues()
    if (!selectUser) {
      error('Please select user!')

      return
    }
    if ((!orgRoles || orgRoles.length === 0) && userType === UserType.PlatformAdmin) {
      error('Please select user role!')

      return
    }
    setAddLoading(true)
    const { message, success } = await addOrganizationUser(
      user as UserTable,
      organizationId,
      selectUser?._id as string,
      userType,
      orgRoles
    )
    if (!success && message) {
      error(message)
      setAddLoading(false)

      return
    }
    setOpen(false)
    setAddLoading(false)
    setSelectUser(null)
    await refresh()
  }

  return (
    <TargetDialog
      title={`Add ${type} Account`}
      open={open}
      setOpen={setOpen}
      content={
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Autocomplete
              fullWidth
              options={options}
              filterOptions={(x: UserTable[]) =>
                x.filter(c => (!searchValue ? false : c?.username === searchValue || c?.email === searchValue))
              }
              autoHighlight
              //@ts-ignore
              getOptionLabel={option => option.nickName || option.username}
              renderOption={(props, option) => (
                <Box component='li' {...props}>
                  <UserAvatar userImg={option.userImg} name={option?.nickName || option?.username} />
                </Box>
              )}
              renderInput={params => (
                <TextField
                  {...params}
                  label='Input username or email'
                  onChange={e => {
                    handleChange(e.target.value)
                  }}
                  inputProps={{
                    ...params.inputProps
                    //autoComplete: 'new-password' // disable autocomplete and autofill
                  }}
                />
              )}
              onChange={(e: SyntheticEvent<Element, Event>, value: UserTable | null) => {
                handleOnChange(value)
              }}
            />
          </Grid>
          {userType === UserType.PlatformAdmin && (
            <Grid item xs={12}>
              <FormGroup>
                {roleData?.map(role => (
                  <FormControlLabel
                    key={role.value}
                    value={role.value}
                    checked={roles[role.value]}
                    control={<Checkbox />}
                    label={role.title}
                    onChange={handleRoleChange(role.value)}
                  />
                ))}
              </FormGroup>
            </Grid>
          )}
        </Grid>
      }
      actions={
        <>
          <Button
            onClick={() => {
              setOpen(false)
            }}
            variant='outlined'
            color='secondary'
          >
            Cancel
          </Button>
          <LoadingButton variant='contained' loading={addLoading} onClick={handleAdd}>
            Confirm
          </LoadingButton>
        </>
      }
    >
      <Button variant='contained'>Add {type}</Button>
    </TargetDialog>
  )
}
