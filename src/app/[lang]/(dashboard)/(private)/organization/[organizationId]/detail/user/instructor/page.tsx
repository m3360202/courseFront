'use client'

import { UserType } from '@/types/organization'
import UserList from '@/views/organization/user/UserList'

const OrganizationInstructorApp = () => {
  // Vars
  return <UserList userType={UserType.Teacher} />
}

export default OrganizationInstructorApp
