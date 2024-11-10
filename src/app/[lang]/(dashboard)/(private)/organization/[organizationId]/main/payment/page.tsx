'use client'

import { getOrganization } from '@/api/organization/getOrganization'
import { Locale } from '@/configs/i18n'
import { useGlobal, useUser } from '@/hooks/useGlobal'
import { Organization } from '@/types/organization'
import { getLocalizedUrl } from '@/utils/i18n'

import Payment from '@/views/organization/share/payment'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const PaymentApp = ({ params }: { params: { organizationId: string } }) => {
  //States
  const [data, setData] = useState<Organization>()
  const { organizationId } = params

  //Hooks
  const { setBackUrl } = useGlobal()
  const { lang: locale } = useParams()
  const user = useUser()

  useEffect(() => {
    const backUrl = `/organization/${organizationId}/main`
    setBackUrl([getLocalizedUrl(backUrl, locale as Locale)])

    return () => {
      setBackUrl(null)
    }
  }, [])

  useEffect(() => {
    const loadOrganization = async () => {
      if (user && organizationId) {
        const { data } = await getOrganization(user, organizationId)
        setData(data)
      }
    }
    loadOrganization()
  }, [user, organizationId])

  return <Payment organization={data} />
}

export default PaymentApp
