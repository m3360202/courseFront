import { useContext } from 'react'

import type { OrganizationContextInterface } from '@/contexts/OrganizationProvider/OrganizationContext'
import OrganizationContext from '@/contexts/OrganizationProvider/OrganizationContext'
import { useUser } from './useGlobal'
import { Organization, UserType } from '@/types/organization'
import { UserTable } from '@/types/user/UserTable'

export const useOrganization = (): OrganizationContextInterface => {
  const context = useContext(OrganizationContext)

  if (!context) {
    throw new Error('content must be used within a SettingsProvider')
  }

  return context
}

export const useOrganizationManager = (organization?: Organization) => {
  const org = organization || useOrganization().organization
  const user = useUser()
  if (!user) return false
  const isManager: boolean | undefined =
    (org?.userId as UserTable)?._id === user?._id ||
    (org?.userId as string) === user?._id ||
    (org?.postedByUser as UserTable)?._id === user?._id ||
    (org?.postedByUser as string) === user?._id ||
    org?.platformUsers?.find(
      c => (c.userId as UserTable)?._id === user?._id && c.state === 1 && c.userType === UserType.PlatformAdmin
    ) !== undefined

  return isManager
}

export const useOrganizationTeacher = () => {
  let isTeacher: boolean | undefined = undefined
  const user = useUser()
  if (!user) return false
  isTeacher =
    useOrganization().organization?.platformUsers?.find(
      c => (c.userId as UserTable)?._id === user?._id && c.state === 1 && c.userType === UserType.Teacher
    ) !== undefined
  if (isTeacher) return isTeacher

  return false
}

export const useOrganizationStudent = () => {
  let isStudent: boolean | undefined = undefined
  const user = useUser()
  if (!user) return false
  isStudent =
    useOrganization().organization?.platformUsers?.find(
      c => (c.userId as UserTable)?._id === user?._id && c.state === 1 && c.userType === UserType.Student
    ) !== undefined
  if (isStudent) return isStudent

  return false
}

export const useInOrganization = () => {
  if (useOrganizationManager() || useOrganizationTeacher() || useOrganizationStudent()) return true
  else return false
}
