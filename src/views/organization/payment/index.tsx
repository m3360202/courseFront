'use client'

// MUI Imports
import { useEffect, useState } from 'react'

import Grid from '@mui/material/Grid'

// Component Imports
import type { ColumnDef } from '@tanstack/react-table'

import { Autocomplete, Box, Button, Chip, IconButton, TextField } from '@mui/material'

import ListTable from '@/components/list-table'

import type { TypeWithAction } from '@/components/list-table/types'
import { useUser } from '@/hooks/useGlobal'
import { getPayments } from '@/api/organization/payment/getPayments'
import { Payment } from '@/types/organization/payment'
import { formatUtcDateToDateTime } from '@/utils/date'
import UserAvatar from '@/components/user-avatar'
import TargetDialog from '@/components/dialog'
import DetailList from '@/components/detail-list'
import { DetailItem } from '@/types'
import { useOrganization } from '@/hooks/useOrganization'
import { PlatformUser, UserType } from '@/types/organization'
import { UserTable } from '@/types/user/UserTable'
import { LoadingButton } from '@mui/lab'
import { addPaymentRecord } from '@/api/payment'
import { error, success } from '@/utils/toasts'
import FileUpload from '@/components/file-upload'
import { uploadMultiple } from '@/api/upload'
import { FileType } from '@/types/file/file'
import FileList from '@/components/file-upload/FileList'
import { getImg } from '@/utils/getImg'

