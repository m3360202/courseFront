'use client'

import { getCourses } from '@/api/course/getCourses'
import { Locale } from '@/configs/i18n'
import { useUser } from '@/hooks/useGlobal'
import { useOrganization } from '@/hooks/useOrganization'
import { Course } from '@/types/course'
import format from '@/utils/format'
import { getLocalizedUrl } from '@/utils/i18n'
import { Card, CardContent, CardHeader, Divider, Typography } from '@mui/material'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const Courses = () => {
  //States
  const [data, setData] = useState<Course[]>()

  //Hooks
  const { organizationId } = useOrganization()
  const user = useUser()
  const { push } = useRouter()
  const { lang: locale } = useParams()

  useEffect(() => {
    const loadCourses = async () => {
      if (user && organizationId) {
        const { data } = await getCourses(user, organizationId)
        setData(data)
      }
    }
    loadCourses()
  }, [user, organizationId])

  return (
    <Card className='bs-full'>
      <CardHeader title={`Courses (${data?.length || 0})`} />
      <Divider />
      <div className='flex justify-between plb-4 pli-5 '>
        <Typography variant='overline'>Title</Typography>
        <Typography variant='overline'>Schedule</Typography>
      </div>
      <Divider />
      <CardContent className='flex flex-col gap-4 p-0'>
        {data?.slice(0, 5).map(course => (
          <div
            key={course._id}
            className={`p-4  hover:bg-actionHover`}
            onClick={() => {
              push(
                getLocalizedUrl(`/organization/${organizationId}/detail/course/${course._id}/detail`, locale as Locale)
              )
            }}
          >
            <div key={course._id} className='flex justify-between gap-4 cursor-pointer'>
              <Typography color='text.primary'>{course.title}</Typography>
              <div className='flex gap-2 flex-col'>
                <Typography color='text.primary'>
                  {format(course.startTime)}-{format(course.endTime)}
                </Typography>
                <Typography>Students:{course.students?.length || 0}</Typography>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default Courses
