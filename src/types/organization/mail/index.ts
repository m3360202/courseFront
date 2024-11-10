import { UserTable } from '@/types/user/UserTable'

export type OrganizationMail = {
  _id: string
  recipient: UserTable[]
  userType: string
  title: string
  message: string
  messageObj: any
  createdAt: string
  postedByUser: UserTable
  instructorId: string
  labels: string[]
  isStarred: boolean
  folder: string
  isRead: boolean
}
