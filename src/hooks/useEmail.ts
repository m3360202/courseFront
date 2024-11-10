import { useContext } from 'react'

import type { MailContextInterface } from '@/contexts/MailProvider/MailContext'
import MailContext from '@/contexts/MailProvider/MailContext'

export const useEmail = (): MailContextInterface => {
  const context = useContext(MailContext)

  if (!context) {
    throw new Error('content must be used within a SettingsProvider')
  }

  return context
}
