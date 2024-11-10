import { useContext } from 'react'

import type { ListTableContextInterface } from '@/contexts/ListTableProvider/ListTableContext'
import ListTableContext from '@/contexts/ListTableProvider/ListTableContext'

export const useListTable = (): ListTableContextInterface => {
  const context = useContext(ListTableContext)

  if (!context) {
    throw new Error('content must be used within a SettingsProvider')
  }

  return context
}
