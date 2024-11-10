'use client'

// React Imports
import { useEffect, useState } from 'react'

// Api Imports
import { getSchedule } from '@/api/organization/getSchedule'
import { saveSchedule } from '@/api/organization/saveSchedule'

// Hooks Imports
import { useUser } from '@/hooks/useGlobal'
import { useOrganization } from '@/hooks/useOrganization'
import { useDictionary } from '@/hooks/useDictionary'

// Types Imports
import { Schedule } from '@/types/organization/schedule'
import { UserTable } from '@/types/user/UserTable'

// Mui Imports
import { LoadingButton } from '@mui/lab'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'

// Components Imports
import TargetDialog from '@/components/dialog'
import TeachingSchedule, { mergeTime } from './TeachingSchedule'
import { error, success } from '@/utils/toasts'

const Availability = () => {
  //Hooks
  const { organizationId, organization } = useOrganization()
  const user = useUser()
  const dictionary = useDictionary()

  //States

  const [open, setOpen] = useState(false)
  const [schedule, setSchedule] = useState<Schedule[] | undefined>([])
  const [originSchedules, setOrignSchedules] = useState<Schedule[] | undefined>(organization?.schedules)
  const [submitLoading, setSubmitLoading] = useState(false)

  const loadSchedule = async () => {
    if (organizationId && user) {
      const { data } = await getSchedule(user, organizationId)
      setSchedule(data?.schedules)
      setOrignSchedules(data?.schedules)
    }
  }

  const handleSubmit = async () => {
    if (!schedule || schedule.length === 0) {
      error('Please select schedule!')

      return
    }
    setSubmitLoading(true)
    await saveSchedule(user as UserTable, {
      instructorId: organizationId as string,
      schedules: schedule
    })
    setSubmitLoading(false)
    success('Set availability successful')
  }

  useEffect(() => {
    loadSchedule()
  }, [organizationId, user])

  return (
    <Card className='bs-full'>
      <CardHeader
        title={
          <div className='flex'>
            <Typography variant='h5' width={'50%'} textAlign={'center'}>
              Your Schedule
            </Typography>
            <Typography variant='h5' width={'50%'} textAlign={'center'}>
              Set Schedule
            </Typography>
          </div>
        }
      />
      <Divider />
      <Grid container>

        <Grid item xs={12} md={6} display={'flex'} flexDirection={'column'} rowGap={2}>
          <CardContent className='flex flex-col gap-4'>
            <TableContainer style={{ display: 'flex' }}>
              <Table
                id="select-table"
                sx={{
                  width: '240px',
                  '& .MuiTableCell-root': {
                    border: '1px solid rgba(224, 224, 224, 1)'
                  }
                }}
              >
                <TableHead sx={{ backgroundColor: '#FFFFFF' }}>
                  <TableRow>
                    <TableCell>WeekName</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {originSchedules && originSchedules.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell
                        sx={{
                          background: 'inherit',
                          '&:hover': { background: 'rgba(224, 224, 224, 1)' }
                        }}
                      >
                        {item.weekName}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Table
                id="select-table"
                sx={{
                  '& .MuiTableCell-root': {
                    border: '1px solid rgba(224, 224, 224, 1)'
                  }
                }}
              >
                <TableHead sx={{ backgroundColor: '#FFFFFF' }}>
                  <TableRow>
                    <TableCell>Schedule</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {schedule && schedule.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{mergeTime(item.schedule)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Grid>
        <Grid item xs={12} md={6} className='border-r'>
          <CardContent className='flex flex-col gap-4'>
            <div className='w-full text-center'>
              <TargetDialog
                title={`Set Schedule`}
                width={'60%'}
                height={'40%'}
                open={open}
                setOpen={setOpen}
                content={
                  <TeachingSchedule 
                    schedule={schedule} 
                    setSchedule={setSchedule}
                  />
                }
                actions={
                  <>
                    <Button
                      onClick={() => {
                        setOpen(false)
                        setSchedule(originSchedules)
                      }}
                      variant='outlined'
                      color='secondary'
                    >
                      {dictionary.common.cancel}
                    </Button>
                    <LoadingButton loading={submitLoading} variant='contained' onClick={()=>{ handleSubmit() }} >
                      {dictionary.common.confirm}
                    </LoadingButton>
                  </>
                }
              >
                <LoadingButton variant='contained'>Set Schedule</LoadingButton>
              </TargetDialog>
            </div>
          </CardContent>
        </Grid>
      </Grid>
    </Card>
  )
}

export default Availability
