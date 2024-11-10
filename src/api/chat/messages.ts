import { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const sendMessage = async (user: UserTable, body: any) => {
  try {
    const data = await request(user).post('/message/', body)

    return data
  } catch (error) {
    console.log('error in sendmessage api' + error)
  }
}
export const fetchMessages = async (user: UserTable, id: any) => {
  try {
    const data = await request(user).get(`/message/${id}`)
    
    return data
  } catch (error) {
    console.log('error in fetch Message API ' + error)
  }
}
