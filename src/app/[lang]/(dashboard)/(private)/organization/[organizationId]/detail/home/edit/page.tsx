'use client'

// React Imports
import { useEffect } from 'react'

import { useGlobal } from '@/hooks/useGlobal'
import { getLocalizedUrl } from '@/utils/i18n'
import { useParams } from 'next/navigation'
import { Locale } from '@/configs/i18n'
import SaveOrganization from '@/views/organization/org-home/component/SaveOrganization'

const EditApp = () => {
  const { setBackUrl } = useGlobal()
  const { lang: locale, organizationId } = useParams()

  useEffect(() => {
    setBackUrl([getLocalizedUrl(`/organization/${organizationId}/detail/home`, locale as Locale)])

    return () => {
      setBackUrl(null)
    }
  }, [])

  return <SaveOrganization />
}

export default EditApp
