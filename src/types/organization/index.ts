import { Course } from '../course'
import { FileType } from '../file/file'
import { UserTable } from '../user/UserTable'
import { Schedule, TeachCourse } from './schedule'

export enum UserType {
  Student = 'Student',
  Teacher = 'Teacher',
  PlatformAdmin = 'PlatformAdmin'
}

export interface PlatformUser {
  enrollmentAwswer: any
  feeSum: any
  id: string
  _id: string
  userType: UserType
  userId?: UserTable | string
  postedByUser?: UserTable | string
  state: number
  role: number[]
  visible: boolean
  checked?: boolean
  applyType?: number
}

export type Organization = {
  invitationCode: string
  _id: string
  id: string
  userId: UserTable | string
  postedByUser: UserTable | string
  name: string
  planId?: string
  stripeKey?: string
  description?: string
  descriptionObj?: any
  organization: string
  orgImg?: FileType
  createdAt?: string
  schedules?: Schedule[]
  teachCourses?: TeachCourse[]
  orgBanners?: FileType[]
  platformUsers?: PlatformUser[]
  email?: string
  phone?: string
  website?: string
  address?: string
  feeSum?: number
  enrollmentAwswer?: any
  defineContent?: string
  defineContentObj?: any
  defineCourses?: { id: Course | string; type?: number }[]
  defineTeachers?: { id: UserTable | string; type?: number }[]
  //   defineEnrollmentPlans?: { id: PlanResponseParams }[]
  isJoinEnrollmentPlanButton?: boolean
  joinEnrollmentPlan?: string
  isViewCourseButton?: boolean
  viewCourseRole?: number
  isCustomizeDonate?: boolean
  isDonateButton?: boolean
  donationTiers?: { _id?: string; amount?: number; description?: string }[]
  noEnrollmentPlan?: boolean
  joinType?: number
  img?: string
}

export type OrganizationUser = {
  instructorId: string
  user: UserTable
  joinTime: Date
  resume: FileType[]
  background: FileType[]
  schedule: Schedule[]
  courseCount: number
  visible: boolean
  userType: UserType
}
