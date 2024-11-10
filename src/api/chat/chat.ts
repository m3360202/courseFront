import { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'
import { success } from '@/utils/toasts'

export const acessCreate = async (user: UserTable, body: any) => {
  request(user).post('/chat', body)
}

export const fetchAllChats = async (user: UserTable) => {
  try {
    const data = await request(user).get('/chat')

    return data
  } catch (error) {
    console.log('error in fetch all chats api')
  }
}
export const createGroup = async (user: UserTable, body: any) => {
  try {
    const data = await request(user).post('/chat/group', body)
    success(`${data.data.chatName} Group Created`)

    return data
  } catch (error) {
    console.log('error in create group api')
  }
}
export const addToGroup = async (user: UserTable, body: any) => {
  try {
    const data = await request(user).patch('/chat/groupAdd', body)

    return data
  } catch (error) {
    console.log('error in addtogroup api')
  }
}
export const renameGroup = async (user: UserTable, body: any) => {
  try {
    const data = await request(user).patch('/chat/group/rename', body)

    return data
  } catch (error) {
    console.log('error in rename group api')
  }
}
export const removeChat = async (user: UserTable, body: any) => {
  try {
    const data = await request(user).put('/chat/remove', body)
    
    return data
  } catch (error) {
    console.log('error in rename group api')
  }
}
// export const removeUser = async (body: any) => {
//   try {
//     const token = localStorage.getItem('userToken')
//     const { data } = await API(token).patch('/api/chat/groupRemove', body)
//     return data
//   } catch (error) {
//     console.log('error in remove user api')
//   }
// }
