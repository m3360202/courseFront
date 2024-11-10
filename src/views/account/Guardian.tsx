'use client'

// React Imports
import { useEffect, useState, useRef } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import { Box, TextField } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'

// Component Imports
import ListTable from '@/components/list-table'
import NoWrapTitle from '@/components/title/NoWrapTitle'
import CustomChip from '@/components/chip'
import OptionsMenu from '@core/components/option-menu'
import { OptionType } from '@/@core/components/option-menu/types'
import PermissionButton from '@/components/buttons/PermissionButton'
import { error, success } from '@/utils/toasts'
import TargetDialog from '@/components/dialog'

// Hooks Imports
import { useDictionary } from '@/hooks/useDictionary'
import { useUser, useStudent } from '@/hooks/useGlobal'

// Api Imports
import { addGuradian, getGuradians, deleteGuradian } from '@/api/user/profile/guardian'
import { getUsersByNameOrEmail } from '@/api/user/profile/getUserByNameOrEmail'

// Type Imports
import type { UserTable } from '@/types/user/UserTable'
import type { ColumnDef, Row } from '@tanstack/react-table'
import type { TypeWithAction } from '@/components/list-table/types'

const Guardian = ({ isParent, isViewMode }: { isParent?: boolean; isViewMode?: boolean }) => {
  //States
  const [data, setData] = useState<any[]>([])
  const inputValue = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  //Hooks
  const user = useUser()
  const isStudent = useStudent()

  const getGuardianChipTitle = (state: number) => {
    switch (state) {
      case 0:
        return 'Pending'
      case 1:
        return 'Guarded'
      case 2:
        return 'Failed'
      default:
        return ''
    }
  }

  const renderGuardianState = (state: number) => (
    <CustomChip
      skin='light'
      size='small'
      label={getGuardianChipTitle(state)}
      color={state === 1 ? 'success' : 'error'}
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

  const loadGuardian = async () => {
    if (user) {
      setLoading(true)
      const data = await getGuradians(user, isStudent)
      let filterData = data?.data
      if (isParent === true) filterData = data?.data?.filter(c => c.userId !== user._id)
      else if (isParent === false) filterData = data?.data?.filter(c => c.userId === user._id)
      setData(filterData)
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGuardian()
  }, [user])

  //Vars
  const dictionary = useDictionary()

  const columns: ColumnDef<TypeWithAction, any>[] = [
    {
      id: 'name',
      header: dictionary.account.guardian.name,
      cell: ({ row }) => (
        <NoWrapTitle>{row.original.userId !== user?._id ? row.original.name : row.original.childName}</NoWrapTitle>
      )
    },
    {
      id: 'email',
      header: dictionary.account.guardian.email,
      cell: ({ row }) => (
        <NoWrapTitle>{row.original.userId !== user?._id ? row.original.email : row.original.childEmail}</NoWrapTitle>
      )
    },
    {
      id: 'type',
      header: dictionary.account.guardian.type,
      cell: ({ row }) => <>{row.original.userId !== user?._id ? 'Parent' : 'Child'} account</>
    },
    {
      id: 'state',
      header: dictionary.account.guardian.state,
      cell: ({ row }) => <>{renderGuardianState(row.original.state)}</>
    },
    {
      header: dictionary.common.action,
      cell: ({ row }) => <OptionsMenu iconClassName='text-textPrimary' options={menuOptions(row)} />
    }
  ]
  const menuOptions = (row: Row<TypeWithAction>) => {
    const options: OptionType[] = []
    options.push({
      text: 'Delete Assignment',
      confirmText: dictionary.common.delete,
      confirm: async () => {
        await deleteGuradian(user as UserTable, row.original._id)
        success('Delete success')
        loadGuardian()
      }
    })

    return options
  }

  const handleAdd = async () => {
    try {
      if (!inputValue.current?.value) {
        return error('Please input child email')
      }
      //check child
      const { data: resultUser } = await getUsersByNameOrEmail(user as UserTable, { email: inputValue.current.value })
      if (resultUser !== null) {
        try {
          //add child
          await addGuradian(user as UserTable, {
            userId: user?._id as string,
            childId: resultUser?._id as string,
            childCode: resultUser?.code as string,
            state: 0
          })
          loadGuardian()
          setOpen(false)
          success(`add Guradian success! Waiting for the sub-account user to confirm.`)
        } catch (err) {
          if (err) {
            console.log('error:', err)
          }
        }
      } else {
        error('User not found!')
      }
    } catch (err) {
      error('Add error!')
    }
  }

  const actionButtons = isViewMode ? (
    <></>
  ) : (
    <PermissionButton
      key={'Create'}
      variant='contained'
      title={dictionary.common.createNew}
      text={dictionary.common.createNew}
      isShow={true}
      onClick={() => {
        setOpen(true)
      }}
    />
  )

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <ListTable tableData={data} tableColumns={columns} actionButtons={actionButtons} />
        <TargetDialog
          title={dictionary.guardian.addGuardian}
          width={'40%'}
          height={'40%'}
          open={open}
          setOpen={setOpen}
          content={
            <Box sx={{ color: '#000', display: 'flex', justifyContent: 'flex-start' }}>
              <TextField type='text' autoFocus label={'Input child email'} inputRef={inputValue} />
              <LoadingButton
                loading={loading}
                variant='contained'
                sx={{ width: '90px', marginLeft: '10px' }}
                onClick={handleAdd}
              >
                Add
              </LoadingButton>
            </Box>
          }
        ></TargetDialog>
      </Grid>
    </Grid>
  )
}

export default Guardian
