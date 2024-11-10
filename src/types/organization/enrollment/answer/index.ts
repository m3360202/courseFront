import { Topic } from '@/types/course/quiz/topic'

export type EnrollmentAnswer = {
  _id?: string
  instructorId: string
  postedByUser?: string
  postAt?: string
  enrollmentSurveyId: string
  enrollmentPlanId: string
  topic: Topic[]
  collects?: { [key: string]: string }[]
  paymentType?: number
}
