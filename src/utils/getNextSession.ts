import isFinished from './isFinished'
import type { Session } from '@/types/course/session'

const getNextSession = (lessons: Session[], offline: boolean, timeZone: string | undefined) => {
  if (!timeZone) return ''

  try {
    let sessions = lessons || []

    // 如果课程是离线的，更新lessons数组
    if (offline) {
      sessions = sessions.map(item => ({
        ...item,
        offline
      }))
    }

    // 过滤出还未完成的课程
    const filterLessons = sessions.filter(session => {
      return !isFinished(session.lessonDate, session.lessonStartTime, session.lessonDuration, timeZone)
    })

    // 查找下一个课程
    let nextSession = null

    if (filterLessons.length > 0) {
      nextSession = filterLessons.reduce((max, current) => {
        return current.lessonDate < max.lessonDate ? current : max
      })
    }

    return nextSession
  } catch (error) {
    console.error('Error in getNextLesson:', error)
    throw error
  }
}

export default getNextSession
