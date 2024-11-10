import { UserTable } from "../user/UserTable"

export enum FolderOrigin {
  Course = 'course'
}

export type Folder = {
  _id: string
  name: string
  userId: string
  origin: FolderOrigin
  originId: string
  parentId: string
  size: number
  isFolder: boolean
  postedByUser: Pick<UserTable, 'nickName' | 'username' | 'userImg'>
  postAt: Date
}
