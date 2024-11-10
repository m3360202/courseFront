'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import { Box } from '@mui/material'
import Typography from '@mui/material/Typography'

// Component Imports
import type { ColumnDef } from '@tanstack/react-table'
import ListTable from '@/components/list-table'
import type { TypeWithAction } from '@/components/list-table/types'
import { formatDateToYYYYMMDDHHII, getLocalizedDurationFormatter } from '@/utils/date'
import NoWrapTitle from '@/components/title/NoWrapTitle'
import CustomChip from '@/components/chip'
import TargetDialog from '@/components/dialog'

// Hooks Imports
import { useDictionary } from '@/hooks/useDictionary'
import { useUser, useStudent } from '@/hooks/useGlobal'

// Api Imports
import { getUserHistory } from '@/api/user/profile/getUserHistory'

// Type Imports
import type { HistoryResponse } from '@/api/user/profile/getUserHistory'

const History = ({ userId, organizationId }: { userId?: string; organizationId?: string }) => {
  //States
  const [data, setData] = useState<any[]>([])
  const [open, setOpen] = useState<boolean>(false)
  const [orderInfo, setOrderInfo] = useState<any>({})
  const [, setLoading] = useState<boolean>(false)

  //Hooks
  const user = useUser()
  const isStudent = useStudent()

  const getChipTitle = (type: string, state: number) => {
    if (type === 'Session') {
      return state === 0 ? 'Absent' : 'Attended'
    } else return state === 0 ? 'UnSubmit' : 'Submited'
  }

  const renderDetail = (title: string, value: string | undefined) => (
    <Box sx={{ display: 'flex', marginBottom: 2.7, alignItems: 'inherit' }}>
      <Typography sx={{ marginRight: 2, fontWeight: 500, fontSize: '0.875rem' }}>{title}:</Typography>
      <Typography variant='body2'>{value}</Typography>
    </Box>
  )

  const renderState = (item: HistoryResponse) => (
    <CustomChip
      skin='light'
      size='small'
      label={getChipTitle(item.type, item.state)}
      color={item.state === 0 ? 'error' : 'success'}
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

  useEffect(() => {
    const loadHistory = async () => {
      if (user) {
        setLoading(true)
        const data = await getUserHistory(user, userId || (user?._id as string), isStudent, organizationId)
        setData(data.data)
        setLoading(false)
      }
    }
    loadHistory()
  }, [user, userId, organizationId])

  //Vars
  const dictionary = useDictionary()

  const columns: ColumnDef<TypeWithAction, any>[] = [
    {
      id: 'type',
      header: dictionary.account.history.type,
      cell: ({ row }) => <NoWrapTitle>{row.original.type}</NoWrapTitle>
    },
    {
      id: 'title',
      header: dictionary.account.history.title,
      cell: ({ row }) => <NoWrapTitle>{row.original.title}</NoWrapTitle>
    },
    {
      id: 'course',
      header: dictionary.account.history.course,
      cell: ({ row }) => <NoWrapTitle>{row.original.courseTitle}</NoWrapTitle>
    },
    {
      id: 'tuour',
      header: dictionary.account.history.tutor,
      cell: ({ row }) => <NoWrapTitle>{row.original.userName}</NoWrapTitle>
    },
    {
      id: 'date',
      header: dictionary.account.payment.methodType,
      cell: ({ row }) => <NoWrapTitle>{formatDateToYYYYMMDDHHII(row.original.date)}</NoWrapTitle>
    },
    {
      id: 'state',
      header: dictionary.account.payment.status,
      cell: ({ row }) => <>{row.original.state !== undefined && renderState(row.original as HistoryResponse)}</>
    }
    // {
    //   header: dictionary.common.action,
    //   cell: ({ row }) => (
    //     <OptionsMenu iconClassName='text-textPrimary' options={menuOptions(row)} />
    //   )
    // }
  ]
  // const menuOptions = (row: Row<TypeWithAction>) => {
  //   const options: OptionType[] = []

  //   return options
  // }

  const handleRowClick = (row: TypeWithAction) => {
    setOpen(true)
    setOrderInfo(row)
  }

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <ListTable tableData={data} tableColumns={columns} handleRowClick={handleRowClick} />
        </Grid>
        <TargetDialog
          title={dictionary.course.joinCourse}
          width={'40%'}
          height={'40%'}
          open={open}
          setOpen={setOpen}
          content={
            <>
              {orderInfo && (
                <Box sx={{ color: '#000', minWidth: '460px' }}>
                  <Box sx={{ paddingTop: 2, paddingBottom: 2 }}>
                    {renderDetail('Title', orderInfo?.title)}
                    {renderDetail('Course', orderInfo?.courseTitle)}
                    {renderDetail('Tutor', orderInfo?.userName)}
                    {renderDetail('Date', formatDateToYYYYMMDDHHII(orderInfo?.date))}
                    {
                      <Box sx={{ display: 'flex', marginBottom: 2.7, alignItems: 'inherit' }}>
                        <Typography sx={{ marginRight: 2, fontWeight: 500, fontSize: '0.875rem' }}>State:</Typography>
                        <Typography variant='body2'>
                          {orderInfo?.state !== undefined && renderState(orderInfo)}
                        </Typography>
                      </Box>
                    }
                    {renderDetail('Operation Date', formatDateToYYYYMMDDHHII(orderInfo?.date))}
                    {orderInfo?.type === 'Session' &&
                      renderDetail('Class Duration', getLocalizedDurationFormatter(orderInfo?.classDuration))}
                  </Box>
                </Box>
              )}
            </>
          }
        ></TargetDialog>
      </Grid>
    </>
  )
}

export default History
