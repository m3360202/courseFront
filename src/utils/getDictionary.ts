// Third-party Imports
// import 'server-only'

import en from '@/data/dictionaries/en.json'
import fr from '@/data/dictionaries/fr.json'
import ar from '@/data/dictionaries/ar.json'

// Type Imports
import type { Locale } from '@configs/i18n'

const dictionaries = {
  en,
  fr,
  ar
}

export const getDictionary = (locale: Locale) => dictionaries[locale]