const PaymentList = ({ organizationId }: { organizationId: string }) => {
  //States
  const [data, setData] = useState<Array<Payment>>()
  const [open, setOpen] = useState(false)
  const [payment, setPayment] = useState<Payment>()
  const [addPaymentOpen, setAddPaymentOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [amount, setAmount] = useState<number>()
  const [userInfo, setUserInfo] = useState<UserTable>()
  const [addRecordLoading, setAddRecordLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [files, setFiles] = useState<FileType[]>()

  //Hooks
  const user = useUser() as UserTable
  const { organization } = useOrganization()

  useEffect(() => {
    setFiles([])
    setAmount(undefined)
    setUserInfo(undefined)
    setSearchValue('')
  }, [addPaymentOpen])

  useEffect(() => {
    const loadPayments = async () => {
      if (user) {
        const { data } = await getPayments(user, organizationId)
        setData(data)
      }
    }
    loadPayments()
  }, [user, organizationId, addRecordLoading])

  const columns: ColumnDef<TypeWithAction, any>[] = [
    {
      id: 'updatedAt',
      header: 'Payment Date',
      cell: ({ row }) => (row.original.updatedAt ? formatUtcDateToDateTime(row.original.updatedAt) : '')
    },
    {
      id: 'fee',
      header: 'Amount',
      cell: ({ row }) => <span style={{ color: '#1976d2' }}>${row.original.fee / 100}</span>
    },
    {
      id: 'paymentMethodType',
      header: 'Method',
      cell: ({ row }) => <span style={{ color: '#1976d2' }}>{row.original.paymentMethodType}</span>
    },
    {
      id: 'userId',
      header: 'Payer',
      cell: ({ row }) => (
        <UserAvatar
          userImg={row.original.userInfo[0]?.userImg}
          name={row.original.userInfo[0]?.nickName || row.original.userInfo[0]?.username}
        />
      )
    },
    {
      id: 'legalName',
      header: 'RealName',
      cell: ({ row }) => row.original.legalName
    },
    {
      id: 'status',
      header: 'From Action',
      cell: ({ row }) => (
        <Chip
          variant='tonal'
          size='small'
          label={row.original.status}
          color={row.original.status === 'STATUS_PAID' ? 'success' : 'error'}
          className='capitalize'
        />
      )
    },
    {
      id: 'pdfUrl',
      header: 'Invoice',
      cell: ({ row }) => (
        <IconButton
          onClick={e => {
            e.stopPropagation()
            if (!row.original.pdfUrl && !row.original.files?.length) {
              error('No invoice found!')

              return;
            }
            window.open(row.original.pdfUrl || getImg(row.original.files[0].temporary))
          }}
        >
          <i className='ri-bank-card-line' />
        </IconButton>
      )
    }
  ]

  const items: DetailItem[] = [
    {
      title: 'UserName',
      value: payment?.userInfo[0]?.nickName || payment?.userInfo[0]?.username,
      col: 1
    },
    {
      title: 'Email',
      value: payment?.userInfo[0]?.email,
      col: 1
    },
    {
      title: 'Amout',
      value: `$${(payment?.fee || 0) / 100}`,
      col: 1
    },
    {
      title: 'Payment Type',
      value: payment?.paymentMethodType,
      col: 1
    },

    {
      title: 'Payment Date',
      value: payment?.updatedAt ? formatUtcDateToDateTime(payment.updatedAt) : '',
      col: 1
    },
    {
      title: 'Payment Status',
      value: payment?.status,
      col: 1
    },
    {
      title: 'Legal Name',
      value: payment?.legalName,
      col: 1
    }
  ]

  const handleRowClick = (row: TypeWithAction) => {
    setPayment(row as Payment)
    setOpen(true)
  }

  const handleChangeUserInfo = (event: any, newValue: PlatformUser | null) => {
    if (newValue) {
      setUserInfo(newValue.userId as UserTable)
    } else {
      setUserInfo(undefined)
    }

  }

  const handleAddPaymentRecord = async () => {
    if (!userInfo) {
      error('Please select a student!')

      return;
    }
    if (!amount) {
      error('Please enter the fee amount!')

      return;
    }
    setAddRecordLoading(true)
    const data: any = {
      institutionId: organizationId,
      orderSn: 'OffLine-' + new Date().getTime(),
      paymentType: 3,
      userId: userInfo._id,
      status: 'STATUS_PAID',
      paymentMethodType: 'Offline payment',
      fee: amount && amount > 0 ? amount * 100 : 0,
      files
    }

    await addPaymentRecord(user, data)
    setAddRecordLoading(false)
    setAddPaymentOpen(false)
    success('Payment record created successfully!');
  }

  const handleUploadFiles = async (fileList: File | File[]) => {
    setUploadLoading(true)
    const { data } = await uploadMultiple(user as UserTable, fileList as File[])
    setFiles([...data, ...(files ?? [])])
    setUploadLoading(false)
  }

  const actionButtons = <TargetDialog title='Add Payment Record' open={addPaymentOpen} setOpen={setAddPaymentOpen} content={<Box sx={{ color: '#000' }}>
    <Grid container spacing={6}>
      <Grid item xs={12} >
        <Autocomplete
          onChange={handleChangeUserInfo}
          fullWidth
          options={organization?.platformUsers?.filter(user => user.userType === UserType.Student) || []}
          filterOptions={x =>
            x.filter((c: PlatformUser) =>
              !searchValue
                ? true :
                (c.userId as UserTable).username?.toLowerCase().includes(searchValue.toLowerCase()) ||
                (c.userId as UserTable).nickName?.toLowerCase().includes(searchValue.toLowerCase()) ||
                (c.userId as UserTable).email?.toLowerCase().includes(searchValue.toLowerCase())
            )
          }
          autoHighlight
          getOptionLabel={option => (option.userId as UserTable).nickName || (option.userId as UserTable).username}
          renderOption={(props: any, option: PlatformUser) => (
            <Box component='li' {...props} >
              <UserAvatar
                userImg={(option.userId as UserTable).userImg}
                name={(option.userId as UserTable).nickName || (option.userId as UserTable).username}
              />
            </Box>
          )}
          renderInput={params => (
            <TextField
              {...params}
              label='Input username or email'
              onChange={(e) => { setSearchValue(e.target.value) }}
              inputProps={{
                ...params.inputProps
              }}
            />
          )}

        />

      </Grid>
      <Grid item xs={12} >
        <TextField
          fullWidth
          label='Amount'
          type="number"
          onChange={(e) => { setAmount(parseInt(e.target.value)) }}
        />
      </Grid>
      <Grid item xs={12} >
        <TextField disabled fullWidth label='Payment Type' value={'Offline payment'} />
      </Grid>
      <Grid item xs={12} >
        <FileUpload loading={uploadLoading} accept='image/*' handleUploadFiles={handleUploadFiles} />
        <FileList files={files} setFiles={setFiles} />
      </Grid>
      <Grid item xs={12} textAlign={'center'}>
        <LoadingButton loading={addRecordLoading} onClick={() => { handleAddPaymentRecord() }} variant='contained' >Add Payment Record</LoadingButton>
      </Grid>

    </Grid>
  </Box>}>
    <Button variant='contained'>Add Payment Manually</Button>
  </TargetDialog>

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <ListTable
          tableData={data}
          tableColumns={columns}
          searchTitle='Payment'
          handleRowClick={handleRowClick}
          actionButtons={actionButtons}
        />
      </Grid>
      <TargetDialog title='Payment Detail' open={open} setOpen={setOpen} content={<DetailList items={items} />} />
    </Grid>
  )
}

export default PaymentList
