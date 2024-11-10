import request from '@/utils/request'
import type { InviteStudentParams } from '@/types/course/roster/index'

export const applyInvite = (inviteStudent: InviteStudentParams) =>
  request.post<unknown, { success: boolean; message: string;instructorId:string;courseId:string;confirm:boolean }>(
    `/course/applyCourse`,
    { ...inviteStudent }
  )
