import { FileType } from '../../file/file'
import { AnswerLimit } from './answerLimit'
import { Topic } from './topic'

export type Quiz = {
  _id: string
  title: string
  isShow: boolean
  isPublish: boolean
  postAt?: Date
  topic: Topic[]
  endDate: Date | undefined
  instructorId: string
  file: FileType[]
  startTime?: string | Date
  endTime?: string | Date
  limit: number
  submitType: number
  quizType: number
  totalScore: number
  time: string
  timeZone: string
  quizLimit: AnswerLimit[]
}

export type SubmitQuiz = {
  _id?: string
  userId?: string
  quizId?: string
  isDraft?: boolean
  topic?: Topic[]
  answer?: string
  limit?: number
  studentId?: string
  time?: string
  timeZone?: string
  totalGrade?: number
  score?: string
  grade?: string
  name?: string
  userImg?: string
  isSubmit?: boolean
  email?: string
}
