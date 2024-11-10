'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import { Box, Chip, TextField } from '@mui/material'
import Dialog from '@mui/material/Dialog'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'

// Component Imports
import type { ColumnDef } from '@tanstack/react-table'
import ListTable from '@/components/list-table'
import type { TypeWithAction } from '@/components/list-table/types'
import { formatDateToYYYYMMDDHHII } from '@/utils/date'
import NoWrapTitle from '@/components/title/NoWrapTitle'
import { RemixIcon } from '@/components/icon/remix-icon'
import UserAvatar from '@/components/user-avatar'

// Hooks Imports
import { useDictionary } from '@/hooks/useDictionary'
import { useUser } from '@/hooks/useGlobal'

// Api Imports
import { getUserPaymentHistory } from '@/api/user/profile/getUserPaymentHistory'

const PaymentList = ({ userId }: { userId?: string }) => {
  //States
  const [data, setData] = useState<any[]>([])
  const pageSize = 50
  const page = 0
  const [open, setOpen] = useState<boolean>(false)
  const [orderInfo, setOrderInfo] = useState<any>({})
  const [, setLoading] = useState<boolean>(false)

  //Hooks
  const user = useUser()

  useEffect(() => {
    const loadPayments = async () => {
      if (user) {
        setLoading(true)
        const data = await getUserPaymentHistory(user, {
          userId: userId || (user._id as string),
          page,
          limit: pageSize
        })
        setData(data)
        setLoading(false)
      }
    }
    loadPayments()
  }, [user])

  //Vars
  const dictionary = useDictionary()

  const columns: ColumnDef<TypeWithAction, any>[] = [
    {
      id: 'updatedAt',
      header: dictionary.account.payment.userName,
      cell: ({ row }) => (
        <UserAvatar
          userImg={row.original.userInfo[0].userImg}
          name={row.original.userInfo[0].username}
          email={row.original.userInfo[0].email}
        />
      )
    },
    {
      id: 'organizationName',
      header: 'Organization',
      cell: ({ row }) => row.original.institution?.[0]?.name
    },
    {
      id: 'fee',
      header: dictionary.account.payment.amount,
      cell: ({ row }) => {
        const formattedFee = row.original.fee / 100

        return <span style={{ color: '#1976d2' }}>${formattedFee}</span>
      }
    },
    {
      id: 'paymentMethodType',
      header: dictionary.account.payment.methodType,
      cell: ({ row }) => <NoWrapTitle>{row.original.paymentType === '3' ? 'Donation' : 'Fixed fee'}</NoWrapTitle>
    },
    {
      id: 'status',
      header: dictionary.account.payment.status,
      cell: ({ row }) => {
        const color = row.original.status === 'STATUS_PAID' ? 'success' : 'warning'

        return <Chip variant='tonal' label={row.original.status} size='small' color={color} className='capitalize' />
      }
    },
    {
      id: 'updatedAt',
      header: 'Payment Date',
      cell: ({ row }) => formatDateToYYYYMMDDHHII(row.original.updatedAt)
    },
    {
      id: 'pdfUrl',
      header: dictionary.account.payment.invoice,
      cell: ({ row }) => (
        <Box
          onClick={(e: any) => {
            e.stopPropagation()
            window.open(row.original.pdfUrl)
          }}
        >
          <RemixIcon icon='ri-file-pdf-2-line' />
        </Box>
      )
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
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <ListTable tableData={data} tableColumns={columns} handleRowClick={handleRowClick} />
      </Grid>
      <Dialog
        onClose={() => {
          setOrderInfo({})
          setOpen(false)
        }}
        aria-labelledby='customized-dialog-title'
        open={open}
      >
        <DialogTitle id='customized-dialog-title' className='p-4'>
          <Typography variant='h6' component='span'>
            Payment Detail
          </Typography>
        </DialogTitle>
        <DialogContent dividers className='p-4 w-full'>
          {orderInfo && (
            <Box sx={{ color: '#000', minWidth: '460px' }}>
              {/* <UserAvatar
                userImg={user?.userImg}
                name={user?.username}
              /> */}
              <Grid item xs={12} sx={{ width: '100%', marginY: '8px' }}>
                <TextField className='w-full' disabled label='OrderSn' value={orderInfo?.stripeOrderSn} />
              </Grid>
              <Grid item xs={12} sx={{ width: '100%', marginY: '8px' }}>
                <TextField className='w-full' disabled label='Amount' value={`$ ${Math.round(orderInfo?.fee / 100)}`} />
              </Grid>
              <Grid item xs={12} sx={{ width: '100%', marginY: '8px' }}>
                <TextField className='w-full' disabled label='Payment Purpose' value='enrollment in an institution' />
              </Grid>
              <Grid item xs={12} sx={{ width: '100%', marginY: '8px' }}>
                <TextField className='w-full' disabled label='Institution' value={orderInfo?.institution?.[0]?.name} />
              </Grid>
              <Grid item xs={12} sx={{ width: '100%', marginY: '8px' }}>
                <TextField
                  disabled
                  className='w-full'
                  label='Payment Type'
                  value={orderInfo?.paymentType === '3' ? 'Donation' : 'Fixed fee'}
                />
              </Grid>
              <Grid item xs={12} sx={{ width: '100%', marginY: '8px' }}>
                <TextField className='w-full' disabled label='Payment Status' value='Paid' />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  className='w-full'
                  disabled
                  label='Payment Date'
                  value={formatDateToYYYYMMDDHHII(orderInfo.updatedAt)}
                />
              </Grid>
              <Grid item xs={12} sx={{ width: '100%', marginY: '8px' }}>
                <TextField className='w-full' disabled label='Payment Status' value={orderInfo?.status} />
              </Grid>
              <Grid item xs={12} sx={{ width: '100%', marginY: '8px' }}>
                <TextField className='w-full' disabled label='Legal Name' value={orderInfo?.legalName} />
              </Grid>
              <Grid item xs={12} sx={{ width: '100%', marginY: '8px' }}>
                <TextField className='w-full' disabled label='Email' value={orderInfo?.userInfo?.[0]?.email} />
              </Grid>
              <Grid item xs={12} sx={{ width: '100%', marginY: '8px' }}>
                <TextField className='w-full' disabled label='Phone Number' value={orderInfo?.phone} />
              </Grid>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Grid>
  )
}

export default PaymentList
