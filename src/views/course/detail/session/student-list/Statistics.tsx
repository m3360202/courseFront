// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { Theme } from '@mui/material/styles'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import { Dispatch, SetStateAction, useEffect } from 'react'
import { StatusList } from '@/types/course/student'
import { getStudentList } from '@/api/course/getSessionStudents'
import { useUser } from '@/hooks/useGlobal'

interface Props {
  courseId: string
  sessionId: string
  changeStatus: boolean
  statusCountList: StatusList[] | undefined
  instructorId?: string
  setStatusCountList: Dispatch<SetStateAction<StatusList[] | undefined>>
}

const Statistics = ({
  courseId,
  sessionId,
  instructorId,
  changeStatus,
  statusCountList,
  setStatusCountList
}: Props) => {
  // Hooks
  const isBelowMdScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))
  const isBelowSmScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
  const user = useUser()

  useEffect(() => {
    const loadStudentList = async () => {
      if (user && courseId && sessionId) {
        const { data } = await getStudentList(user, courseId, sessionId, instructorId || user?._id)
        if (data && data.statusCountList) {
          const result: StatusList[] = []
          data.statusCountList.map(item => {
            switch (item._id) {
              case 'hw85fda43441416a9a92eb61c136b5bc':
                result.push({ ...item, title: 'Absent', icon: 'ri-user-unfollow-line', sort: 1 })
                break
              case 'gk85fda43441416a9a92eb61c136b5bc':
                result.push({ ...item, title: 'Attended', icon: 'ri-user-follow-line', sort: 2 })
                break
              case 'wt85fda43441416a9a92eb61c136b5bc':
                result.push({ ...item, title: 'Early dismissal', icon: 'ri-user-shared-line', sort: 3 })
                break
              case 'or85fda43441416a9a92eb61c136b5bc':
                result.push({ ...item, title: 'Tardy', icon: 'ri-user-received-line', sort: 4 })
                break
              case 'op85fda43441416a9a92eb61c136b5bc':
                result.push({ ...item, title: 'Leave', icon: 'ri-user-forbid-line', sort: 5 })
                break
            }
          })

          setStatusCountList(result.sort((a, b) => (a.sort as number) - (b.sort as number)))
        }
      }
    }
    loadStudentList()
  }, [user, courseId, sessionId, instructorId, changeStatus])

  return (
    <Card sx={{ mt: 6 }}>
      <CardContent>
        <Grid container spacing={6}>
          {statusCountList?.map((item, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={2.4}
              key={index}
              className={classnames({
                '[&:nth-of-type(odd)>div]:pie-6 [&:nth-of-type(odd)>div]:border-ie':
                  isBelowMdScreen && !isBelowSmScreen,
                '[&:not(:last-child)>div]:pie-6 [&:not(:last-child)>div]:border-ie': !isBelowMdScreen
              })}
            >
              <div className='flex justify-between gap-2'>
                <div className='flex flex-col items-start'>
                  <Typography variant='h4'>{item.count.toLocaleString()}</Typography>
                  <Typography>{item.title}</Typography>
                </div>
                <CustomAvatar variant='rounded' size={42} skin='light'>
                  <i className={classnames(item.icon, 'text-[26px]')} />
                </CustomAvatar>
              </div>
              {isBelowMdScreen && !isBelowSmScreen && index < statusCountList?.length - 2 && (
                <Divider
                  className={classnames('mbs-6', {
                    'mie-6': index % 2 === 0
                  })}
                />
              )}
              {isBelowSmScreen && index < statusCountList?.length - 1 && <Divider className='mbs-6' />}
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default Statistics
