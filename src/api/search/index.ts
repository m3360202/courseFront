import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'
import { Organization } from '@/types/organization'
import { Course } from '@/types/course'

interface searchOrgsParams {
  user: UserTable
  text?: string
  type?: number
}

export const searchOrgs = (params: searchOrgsParams) =>
  request(params.user).get<unknown, { data: Array<Organization> }>(`/institution/search`, {
    params: {
      text: params.text,
      type: params.type || 0
    }
  })

interface searchCourseParams {
  user: UserTable
  params: {
    text?: string
    type?: number
    startTime?: string
    endTime?: string
    week?: number[]
    address?: string
    classroom?: string
    userId?: string
  }
}

export const searchCourses = ({ user, params }: searchCourseParams) =>
  request(user).get<unknown, { data: Array<Course> }>(`/course/search`, {
    params
  })
