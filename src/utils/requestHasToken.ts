import type { UserTable } from '@/types/user/UserTable'
import axios from '@/utils/request'

// import jwt from 'jsonwebtoken'
// import getTimeZone from './getTimeZone'

// const apply_filter = (obj: any, filter: any) => {
//   let newObj: any = {}
//   for (let key in filter) {
//     if (filter.hasOwnProperty(key) && filter[key] === 1) {
//       newObj[key] = obj[key]
//     }
//   }
//   return newObj
// }

// const getToken = (obj: UserTable) => {
//   if (!obj) return ''
//   const token = jwt.sign(
//     {
//       data: apply_filter(obj, {
//         _id: 1,
//         email: 1,
//         recordEmail: 1,
//         username: 1,
//         userImg: 1,
//         bkgImg: 1,
//         code: 1
//       })
//     },
//     'xtatic_auth',
//     {
//       expiresIn: '24h'
//     }
//   )
//   return token
// }

const request = (user: UserTable) => {
  axios.defaults.headers.common['x-access-token'] = user?.activationToken //getToken(user)
  axios.defaults.headers.common['x-access-timezone'] = user?.timeZone

  return axios
}

export default request
