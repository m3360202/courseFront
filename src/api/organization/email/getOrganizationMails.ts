import { OrganizationMail } from '@/types/organization/mail'
import { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const getMails = (user: UserTable, organizationId: string, folder: string, label?: string) =>
  request(user).get<
    unknown,
    {
      data: {
        result: OrganizationMail[]
        starredCount: number
        inboxCount: number
        sendCount: number
        spamCount: number
        draftCount: number
      }
    }
  >(`/mail/list`, {
    params: { instructorId: organizationId, folder, label }
  })
