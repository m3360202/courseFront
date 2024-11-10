'use client'

// Next Imports
import { redirect, usePathname } from 'next/navigation'

// Type Imports
import type { Locale } from '@configs/i18n'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { useParams } from 'next/navigation'
import { isJoinUrl } from '@/utils/redirectUrl'

const AuthRedirect = ({ lang }: { lang: Locale }) => {
  const pathname = usePathname()
  const { courseId, organizationId } = useParams()

  // ℹ️ Bring me `lang`
  const redirectUrl = isJoinUrl(pathname) ? pathname.includes('/detail/course') ? `/${lang}/guest-home/course/${courseId}?redirectTo=${pathname}` : `/${lang}/guest-home/organization/${organizationId}?redirectTo=${pathname}` : `/${lang}/login?redirectTo=${pathname}`
  const login = `/${lang}/login`
  const homePage = getLocalizedUrl(themeConfig.homePageUrl, lang)

  return redirect(pathname === login ? login : pathname === homePage ? login : redirectUrl)
}

export default AuthRedirect
