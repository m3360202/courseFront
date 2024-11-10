'use client'

// React Imports
import { SyntheticEvent, useEffect, useState } from 'react'

// Mui Imports
import { LoadingButton } from '@mui/lab'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControlLabel,
  FormGroup,
  Grid,
  Checkbox,
  Typography
} from '@mui/material'
import Chip from '@mui/material/Chip'

// Api Imports
import { saveTeachCourse } from '@/api/organization/saveSchedule'
import { getTeachCourse } from '@/api/organization/getSchedule'
import { getCourses } from '@/api/course/getCourses'

// Hooks Imports
import { useUser } from '@/hooks/useGlobal'
import { useOrganization } from '@/hooks/useOrganization'
import { useDictionary } from '@/hooks/useDictionary'

// Types Imports
import { UserTable } from '@/types/user/UserTable'
import { ArrangeType, Course } from '@/types/course'

// NextJs Imports
import { useParams, useRouter } from 'next/navigation'

// Utils Imports
import { error, success } from '@/utils/toasts'
import { getLocalizedUrl } from '@/utils/i18n'
import { Locale } from '@/configs/i18n'
import moment from 'moment-timezone'
import TargetDialog from '@/components/dialog'

const Expertise = () => {
  //States
  const [submitLoading, setSubmitLoading] = useState(false)
  const [courses, setCourses] = useState<Course[]>()
  const [teacherCourses, setTeacherCourses] = useState<Course[]>()
  const [checked, setChecked] = useState<{ [key: string]: boolean }>({})
  const [open, setOpen] = useState(false)

  //Hooks
  const dictionary = useDictionary()
  const { organizationId, organization } = useOrganization()
  const user = useUser()
  const { push } = useRouter()
  const { lang: locale } = useParams()

  const loadTeacherCourses = async () => {
    if (organization && user) {
      const { data } = await getTeachCourse(user, organizationId)
      data?.courses?.map(course => {
        setChecked(prevState => ({
          ...prevState,
          [course._id]: true
        }))
      })
      setTeacherCourses(data?.courses)
    }
  }

  useEffect(() => {
    const loadOrgCourses = async () => {
      if (organization && user) {
        const { data } = await getCourses(user, organizationId, ArrangeType.unarranged)
        setCourses(data)
      }
    }

    loadOrgCourses()
    loadTeacherCourses()
  }, [organizationId, user])

  const handleChange = (name: string) => (event: SyntheticEvent<Element, Event>, checked: boolean) => {
    setChecked(prevState => ({
      ...prevState,
      [name]: checked
    }))
  }

  const getCheckedValues = () => {
    return Object.entries(checked)
      .filter(([, value]) => value)
      .map(([key]) => key)
  }

  const handleSubmit = async () => {
    const courses = getCheckedValues()
    if (!courses || courses.length === 0) {
      error('Please select courses!')

      return
    }
    setSubmitLoading(true)
    await saveTeachCourse(user as UserTable, { instructorId: organizationId as string, courses })
    setSubmitLoading(false)
    success('Edit expertise successful')
    await loadTeacherCourses()
  }
  const getTimeTable = (timeTable: number[]) => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return (
      <Box className='flex flex-wrap gap-2 justify-end' sx={{ maxWidth: '300px' }}>
        {timeTable.map((dayIndex) => (
          <Chip key={dayIndex} variant='tonal' label={daysOfWeek[dayIndex]} color='primary' />
        ))}
      </Box>
    );
  };

  return (
    <Card className='bs-full'>
      <CardHeader
        title={
          <div className='flex'>
            <Typography variant='h4' width={'50%'} textAlign={'center'}>
              Your Courses
            </Typography>
            <Typography variant='h5' width={'50%'} textAlign={'center'}>
              Choose courses you can teach
            </Typography>
          </div>
        }
      />
      <Divider />
      <Grid container>
        <Grid item xs={12} md={6} display={'flex'} flexDirection={'column'}>
          <CardContent className='flex flex-col gap-4'>
            {teacherCourses?.map(course => (
              <div
                key={course._id}
                className={`p-1  hover:bg-actionHover flex gap-4 justify-between`}
                onClick={() => {
                  push(getLocalizedUrl(`/course/${course._id}/detail`, locale as Locale))
                }}
              >
                <div className='flex gap-2'>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '35px',
                      height: '35px',
                      borderRadius: '50%',
                      backgroundColor: 'rgb(140, 87, 255)',
                    }}
                  >
                    <i className="ri-graduation-cap-fill bg-white-400 text-base" style={{ color: 'white' }}></i>
                  </div>
                  <div key={course._id} className='flex flex-col justify-top gap-2 cursor-pointer'>
                    <Typography sx={{ fontWeight: '600' }} color='text.primary'>{course.title}</Typography>
                    <Typography sx={{ fontWeight: '400', fontSize: '12px', color: '#999' }}>{`${moment.utc(course.startTime).tz(user?.timeZone as string).format('MMM D dddd')}
                ${moment.utc(course.startTime).tz(user?.timeZone as string).format('HH:mm')}
                (${moment.tz(user?.timeZone as string).zoneAbbr()})`}</Typography>
                  </div>
                </div>
                <div>
                  {getTimeTable(course.timetable)}
                </div>
              </div>
            ))}
          </CardContent>
        </Grid>
        <Grid item xs={12} md={6} className='border-r'>
          <CardContent className='flex flex-col gap-4'>
            <TargetDialog
              title={`Set Courses`}
              width={'60%'}
              height={'40%'}
              open={open}
              setOpen={setOpen}
              content={
                <FormGroup>
                  {courses?.map(course => (
                    <FormControlLabel
                      key={course._id}
                      value={course._id}
                      checked={checked[course._id]}
                      control={<Checkbox />}
                      label={course.title}
                      onChange={handleChange(course._id)}
                    />
                  ))}
                </FormGroup>
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
                    {dictionary.common.cancel}
                  </Button>
                  <LoadingButton
                    loading={submitLoading}
                    variant='contained'
                    onClick={() => {
                      handleSubmit()
                      setOpen(false)
                    }} >
                    {dictionary.common.confirm}
                  </LoadingButton>
                </>
              }
            >
              <LoadingButton className='w-1/4 m-auto' variant='contained'>Set Courses</LoadingButton>
            </TargetDialog>
          </CardContent>
        </Grid>
      </Grid>
    </Card>
  )
}

export default Expertise