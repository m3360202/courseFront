'use client'

import { Dispatch, SetStateAction, createContext } from 'react'

import type { PermissionIem } from '@/types/Permission'
import { UserTable } from '@/types/user/UserTable'
import OrganizationRole from '@/types/organization/organizationRole'

export interface GlobalContextInterface {
  title: string
  topButtons: JSX.Element[] | null
  permissions: PermissionIem[] | null
  backUrl: string[] | null
  user: UserTable | null
  clock: string | null
  hiddenTabs: boolean | null
  organizationRoles: OrganizationRole[] | null
  source: string | null

  setPermissions: (permission: PermissionIem[]) => void
  setTitle: (title: string) => void
  setUser: (user: UserTable) => void
  addTopButtons: (buttons: JSX.Element[] | null) => void
  setBackUrl: (backUrl: string[] | null) => void
  setClock: (clock: string | null) => void
  setHiddenTabs: (loading: boolean | null) => void
  setOrganizationRoles: Dispatch<SetStateAction<OrganizationRole[] | null>>
  setSource: (source: string | null) => void
}

const GlobalContext = createContext<GlobalContextInterface | null>(null)

export default GlobalContext
