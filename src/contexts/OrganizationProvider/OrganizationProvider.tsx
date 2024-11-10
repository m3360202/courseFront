import { useState } from 'react'

import OrganizationContext from './OrganizationContext'
import { Organization } from '@/types/organization'

interface Props {
  children?: React.ReactNode
}

export default function OrganizationProvider(props: Props) {
  const { children } = props

  const [organizationId, setOrganizationId] = useState<string>('')
  const [organization, setOrganization] = useState<Organization>()
  const [backUrl, setBackUrl] = useState<string[] | null>(null)
  const [title, setTitle] = useState<string>('')
  const [viewAllCourse, setViewAllCourse] = useState<boolean>(false)

  return (
    <OrganizationContext.Provider
      value={{
        organization,
        organizationId,
        backUrl,
        title,
        viewAllCourse,
        setOrganization,
        setOrganizationId,
        setBackUrl,
        setTitle,
        setViewAllCourse
      }}
    >
      {children}
    </OrganizationContext.Provider>
  )
}
