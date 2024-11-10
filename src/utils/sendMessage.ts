import { acessCreate } from '@/api/chat/chat'
import { UserTable } from '@/types/user/UserTable'
import { getLocalizedUrl } from './i18n'
import { Locale } from '@/configs/i18n'
import { NavigateOptions } from 'next/dist/shared/lib/app-router-context.shared-runtime'

const sendMessage = async (
  user: UserTable,
  contactUserId: string,
  lang: string,
  push: (href: string, options?: NavigateOptions | undefined) => void
) => {
  await acessCreate(user, { userId: contactUserId })

  push(getLocalizedUrl(`/chat`, lang as Locale))
}

export default sendMessage
