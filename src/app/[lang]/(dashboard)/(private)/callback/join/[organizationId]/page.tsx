'use client'

import { useObjectCookie } from "@/@core/hooks/useObjectCookie";
import { getOrganization } from "@/api/organization/getOrganization";
import { Locale } from "@/configs/i18n";
import { useUser } from "@/hooks/useGlobal";
import CookiesKey from "@/types/cookiesKey";
import { UserTable } from "@/types/user/UserTable";
import { JoinOrganization } from "@/views/organization/main/util";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function JoinCallBack() {
    //Hooks
    const [, setRedirectTo] = useObjectCookie<string | null>(CookiesKey.RedirectTo)
    const { organizationId, lang } = useParams()
    const user = useUser()
    const { push } = useRouter()

    useEffect(() => {
        const joinOrg = async () => {
            if (!user || !organizationId || !lang) return
            const org = await getOrganization(user as UserTable, organizationId as string)
            await JoinOrganization(org.data, user as UserTable, lang as Locale, push)
        }
        joinOrg()

        return (() => {
            setRedirectTo(null)
        })
    }, [user, organizationId, lang])

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                width: '100%'
            }}
        >
            <CircularProgress />

            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: '40px' }}>
                <Typography sx={{ fontSize: '1rem', fontWeight: 'bold', marginRight: '10px' }}>
                    Checking and Joining Organization. Please wait…
                </Typography>
            </div>
        </Box>
    )
}