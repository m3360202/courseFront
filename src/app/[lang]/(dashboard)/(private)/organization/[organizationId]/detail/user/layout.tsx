'use client'

import { useGlobal } from '@/hooks/useGlobal'
import { ReactNode, useEffect } from 'react'

const Layout = ({ children }: { params: { organizationId: string; lang: string }; children: ReactNode }) => {
  //Props
  // const { organizationId, lang } = params
  //Hooks
  const { setBackUrl, setTitle } = useGlobal()

  useEffect(() => {
    //setBackUrl([getLocalizedUrl(`/organization/${organizationId}/main`, lang as Locale, true)])
    setTitle('Personnel Management')

    return () => {
      setBackUrl(null)
      setTitle('')
    }
  }, [])

  return <>{children}</>
}

export default Layout
