'use client'

import { UserType } from '@/types/organization'
import UserList from '@/views/organization/user/UserList'

const OrganizationManagerApp = () => {
  // Vars
  return <UserList userType={UserType.PlatformAdmin} />
}

export default OrganizationManagerApp
