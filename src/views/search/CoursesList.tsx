'use client'

// React Imports
import React, { useState, useEffect } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Pagination from '@mui/material/Pagination'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

// Type Imports
import type { Locale } from '@configs/i18n'
import { Course } from '@/types/course'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Style Imports
import Contact from '@components/buttons/Contact'
import CourseFilter from '@views/search/CourseFilter'
import Chip from '@mui/material/Chip'
import { StudentStatus } from '@/types/course/student'
import LinearProgress from '@mui/material/LinearProgress'
import getCourseImg from '@/utils/course/getCourseImg'

import { removeHTMLTags } from '@/utils/removeInnerHtml'

type Props = {
  courses: Course[]
}

const CoursesList = ({ courses }: Props) => {
  // States
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [activePage, setActivePage] = useState(1)

  // Hooks
  const { lang: locale } = useParams()

  useEffect(() => {
    // Filter courses based on searchValue
    // let newData = courses.filter(courseItem => courseItem.title.toLowerCase().includes(searchValue.toLowerCase()))
    const newData = courses

    // Reset to first page if current page exceeds total pages after filtering
    if (activePage > Math.ceil(newData.length / 6)) {
      setActivePage(1)
    }

    setFilteredCourses(newData)
  }, [activePage, courses])

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setActivePage(page)
  }

  return (
    <Card>
      <CardContent>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div>
            <Typography variant='h5'>Filter</Typography>
          </div>
        </div>
        <CourseFilter />
      </CardContent>
      <CardContent className='flex flex-col gap-6'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div>
            <Typography variant='h5'>Courses</Typography>
            <Typography>Total {courses.length} courses found</Typography>
          </div>
        </div>

        {filteredCourses.length > 0 ? (
          <Grid container spacing={6}>
            {filteredCourses.slice((activePage - 1) * 6, activePage * 6).map(item => (
              <Grid item xs={12} sm={6} md={4} key={item._id}>
                <div className='border rounded bs-full'>
                  <div className='pli-2 pbs-2'>
                    <Link href={getLocalizedUrl(`/course/${item._id}/detail`, locale as Locale)} className='flex'>
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
                        href={getLocalizedUrl(`/course/${item._id}/detail`, locale as Locale)}
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
                    <Box className='flex flex-wrap gap-4'>
                      <Button
                        variant='outlined'
                        color='primary'
                        component={Link}
                        href={getLocalizedUrl(`/course/${item._id}/detail`, locale as Locale)}
                        className='is-auto flex-auto'
                      >
                        View Course
                      </Button>
                      <Contact
                        color='primary'
                        variant='outlined'
                        title='Contact tutor'
                        contactUserId={item.user?._id as string}
                        className='is-auto flex-auto'
                      />
                    </Box>
                  </div>
                </div>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography className='text-center'>No courses found.</Typography>
        )}

        {/* Pagination */}
        {filteredCourses.length > 6 && (
          <Box className='flex justify-center mt-6'>
            <Pagination
              count={Math.ceil(filteredCourses.length / 6)}
              page={activePage}
              showFirstButton
              showLastButton
              color='primary'
              onChange={handlePageChange}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default CoursesList
