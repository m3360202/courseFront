// Types Imports
import { BASE_URL, FILE_PATH } from '@/types'

export const getImg = (img: string | undefined) => {
  if (!img) {
    return ''
  }
  const imgSrc = img.replace(/\\/g, '/')

  return imgSrc?.includes('public/assets/images') ? BASE_URL + imgSrc : FILE_PATH + imgSrc
}
