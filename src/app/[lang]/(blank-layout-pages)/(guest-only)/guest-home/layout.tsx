'use client'
import Logo from "@/@core/svg/Logo"
import { Locale } from "@/configs/i18n"
import { getLocalizedUrl } from "@/utils/i18n"
import { Button } from "@mui/material"
import Link from "next/link"
import { useParams } from "next/navigation"
import CourseProvider from "@/contexts/CourseProvider/CourseProvider"
import OrganizationProvider from "@/contexts/OrganizationProvider/OrganizationProvider"

const HomePage = ({ children }: { children: React.ReactNode }) => {
    const { lang } = useParams()

    return <CourseProvider>
        <OrganizationProvider>        <div className="flex flex-col gap-5 pl-10 pr-10 pt-5">
            <div className='flex  justify-between'>
                <Logo />
                <div className="flex gap-2">
                    <Button variant="contained" component={Link} href={getLocalizedUrl('/login', lang as Locale, true)}>Login</Button>
                    <Button variant="outlined" component={Link} href={getLocalizedUrl('/register', lang as Locale, true)}>Register</Button>
                </div>
            </div>
            {children}
        </div>
        </OrganizationProvider>
    </CourseProvider>
}

export default HomePage
