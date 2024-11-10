import { Student } from '../student'

export type Roster = {
  _id: string
  students?: Student[]
}
export interface InviteStudentParams {
  _id?: string
  instructorId?: string
  code: string
  status?: number
  confirm?:boolean
  userId: string
}

