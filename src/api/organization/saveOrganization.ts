import { Organization } from '@/types/organization'
import { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

const addOrganization = (user: UserTable, organization: Organization) =>
  request(user).put<unknown, { data: Organization }>(`institution/update`, { ...organization })

const editOrganization = (user: UserTable, organization: Organization) =>
  request(user).put<unknown, { data: Organization }>(`institution/update`, { ...organization })

const saveOrganization = (user: UserTable, organization: Organization) => {
  if (organization._id) return editOrganization(user, organization)
  else return addOrganization(user, organization)
}

export default saveOrganization
