import { Label } from '@/types/label'

export enum TopicType {
  Single,
  Multiple,
  FillIn,
  TrueOrFalse,
  ShortAnswer
}

export type TopicItem = {
  _id?: string
  title: string
  checked?: boolean
  file?: string
  answer?: string
  label?: Label
}

export type Topic = {
  _id?: string
  quizId?: string
  title: string
  isMultiple?: boolean
  isInput?: boolean
  inputValue?: string
  isImage?: boolean
  questionType: TopicType //0:单选，1：多选，2：简答
  score?: number
  grade?: number
  value?: string[]
  items?: Array<TopicItem>
  choice?: number
  refId?: string
  isShow?: boolean
  sort?: number
  required?: boolean
  expand?: boolean
}
