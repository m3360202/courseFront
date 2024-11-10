'use client'

// React Imports
import { useEffect, type ReactElement } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// Component Imports
import Settings from '@/views/organization/main/component/settings'
import { useGlobal } from '@/hooks/useGlobal'
import { getLocalizedUrl } from '@/utils/i18n'
import { useParams } from 'next/navigation'
import { Locale } from '@/configs/i18n'

const InformationTab = dynamic(() => import('@views/organization/main/component/settings/Information'))
const ActionsTab = dynamic(() => import('@views/organization/main/component/settings/Actions'))
const CourseTab = dynamic(() => import('@views/organization/main/component/settings/Course'))
const TeacherTab = dynamic(() => import('@views/organization/main/component/settings/Teacher'))
const DescriptionTab = dynamic(() => import('@views/organization/main/component/settings/Description'))

// Vars
const tabContentList = (): { [key: string]: ReactElement } => ({
  info: <InformationTab />,
  actions: <ActionsTab />,
  course: <CourseTab />,
  teacher: <TeacherTab />,
  desc: <DescriptionTab />
})

const SettingsApp = () => {
  const { setBackUrl } = useGlobal()
  const { lang: locale, organizationId } = useParams()

  useEffect(() => {
    setBackUrl([getLocalizedUrl(`/organization/${organizationId}/main`, locale as Locale)])

    return () => {
      setBackUrl(null)
    }
  }, [])

  return <Settings tabContentList={tabContentList()} />
}

export default SettingsApp
