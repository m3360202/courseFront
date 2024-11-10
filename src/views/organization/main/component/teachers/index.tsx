// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Pagination from '@mui/material/Pagination'
import Typography from '@mui/material/Typography'

// Util Imports
import { useOrganization } from '@/hooks/useOrganization'
import { BASE_URL } from '@/types'
import { UserTable } from '@/types/user/UserTable'
import Contact from '@/components/buttons/Contact'

const Teachers = () => {
  // States
  //   const [course, setCourse] = useState<Course['tags']>('All')
  const [hideCompleted] = useState(true)
  const [data, setData] = useState<UserTable[]>()
  const [activePage, setActivePage] = useState(0)
  const { organization } = useOrganization()

  useEffect(() => {
    if (organization && organization.defineTeachers) {
      const newData = organization.defineTeachers.map(teacher => teacher.id as UserTable)
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
  }, [activePage, hideCompleted, organization])

  return (
    <Card>
      <CardContent className='flex flex-col gap-6'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div>
            <Typography variant='h5'>Organization Teachers</Typography>
            {data && data.length > 0 &&
              <Typography>Total {data?.length || 0}</Typography>}
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
            {data?.slice(activePage * 6, activePage * 6 + 6).map(item => (
              <Grid key={item._id} item xs={12} sm={6} md={4}>
                <div className='border rounded bs-full'>
                  <div className='pli-2 pbs-2'>
                    <Link
                      // href={getLocalizedUrl(`/course/${item._id}/detail`, locale as Locale)}
                      href={''}
                      className='flex'
                    >
                      <img
                        src={
                          item.userImg && item.userImg !== 'null' && item.userImg !== 'undefined'
                            ? BASE_URL + item?.userImg
                            : '/images/pages/profile-banner.png'
                        }
                        alt={''}
                        className='is-full'
                      />
                    </Link>
                  </div>
                  <div className='flex flex-col gap-4 p-5'>
                    <div className='flex items-center gap-2'>
                      {item.labels?.map(
                        l =>
                          l.title && (
                            <Chip key={l.title} label={l.title} variant='tonal' size='small' color={'primary'} />
                          )
                      )}
                    </div>
                    <div className='flex flex-col gap-1'>
                      <Typography
                        variant='h5'
                        component={Link}
                        // href={getLocalizedUrl(`/course/${item._id}/detail`, locale as Locale)}
                        href={''}
                        className='hover:text-primary'
                      >
                        {item.nickName || item.username}
                      </Typography>
                    </div>
                    <Contact contactUserId={item._id} />
                    {/* <Button
                      fullWidth
                      variant='outlined'
                      color='primary'
                      component={Link}
                      // href={getLocalizedUrl(`/course/${item._id}/detail`, locale as Locale)}
                      href=''
                      className='is-auto flex-auto'
                    >
                      Contact
                    </Button> */}
                  </div>
                </div>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography className='text-center'>No teachers found</Typography>
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

export default Teachers
