import { UserTable } from '@/types/user/UserTable'

const gotoMeet = (
  user: UserTable,
  courseId: string,
  sessionId: string,
  sessionName: string,
  isTeacher: boolean,
  isParent?: boolean
) => {
  const userId = user?._id
  const nickName = user.name
  const url = `${
    process.env.NEXT_PUBLIC_MEET_URL
  }/${sessionId}?courseId=${courseId}&lessonId=${sessionId}&aid=${userId}&nickName=${nickName}&lessonName=${sessionName}&isTeacher=${
    isTeacher
  }&isParent=${isParent}`
  window.open(url)
}

export default gotoMeet
