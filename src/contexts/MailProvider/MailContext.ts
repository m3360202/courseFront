'use client'

import { OrganizationMail } from '@/types/organization/mail'
import { UserTable } from '@/types/user/UserTable'
import { createContext } from 'react'

export interface MailContextInterface {
  mails: OrganizationMail[] | null
  draftCount: number
  starredCount: number
  inboxCount: number
  sentCount: number
  spamCount: number
  currentEmailId: string
  refreshMail: (user: UserTable, organizationId: string, folder: string, label?: string) => Promise<void>

  setMails: (mails: OrganizationMail[] | null) => void
  setCurrentEmailId: (currentEmailId: string) => void
  setStarredCount: (starredCount: number) => void
  setInboxCount: (inboxCount: number) => void
  setSentCount: (sentCount: number) => void
  setSpamCount: (spamCount: number) => void
  setDraftCount: (draftCount: number) => void
}

const MailContext = createContext<MailContextInterface | null>(null)

export default MailContext
