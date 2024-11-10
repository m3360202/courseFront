import { Topic } from '@/types/course/quiz/topic'

export type EnrollmentSurvey = {
  _id?: string
  instructorId: string
  postedByUser?: string
  postAt?: string
  title: string
  isPublish: boolean
  topic: Topic[]
}
