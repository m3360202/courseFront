import { BASE_URL, FILE_PATH } from '@/types'

const getCourseImg = (userImg?: string) => {
  const tutorImg = '/images/apps/academy/1.png'
  if (!userImg) return tutorImg

  if (userImg && userImg.startsWith('http')) {

    return userImg
  } else {

    return userImg.includes('public/assets/images') ? BASE_URL + userImg : FILE_PATH + userImg
  }
}

export default getCourseImg
