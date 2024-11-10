'use client'

import { UserType } from '@/types/organization'
import UserList from '@/views/organization/user/UserList'

const OrganizationStudentApp = () => {
  // Vars
  return <UserList userType={UserType.Student} />
}

export default OrganizationStudentApp
