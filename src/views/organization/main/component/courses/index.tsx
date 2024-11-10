// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import Pagination from '@mui/material/Pagination'
import Typography from '@mui/material/Typography'

// Type Imports

import type { Locale } from '@configs/i18n'
import { UserTable } from '@/types/user/UserTable'
import { Course } from '@/types/course'
import { StudentStatus } from '@/types/course/student'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { useOrganization } from '@/hooks/useOrganization'
import getCourseImg from '@/utils/course/getCourseImg'
import { getCourses } from '@/api/course/getCourses'
import { useUser } from '@/hooks/useGlobal'

import { removeHTMLTags } from '@/utils/removeInnerHtml'

const Courses = () => {
  // States
  //   const [course, setCourse] = useState<Course['tags']>('All')
  const [hideCompleted] = useState(true)
  const [data, setData] = useState<Course[]>()
  const [activePage, setActivePage] = useState(0)
  const { organization, viewAllCourse } = useOrganization()
  const user = useUser()

  // Hooks
  const { lang: locale } = useParams()

  useEffect(() => {
    if (viewAllCourse) {
      const loadOrganizationCourses = async () => {
        if (organization) {
          const { data } = await getCourses(user as UserTable, organization._id)
          if (activePage > Math.ceil((data || []).length / 6)) setActivePage(0)
          setData(data?.filter(c => c))
        }
      }
      loadOrganizationCourses()
    } else if (organization && organization.defineCourses) {
      const newData = organization.defineCourses.map(course => course.id as Course)
      //   courseData?.filter(courseItem => {
      //     if (course === 'All') return !hideCompleted || courseItem.completedTasks !== courseItem.totalTasks

      //     return courseItem.tags === course && (!hideCompleted || courseItem.completedTasks !== courseItem.totalTasks)
      //   }) ?? []

      // if (searchValue) {
      //   newData = newData.filter(category => category.courseTitle.toLowerCase().includes(searchValue.toLowerCase()))
      // }

      if (activePage > Math.ceil(newData.length / 6)) setActivePage(0)
      setData(newData?.filter(c => c))
    }
  }, [activePage, hideCompleted, organization, user])

  return (
    <Card>
      <CardContent className='flex flex-col gap-6'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div>
            <Typography variant='h5'>Organization Courses</Typography>
            {data && data.length > 0 &&
              <Typography>Total {data?.length || 0} </Typography>}
          </div>
          {/* <div className='flex flex-wrap items-center gap-y-4 gap-x-6'>
            <FormControl fullWidth size='small' className='is-[250px] flex-auto'>
              <InputLabel id='course-select'>Courses</InputLabel>
              <Select
                fullWidth
                id='select-course'
                // value={course}
                onChange={() => {
                  //setCourse(e.target.value)
                  setActivePage(0)
                }}
                label='Courses'
                labelId='course-select'
              >
                <MenuItem value='All'>All Courses</MenuItem>
                <MenuItem value='Web'>Web</MenuItem>
                <MenuItem value='Art'>Art</MenuItem>
                <MenuItem value='UI/UX'>UI/UX</MenuItem>
                <MenuItem value='Psychology'>Psychology</MenuItem>
                <MenuItem value='Design'>Design</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={<Switch onChange={handleChange} checked={hideCompleted} />}
              label='Hide completed'
            />
          </div> */}
        </div>
        {data && data.length > 0 ? (
          <Grid container spacing={6}>
            {data?.slice(activePage * 6, activePage * 6 + 6).map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <div className='border rounded bs-full'>
                  <div className='pli-2 pbs-2'>
                    <Link
                      href={getLocalizedUrl(
                        user ? `/organization/${organization?._id}/detail/course/${item._id}/detail` : `/guest-home/course/${item._id}`,
                        locale as Locale
                      )}
                      className='flex'
                    >
                      <img
                        src={getCourseImg(item.user?.userImg)}
                        alt=""
                        style={{
                          width: '100%', // 宽度自适应
                          maxWidth: '100%', // 防止超出容器
                          aspectRatio: '400 / 266', // 保持 400x266 比例
                          objectFit: 'cover', // 确保图片不会变形
                        }}
                      />

                    </Link>
                  </div>
                  <div className='flex flex-col gap-4 p-5'>
                    <div className='flex items-center gap-2'>
                      {item.labels?.slice(0, 2).map((l, index) => (
                        <Chip key={index} label={l.title} variant='tonal' size='small' color={'primary'} />
                      ))}
                      {item.labels && item.labels.length > 2 && (
                        <span>...</span>
                      )}
                    </div>
                    <div className='flex flex-col gap-1'>
                      <Typography
                        variant='h5'
                        component={Link}
                        href={getLocalizedUrl(
                          `/organization/${organization?._id}/detail/course/${item._id}/detail`,
                          locale as Locale
                        )}
                        className='hover:text-primary'
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        title={item.description}
                        sx={{
                          display: '-webkit-box',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {removeHTMLTags(item.description || '')}
                      </Typography>
                    </div>
                    <div className='flex flex-col gap-1'>
                      <div className='flex items-center gap-1'>
                        <Typography className='flex items-center gap-1'>
                          <i className='ri-user-line' style={{ width: '18px' }} />
                          Capacity {item.students?.filter(c => c.status === StudentStatus.Accept)?.length || 0} /
                          {item.capacity || 1}
                        </Typography>
                      </div>
                      <LinearProgress
                        color='primary'
                        value={Math.floor(
                          ((item.students?.filter(c => c.status === StudentStatus.Accept)?.length || 0) /
                            (item.capacity || 1)) *
                          100
                        )}
                        variant='determinate'
                        className='is-full bs-2'
                      />
                    </div>
                    <Button
                      fullWidth
                      variant='outlined'
                      color='primary'
                      component={Link}
                      href={getLocalizedUrl(
                        `/organization/${organization?._id}/detail/course/${item._id}/detail`,
                        locale as Locale
                      )}
                      className='is-auto flex-auto'
                    >
                      View Course
                    </Button>
                  </div>
                </div>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography className='text-center'>No courses found</Typography>
        )}
        {data && data.length > 0 &&
          <div className='flex justify-center'>
            <Pagination
              count={Math.ceil((data?.length || 0) / 6)}
              page={activePage + 1}
              showFirstButton
              showLastButton
              variant='tonal'
              color='primary'
              onChange={(e, page) => setActivePage(page - 1)}
            />
          </div>}
      </CardContent>
    </Card>
  )
}

export default Courses
