'use client'

import type { ReactNode } from 'react'
import { useEffect } from 'react'

import { useGlobal } from '@/hooks/useGlobal'
import { useObjectCookie } from '@/@core/hooks/useObjectCookie'
import CookiesKey from '@/types/cookiesKey'
import { useRouter } from 'next/navigation'

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  //Hooks
  const { setTitle } = useGlobal()
  const [redirectTo, setRedirectTo] = useObjectCookie<string | null>(CookiesKey.RedirectTo)
  const { replace } = useRouter()

  useEffect(() => {
    if (redirectTo) {
      replace(redirectTo)
      setRedirectTo(null)

      return
    }
    setTitle('Dashboard')
  }, [redirectTo])

  return <>{children}</>
}

export default DashboardLayout
