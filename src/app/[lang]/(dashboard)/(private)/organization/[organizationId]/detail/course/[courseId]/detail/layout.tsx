'use client'

import { useEffect, type ReactNode } from 'react'
import CustomTabs from '@/components/tabs'
import { Orientation, TabItem } from '@/types'
import Title from '@/components/title'
import { useParams, usePathname } from 'next/navigation'
import { getDictionary } from '@/utils/getDictionary'
import { Locale } from '@/configs/i18n'
import { getLocalizedUrl } from '@/utils/i18n'
import { useCourse, useAccessCourseDenied, useEditCourseRole } from '@/hooks/useCourse'
import { Grid, IconButton } from '@mui/material'
import Link from 'next/link'
import Card from '@mui/material/Card'
import { useGlobal } from '@/hooks/useGlobal'

const CourseDetailLayout = ({ params, children }: { params: { courseId: string }; children: ReactNode }) => {
  //Props
  const { courseId } = params

  //hooks
  const { lang: locale, sessionId, assignmentId, quizId, organizationId } = useParams()
  const { course, actionButtons, backUrl } = useCourse()
  const { hiddenTabs, setTitle, setBackUrl } = useGlobal()
  const pathName = usePathname()
  const accessDenied = useAccessCourseDenied()
  const editCourseRole = useEditCourseRole()

  useEffect(() => {
    if (hiddenTabs) setTitle(getTitle())
    else {
      setTitle('Course')
      setBackUrl([getLocalizedUrl('/course', locale as Locale)])
    }
  }, [hiddenTabs])

  //Vars
  const dictionary = getDictionary(locale as Locale)

  const tabs: TabItem[] = [
    {
      label: dictionary.course.overview.title,
      href: getLocalizedUrl(`/organization/${organizationId}/detail/course/${courseId}/detail`, locale as Locale, true),
      icon: 'ri-home-2-line'
    },
    // {
    //   label: 'Enrollment',
    //   href: getLocalizedUrl(
    //     `/organization/${organizationId}/detail/course/${courseId}/detail/enrollment`,
    //     locale as Locale,
    //     true
    //   ),
    //   icon: 'ri-group-3-line'
    // },
    {
      label: 'Session',
      href: getLocalizedUrl(
        `/organization/${organizationId}/detail/course/${courseId}/detail/session`,
        locale as Locale,
        true
      ),
      icon: 'ri-terminal-box-line',
      hidden: accessDenied
    },
    {
      label: 'Roster',
      href: getLocalizedUrl(
        `/organization/${organizationId}/detail/course/${courseId}/detail/roster`,
        locale as Locale,
        true
      ),
      icon: 'ri-group-line',
      hidden: accessDenied || !editCourseRole
    },
    {
      label: 'Documents',
      href: getLocalizedUrl(
        `/organization/${organizationId}/detail/course/${courseId}/detail/document`,
        locale as Locale,
        true
      ),
      icon: 'ri-folder-upload-line',
      hidden: accessDenied
    },
    {
      label: 'Assignment',
      href: getLocalizedUrl(
        `/organization/${organizationId}/detail/course/${courseId}/detail/assignment`,
        locale as Locale,
        true
      ),
      icon: 'ri-article-line',
      hidden: accessDenied
    },
    {
      label: 'Quiz',
      href: getLocalizedUrl(
        `/organization/${organizationId}/detail/course/${courseId}/detail/quiz`,
        locale as Locale,
        true
      ),
      icon: 'ri-questionnaire-line',
      hidden: accessDenied
    }
  ]

  const targetHref = pathName
    .replace(('/' + (sessionId || assignmentId || quizId)) as string, '')
    .replace('/add', '')
    .replace('/pdf', '')
    .replace('/edit', '')
    .replace('/view', '')
    .replace('/answer', '')
    .replace('/grade', '')

  const getTitle = () => {
    let opt = ''
    if (pathName.includes('/add')) opt = 'Add'
    else if (pathName.includes('/edit')) opt = 'Edit'

    return opt + ' ' + tabs.find(c => c.href === targetHref)?.label
  }

  return (
    <Grid container rowSpacing={2}>
      {!hiddenTabs && (
        <Grid item xs={12} md={3}>
          <Card sx={{ width: '95%', paddingX: '15px', paddingY: '10px', marginTop: '10px' }}>
            <CustomTabs
              title={course?.title || ''}
              userImg={course?.user?.userImg}
              name={course?.user?.name}
              orientation={Orientation.vertical}
              items={tabs}
              targetHref={targetHref}
            />
          </Card>
        </Grid>
      )}
      <Grid item xs={12} md={!hiddenTabs ? 9 : 12}>
        <div className='flex justify-between mb-2'>
          <div className='flex gap-1 items-center'>
            {backUrl &&
              backUrl.map(url => (
                <IconButton key={url} className='text-textPrimary' component={Link} href={url}>
                  <i className='ri-arrow-left-line'></i>
                </IconButton>
              ))}
            {!hiddenTabs && <Title variant='h5'>{getTitle()}</Title>}
          </div>
          <div className='flex gap-1 pr-5'>{actionButtons?.map(button => button)}</div>
        </div>
        {children}
      </Grid>
    </Grid>
  )
}

export default CourseDetailLayout
