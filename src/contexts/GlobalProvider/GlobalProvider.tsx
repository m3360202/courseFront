'use client'

import { useEffect, useState } from 'react'

import GlobalContext from './GlobalContext'
import type { PermissionIem } from '@/types/Permission'
import { getPermission } from '@/api/user/getPermission'
import { useSession } from 'next-auth/react'
import { UserTable } from '@/types/user/UserTable'
import { useObjectCookie } from '@/@core/hooks/useObjectCookie'
import CookiesKey from '@/types/cookiesKey'
import OrganizationRole from '@/types/organization/organizationRole'

interface Props {
  children?: React.ReactNode
}

export default function GlobalProvider(props: Props) {
  //state
  const { children } = props
  const [permissions, setPermissions] = useState<PermissionIem[] | null>(null)
  const [title, setTitle] = useState<string>('')
  const [topButtons, addTopButtons] = useState<JSX.Element[] | null>(null)
  const [backUrl, setBackUrl] = useState<string[] | null>(null)
  const { data: session } = useSession()
  const [user, setUser] = useState<UserTable | null>(null)
  const [clock, setClock] = useState<string | null>(null)
  const [hiddenTabs, setHiddenTabs] = useState<boolean | null>(null)
  const [organizationRoles, setOrganizationRoles] = useState<OrganizationRole[] | null>(null)
  const [source, setSource] = useState<string | null>(null)


  // Cookies
  const [userCookie, updateUserCookie] = useObjectCookie<UserTable>(CookiesKey.User, null)

  useEffect(() => {
    const loadPermission = async () => {
      if (user) {
        const data = await getPermission(user)

        if (data.data.permissions) setPermissions(data.data.permissions)
      }
    }
    if (user) {
      updateUserCookie(user)
    }

    loadPermission()
  }, [user])

  useEffect(() => {
    if (session && !user) {
      const localUser = {
        ...session.user
      } as UserTable
      setUser(localUser)
    } else if (userCookie) {
      setUser(userCookie)
    }
  }, [session, userCookie])

  return (
    <GlobalContext.Provider
      value={{
        title,
        permissions,
        topButtons,
        backUrl,
        user,
        clock,
        hiddenTabs,
        source,
        organizationRoles,
        setPermissions,
        setTitle,
        setUser,
        addTopButtons,
        setBackUrl,
        setClock,
        setHiddenTabs,
        setOrganizationRoles,
        setSource
      }}
    >
      {children}
    </GlobalContext.Provider>
  )
}
