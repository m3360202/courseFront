'use client'

import { useEffect, type ReactNode } from 'react'

import { useGlobal, useUser } from '@/hooks/useGlobal'
import { getOrganization } from '@/api/organization/getOrganization'
import { useOrganization, useOrganizationManager } from '@/hooks/useOrganization'
import { usePathname } from 'next/navigation'
import OrganizationRole from '@/types/organization/organizationRole'

const OrganizationLayout = ({ params, children }: { params: { organizationId: string }; children: ReactNode }) => {
  //Props
  const { organizationId } = params
  //Hooks
  const { setOrganizationRoles } = useGlobal()
  const { organization, setOrganization, setOrganizationId } = useOrganization()
  const isManager = useOrganizationManager()
  const pathname = usePathname()
  const user = useUser()
  useEffect(() => {
    const loadOrganization = async () => {
      if (organizationId && user) {
        const { data } = await getOrganization(user, organizationId)
        setOrganization(data)
        setOrganizationId(data._id)
      }
    }
    loadOrganization()
  }, [user, organizationId, pathname])

  useEffect(() => {
    let roles: OrganizationRole[] = []
    if (organization) {
      roles = organization?.platformUsers?.find(c => c.userId === user?._id)?.role as OrganizationRole[]
    }
    if (isManager) {
      Object.entries(OrganizationRole)
        .filter(([key]) => isNaN(Number(key)))
        .map(([, value]) =>
          setOrganizationRoles(pre => (pre?.find(c => c === value) ? pre : [...(pre ?? []), value as OrganizationRole]))
        )
    } else setOrganizationRoles(roles)
  }, [isManager, organization, user])

  return <>{children}</>
}

export default OrganizationLayout
