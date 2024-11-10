import { getOrganization } from "@/api/organization/getOrganization"
import { addOrganizationUser, pushOrganizationUser } from "@/api/organization/user/addOrganizationUser"
import { deleteOrganizationUser } from "@/api/organization/user/deleteOrganizationUser"
import { Locale } from "@/configs/i18n"

import { Organization, UserType } from "@/types/organization"
import { UserTable } from "@/types/user/UserTable"
import { getLocalizedUrl } from "@/utils/i18n"
import { NavigateOptions } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { ToastContent } from "react-toastify"

export const JoinOrganization = async (organization: Organization, user: UserTable, locale: Locale, push: (href: string, options?: NavigateOptions) => void, title?: string, success?: (message: ToastContent) => void, error?: (message: ToastContent) => void, setOrganization?: (organization: Organization | undefined) => void) => {
    const orgMainUrl = getLocalizedUrl(`/organization/${organization._id}/main`, locale as Locale)
    const inOrg = (organization?.userId as UserTable)?._id === user?._id ||
        (organization?.userId as string) === user?._id ||
        (organization?.postedByUser as UserTable)?._id === user?._id ||
        (organization?.postedByUser as string) === user?._id ||
        organization?.platformUsers?.find(
            c => (c.userId as UserTable)?._id === user?._id && c.state === 1
        ) !== undefined
    if (inOrg) {
        if (error) error('You are already a member of this organization!')
        else push(
            orgMainUrl
        )
        
        return
    }
    if (organization?.noEnrollmentPlan) {
        switch (organization.joinType) {
            case 0:
                await pushOrganizationUser(user as UserTable, organization._id as string, 'undefined')
                if (success) success('You have successfully joined the organization.')
                else push(
                    orgMainUrl
                )
                break
            case 1:
                if (organization?.platformUsers?.find(c => c.applyType === 1 && (c.userId as UserTable)?._id === user?._id)) {
                    await deleteOrganizationUser(user as UserTable, organization._id as string, user?._id as string)
                    if (success) success(`${title} successful`)
                    else push(
                        orgMainUrl
                    )
                } else {
                    await addOrganizationUser(
                        user as UserTable,
                        organization._id as string,
                        user?._id as string,
                        UserType.Student,
                        [],
                        1
                    )
                    if (success) success(`Apply successful, please wait for the organization's review`)
                    else push(
                        orgMainUrl
                    )
                }
                break
        }
        if (setOrganization) {
            const { data } = await getOrganization(user as UserTable, organization._id as string)
            setOrganization(data)
        }
    } else {
        if (!organization?.joinEnrollmentPlan) {
            if (error) error('No enrollment plan')
            else push(
                orgMainUrl
            )

            return
        }

        push(
            getLocalizedUrl(`/organization/${organization._id}/share/${organization.joinEnrollmentPlan}`, locale as Locale)
        )
    }
}
