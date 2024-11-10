import { Enrollment } from '@/types/organization/enrollment'
import { UserTable } from '@/types/user/UserTable'
import { transformDateFromUTC } from '../date'
import { UserType } from '@/types/organization'

export const showChipLabel = (item: Enrollment | undefined, user: UserTable | null) => {
  if (!item) return { title: '', canHover: false, color: 'error' }
  if (item.isPublish) {
    if (item.invalid) return { title: 'Expired', canHover: false, color: 'error' }
    else if (transformDateFromUTC(item.startTime as string, user).getTime() > new Date().getTime())
      return { title: 'Pending', canHover: true, color: 'secondary' }
    else if (
      new Date().getTime() >= transformDateFromUTC(item.startTime as string, user).getTime() &&
      new Date().getTime() <= transformDateFromUTC(item.endTime as string, user).getTime()
    )
      return { title: 'Active', canHover: true, color: 'success' }
    else return { title: 'Expired', canHover: false, color: 'error' }
  } else return { title: 'Draft', canHover: false, color: 'info' }
}

export const convertOrganizationUserType = (userType: UserType | undefined) =>
  !userType
    ? ''
    : userType === UserType.PlatformAdmin
      ? 'Manager'
      : userType === UserType.Student
        ? 'Student'
        : 'Instructor'
