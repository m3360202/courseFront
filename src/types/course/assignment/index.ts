import { FileType } from '@/types/file/file'

export type Assignment = {
  _id: string | undefined
  title: string
  description: string
  descriptionObj: any
  postAt?: Date
  time: string
  timeZone: string
  files: FileType[] | undefined
  isPublish: boolean
  totalScore: number | string
  endDate: Date | string
  instructorId?: string
}
