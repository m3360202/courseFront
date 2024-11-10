'use client'

import { type ReactNode } from 'react'

import OrganizationProvider from '@/contexts/OrganizationProvider/OrganizationProvider'
import CourseProvider from '@/contexts/CourseProvider/CourseProvider'

const OrganizationLayout = ({ children }: { children: ReactNode }) => {
  return (
    <OrganizationProvider>
      <CourseProvider>{children}</CourseProvider>
    </OrganizationProvider>
  )
}

export default OrganizationLayout
