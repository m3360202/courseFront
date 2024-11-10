'use client'

import { useGlobal } from '@/hooks/useGlobal'
import PaymentList from '@/views/organization/payment'
import { useEffect } from 'react'

const PaymentApp = ({ params }: { params: { organizationId: string; lang: string } }) => {
  //Props
  const { organizationId } = params
  //Hooks
  const { setBackUrl, setTitle } = useGlobal()

  useEffect(() => {
    //setBackUrl([getLocalizedUrl(`/organization/${organizationId}/main`, lang as Locale, true)])
    setTitle('Payment Management')

    return () => {
      setBackUrl(null)
    }
  }, [])

  return <PaymentList organizationId={organizationId} />
}

export default PaymentApp
