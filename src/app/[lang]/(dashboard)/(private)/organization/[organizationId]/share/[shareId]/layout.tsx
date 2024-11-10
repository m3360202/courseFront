'use client'

import { Locale } from '@/configs/i18n'
import { useGlobal } from '@/hooks/useGlobal'
import { getLocalizedUrl } from '@/utils/i18n'
import { useParams, usePathname } from 'next/navigation'
import { ReactNode, useEffect } from 'react'

const Layout = ({ children }: { children: ReactNode }) => {
  //Hooks
  const { organizationId, shareId, lang } = useParams()
  const { setTitle, setBackUrl } = useGlobal()
  const pathName = usePathname()

  useEffect(() => {
    organizationId &&
      shareId &&
      setBackUrl([getLocalizedUrl(`/organization/${organizationId}/share/${shareId}`, lang as Locale)])
    setTitle('Enrollment Survey')

    return () => {
      setBackUrl(null)
      setTitle('')
    }
  }, [organizationId, shareId, pathName])

  return <>{children}</>
}

export default Layout
