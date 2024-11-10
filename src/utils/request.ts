/* eslint-disable @typescript-eslint/no-explicit-any */
export const Base_URL = true ? process.env.NEXT_PUBLIC_BASE_API + `/api/v1` : `/api/v1`

// import { Box, Typography } from '@mui/material'
import type { AxiosResponse } from 'axios'
import axios from 'axios'

// import { error } from './index'
// import { getTimeZone } from '.'

//axios.defaults.headers.common['x-access-timezone'] = getTimeZone()
const service = axios.create({
  withCredentials: true,
  baseURL: Base_URL,
  timeout: 50000

  // headers: {
  //   'x-access-timezone': getCookie('timeZone')
  // }
})

service.interceptors.request.use(
  config =>

    // 自定义header，可添加项目token
    //  config.headers.token = 'token';
    config,
  function (error: Error) {
    // 对请求错误做些什么
    console.error('api reqeuest error: ', error)

    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response: AxiosResponse<any>) => {
    if (response.status === 200) {
      if (response.data) {
        if (
          response.data.message &&
          response.data.message?.indexOf('$@') !== -1 &&
          response.data.message?.indexOf('!#*$') !== -1
        ) {
          //   error(
          //     <Box display={'flex'} flexDirection={'column'} gap={2}>
          //       <Typography>We have sent the email verification link to your email address:</Typography>
          //       <Typography variant='h6'>{response.data.message.replace('$@', '').replace('!#*$', '')}</Typography>
          //       <Typography>Please complete the email verification before sending emails.</Typography>
          //     </Box>,
          //     8000
          //   )
          throw new Error()
        }

        return response.data
      }
    }

    return Promise.reject(response)
  },
  (error: any) => Promise.reject(JSON.stringify({ message: [error?.response?.data?.message || ''] } || {}))
)

export default service
