'use client'

import { useCallback, useEffect, useState } from 'react'

import ChatContext from './MailContext'
import { OrganizationMail } from '@/types/organization/mail'
import { UserTable } from '@/types/user/UserTable'
import { getMails } from '@/api/organization/email/getOrganizationMails'

interface Props {
  children?: React.ReactNode
}

export default function MailProvider(props: Props) {
  //state
  const { children } = props
  const [mails, setMails] = useState<OrganizationMail[] | null>(null)
  const [currentEmailId, setCurrentEmailId] = useState<string>('')
  const [starredCount, setStarredCount] = useState<number>(0)
  const [inboxCount, setInboxCount] = useState<number>(0)
  const [sentCount, setSentCount] = useState<number>(0)
  const [spamCount, setSpamCount] = useState<number>(0)
  const [draftCount, setDraftCount] = useState<number>(0)

  const loadMails = useCallback(async (user: UserTable, organizationId: string, folder: string, label?: string) => {
    if (user && organizationId) {
      const { data } = await getMails(user, organizationId, folder, label)
      setMails(data.result)
      setInboxCount(data.inboxCount)
      setStarredCount(data.starredCount)
      setSentCount(data.sendCount)
      setSpamCount(data.spamCount)
      setDraftCount(data.draftCount)
    }
  }, [])

  const [refreshMail, setRefreshMail] =
    useState<(user: UserTable, organizationId: string, folder: string, label?: string) => Promise<void>>(loadMails)

  useEffect(() => {
    loadMails && setRefreshMail(() => loadMails)
  }, [loadMails])

  return (
    <ChatContext.Provider
      value={{
        mails,
        currentEmailId,
        starredCount,
        inboxCount,
        sentCount,
        spamCount,
        draftCount,
        refreshMail,
        setMails,
        setCurrentEmailId,
        setInboxCount,
        setStarredCount,
        setSentCount,
        setSpamCount,
        setDraftCount
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}
