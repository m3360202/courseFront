'use client'

import { Locale } from '@/configs/i18n'
import { useGlobal } from '@/hooks/useGlobal'
import { getLocalizedUrl } from '@/utils/i18n'
import MainView from '@/views/organization/main'
import { useParams } from 'next/navigation'

import { useEffect } from 'react'


const MainApp = () => {
  const { setBackUrl, setTitle } = useGlobal()
  const { lang: locale } = useParams()

  useEffect(() => {
    const backUrl = `/organization/home`
    setBackUrl([getLocalizedUrl(backUrl, locale as Locale)])
    setTitle('Organization')

    return () => {
      setBackUrl(null)
      setTitle('')
    }
  }, [])

  return <MainView />
}

export default MainApp
