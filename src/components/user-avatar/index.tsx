import { Typography } from '@mui/material'

import getAvatar from '@/utils/getAvatar'

const UserAvatar = ({
  userImg,
  name,
  hiddenName,
  realName,
  size,
  email,
  square
}: {
  userImg?: string
  name?: string
  hiddenName?: boolean
  size?: number
  email?: string
  square?: boolean
  realName?: string
}) => (
  <div className='flex items-center gap-4'>
    {getAvatar({
      userImg: userImg === 'null' || userImg == 'undefined' || !userImg ? '' : userImg,
      name: name || '',
      size,
      square
    })}

    {(realName || (name && !hiddenName) || email) && (
      <div className=''>
        {realName && (
          <Typography className='font-medium' color='text.primary'>
            {realName}
          </Typography>
        )}
        {name && !hiddenName && (
          <Typography className='font-medium' color='text.primary'>
            {name}
          </Typography>
        )}
        {email && (
          <Typography variant='body2' className='font-sm'>
            {email}
          </Typography>
        )}
      </div>
    )}
  </div>
)

export default UserAvatar
