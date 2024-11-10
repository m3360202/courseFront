import { Locale } from "@/configs/i18n"

import { NavigateOptions } from "next/dist/shared/lib/app-router-context.shared-runtime"

export const isJoinUrl = (url: string) => {
    return url.includes('/organization') && (url.includes('/main') || url.includes('/detail/course'))
}

export const redirectUrl = (url: string, id: string, lang: Locale, push: (href: string, options?: NavigateOptions) => void) => {
    if (isJoinUrl(url)) {
        if (url.includes('/detail/course'))
            push(`/${lang}/guest-home/course/${id}?redirectTo=${url}`)
        else
            push(`/${lang}/guest-home/organization/${id}?redirectTo=${url}`)
    }
}
