import { Course } from '@/types/course'
import { FileType } from '@/types/file/file'
import { EnrollmentPolicy } from './policy'
import { EnrollmentSurvey } from './survey'

export type DonationTiers = {
  _id?: string
  amount?: number | undefined
  description?: string | undefined
}

export enum PaymentType {
  Free = 1,
  Flexible = 2,
  Fixed = 3
}

export type Enrollment = {
  customizeDonate: boolean
  collects: string[]
  _id?: string
  instructorId: string
  postedByUser?: string
  postAt?: string
  title: string
  isPublish: boolean
  invalid?: boolean
  startTime: Date | string
  endTime: Date | string
  courseId?: string | Course
  paymentType?: number | string
  amount?: number
  description?: string
  descriptionObj?: any
  banners?: FileType[]
  location?: string
  refund?: string
  donateLater?: boolean
  donationTiers?: DonationTiers[]
  paymentDescription?: string
  policys?: EnrollmentPolicy[] | string[]
  surveys?: EnrollmentSurvey[] | string[]
  courses?: Course[] | string[]
}
