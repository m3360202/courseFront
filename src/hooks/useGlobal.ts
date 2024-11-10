import { useContext } from 'react'

import type { GlobalContextInterface } from '@/contexts/GlobalProvider/GlobalContext'
import GlobalContext from '@/contexts/GlobalProvider/GlobalContext'

export const useGlobal = (): GlobalContextInterface => {
  const context = useContext(GlobalContext)

  if (!context) {
    throw new Error('content must be used within a SettingsProvider')
  }

  return context
}

export const useUser = () => useGlobal().user

export const useTeacher = () => useGlobal().permissions?.find(c => c.code === '01')?.permission.isAdd === true

export const useStudent = () => !useGlobal().permissions?.find(c => c.code === '01')?.permission.isAdd

