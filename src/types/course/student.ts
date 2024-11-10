import { FileType } from '../file/file'
import { UserExtend } from '../user/UserTable'

export enum StudentStatus {
  Paying = -1,
  Active = 0,
  Reject = 1,
  Accept = 2,
  Wating = 3
}

export type Student = {
  _id?: string
  code?: string
  userId?: string | string[]
  status?: StudentStatus | string
  applyType?: number
  name?: string
  username?: string
  nickName?: string
  userImg?: string
  lessonStatus?: string
  reason?: string
  duration?: number
  email?: string
  checked?: boolean
  isSubmit?: boolean
  score?: string | number
  grade?: string
  files?: FileType[]
  collects?: UserExtend[]
  realName?: string
  submitTime?: string
}

export type StatusList = { _id: string; title: string; count: number; icon?: string; sort?: number }

export type StudentStatusList = {
  id: string
  statusCountList: StatusList[]
  isManual: boolean
  students: Student[]
}
