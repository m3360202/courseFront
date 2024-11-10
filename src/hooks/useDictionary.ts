import { useParams } from 'next/navigation'

import type { Locale } from '@/configs/i18n'
import { getDictionary } from '@/utils/getDictionary'

export const useDictionary = () => {
  const { lang: locale } = useParams()

  
return getDictionary(locale as Locale)
}
