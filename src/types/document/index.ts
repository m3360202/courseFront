import { FileType } from '../file/file'
import { UserTable } from '../user/UserTable'

export type Document = {
  name: string
  postedByUser: Pick<UserTable, 'nickName' | 'username' | 'userImg' | 'email'>
  isFolder: boolean
  folderId: string
} & FileType

export enum DocumentType {
  Course = 'course',
  Organization = 'organization',
  Person = 'person'
}

export type DocumentProps =
  | {
      documentType: DocumentType.Person
      userId: string
      organizationId?: never
    }
  | {
      documentType: DocumentType.Organization
      organizationId: string
      userId?: never
    }
  | {
      documentType: DocumentType.Course
      organizationId?: string
      userId?: string
    }
  | {
      documentType?: never
      organizationId?: string
      userId?: string
    }
