import CustomAvatar from '@/@core/components/mui/Avatar'
import type { UserTable } from '@/types/user/UserTable'
import { getInitialColor, getInitials } from './getInitials'
import { getImg } from '@/utils/getImg'

const getAvatar = (params: Pick<UserTable, 'userImg' | 'name'> & { size?: number; square?: boolean }) => {
  const { userImg, name, size, square } = params

  if (userImg && userImg.startsWith('http')) {
    return <CustomAvatar src={userImg} skin='light' size={size || 34} />
  } else if (userImg && !userImg.startsWith('http')) {
    return (
      <CustomAvatar
        src={getImg(userImg)}
        skin='light'
        size={size || 34}
        variant={square ? 'square' : undefined}
      />
    )
  } else {
    return (
      <CustomAvatar
        skin='filled'
        size={size || 34}
        variant={square ? 'square' : undefined}
        sx={{
          fontSize: size ? `${Math.floor(size / 48) * 1.2}rem` : '1.2rem',
          color: '#ffffff',
          background: getInitialColor(name),
        }}
      >
        {getInitials(name as string)}
      </CustomAvatar>
    )
  }
}

export default getAvatar
