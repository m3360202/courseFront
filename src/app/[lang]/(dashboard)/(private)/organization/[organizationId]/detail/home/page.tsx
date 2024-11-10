'use client'

import { useGlobal } from '@/hooks/useGlobal'
import OrgHome from '@/views/organization/org-home'
import { useEffect } from 'react'

const OrgHomeApp = () => {
  //Props
  // const { organizationId, lang } = params
  //Hooks
  const { setBackUrl, setTitle } = useGlobal()

  useEffect(() => {
    //setBackUrl([getLocalizedUrl(`/organization/${organizationId}/my-space`, lang as Locale, true)])
    setTitle('Organization Home')

    return () => {
      setBackUrl(null)
      setTitle('')
    }
  }, [])

  return <OrgHome />
}

export default OrgHomeApp
