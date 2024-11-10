import { upload } from '@/api/upload'
import { BASE_URL } from '@/types'
import { UserTable } from '@/types/user/UserTable'

const uploadFile = async (user: UserTable, file?: File | undefined) => {
  const { path } = await upload(user, file)

  return path
}

export default uploadFile

export const updateLoadImage = (user: UserTable, file: File): Promise<{ data: { link: string } }> => {
  return new Promise(async (resolve, reject) => {
    try {
      const { path } = await upload(user, file)
      resolve({ data: { link: BASE_URL + path } })
    } catch (err) {
      reject(err)
    }
  })
}
