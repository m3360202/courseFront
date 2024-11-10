'use client'

// Component Imports
import MailProvider from '@/contexts/MailProvider/MailProvider'
import { useGlobal } from '@/hooks/useGlobal'
import { ReactNode, useEffect } from 'react'

const EmailLayout = ({ children }: { children: ReactNode }) => {
  //Hooks
  const { setBackUrl, setTitle } = useGlobal()

  useEffect(() => {
    //setBackUrl([getLocalizedUrl(`/organization/${organizationId}/main`, lang as Locale)])
    setTitle('Email System')

    return () => {
      setBackUrl(null)
      setTitle('')
    }
  }, [])

  return <MailProvider>{children}</MailProvider>
}

export default EmailLayout
