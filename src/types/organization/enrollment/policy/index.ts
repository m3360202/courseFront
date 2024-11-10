import { FileType } from '@/types/file/file'

export type EnrollmentPolicy = {
  _id?: string
  instructorId: string
  postedByUser?: string
  postAt?: string
  title: string
  description?: string
  descriptionObj?: any
  usePolicy: boolean
  isPublish: boolean
  policyFile?: FileType[]
  signedFile?: FileType & { userId: string }[]
}

export type EnrollmentSigned = {
  _id?: string
  postedByUser?: string
  postAt?: string
  temporary: string
  final: string
  instructorId: string
  policyId: string
  enrollmentPlanId: string
}
