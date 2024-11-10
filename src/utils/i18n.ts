// Config Imports
import { i18n } from '@configs/i18n'

// Util Imports
import { ensurePrefix } from '@/utils/string'

// Check if the url is missing the locale
export const isUrlMissingLocale = (url: string) => {
  return i18n.locales.every(locale => !(url.startsWith(`/${locale}/`) || url === `/${locale}`))
}

// Get the localized url
export const getLocalizedUrl = (pathname: string, languageCode: string, original?: boolean): string => {
  if (!pathname || !languageCode) throw new Error("URL or Language Code can't be empty")
  let url = pathname
  if (
    !original &&
    typeof window !== 'undefined' &&
    window.location.href.includes('/organization') &&
    window.location.href.includes('/course') &&
    (window.location.href + url).includes('/detail/course/')
  ) {
    const match = window.location.href.match(/\/organization\/[^\/]+\/[^\/]+/)
    if (match && match.length > 0) url = match[0] + url
  }

  return isUrlMissingLocale(url) ? `/${languageCode}${ensurePrefix(url, '/')}` : url
}
