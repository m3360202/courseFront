import { createContext } from 'react'

import { Organization } from '@/types/organization'

export interface OrganizationContextInterface {
  organization: Organization | undefined
  organizationId: string
  backUrl: string[] | null
  title: string
  viewAllCourse: boolean

  setOrganization: (organization: Organization | undefined) => void
  setOrganizationId: (organizationId: string) => void
  setBackUrl: (backUrl: string[] | null) => void
  setTitle: (title: string) => void
  setViewAllCourse: (viewAllCourse: boolean) => void
}

const OrganizationContext = createContext<OrganizationContextInterface | null>(null)

export default OrganizationContext
