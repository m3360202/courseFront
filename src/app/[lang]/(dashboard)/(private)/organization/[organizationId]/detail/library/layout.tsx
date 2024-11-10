'use client'

import { useGlobal } from '@/hooks/useGlobal'
import { ReactNode, useEffect } from 'react'

const Layout = ({ children }: { children: ReactNode }) => {
  const { setBackUrl, setTitle } = useGlobal()

  useEffect(() => {
    //setBackUrl([getLocalizedUrl(`/organization/${organizationId}/main`, lang as Locale)])
    setTitle('Library')

    return () => {
      setBackUrl(null)
      setTitle('')
    }
  }, [])

  return <>{children}</>
}

export default Layout
