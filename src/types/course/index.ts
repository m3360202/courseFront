import { getDictionary } from '@/utils/getDictionary'
import type { Locale } from '@/configs/i18n'
import { Student } from './student'
import { UserTable } from '../user/UserTable'
import { Session } from './session'

export interface Course {
  _id: string
  title: string
  description?: string
  descriptionObj?: any
  startTime: Date | string
  endTime: Date | string
  lessonStartTime: Date | string
  labels?: { id: string; title: string }[] | null
  totalLessons: number
  lessonDuration: number
  timetable: Array<number>
  timeZone: string
  instructorId?: string
  lessons?: []
  offline?: boolean
  capacity?: number
  joinType?: number
  deadline?: Date | string
  isPrivate?: number
  address?: string
  classroom?: string
  paymentType?: number
  amount?: number
  donateLater?: boolean
  isCustomizeDonate?: boolean
  // donationTiers?: DonationTiers[]
  paymentDescription?: string
  code: string
  students?: Student[]
  user?: UserTable
  isAdd?: boolean
  isEdit?: boolean
  sessionStatus?: string
  postAt?: Date | string
  nextSession?: Session | null | undefined
}

export enum ArrangeType {
  unarranged = 'unarranged',
  arranged = 'arranged',
  autoArrangement = 'autoArrangement',
  instructorUserCourse = 'instructorTeacher'
}

export const joinTypes = (local: Locale) => {
  const dictionary = getDictionary(local)

  return [
    dictionary.course.afterApproval,
    dictionary.course.autoJoin,
    dictionary.course.preRegister,
    dictionary.course.studentPay
  ]
}
