'use client'

import { useEffect} from 'react'

import { useUser } from '@/hooks/useGlobal'
import { getOrganization } from '@/api/organization/getOrganization'
import { useOrganization } from '@/hooks/useOrganization'
import { usePathname } from 'next/navigation'
import MainView from '@/views/organization/main'
import { UserTable } from '@/types/user/UserTable'

const OrganizationLayout = ({ params }: { params: { organizationId: string } }) => {
    //Props
    const { organizationId } = params
    //Hooks
    const { setOrganization, setOrganizationId } = useOrganization()
    const pathname = usePathname()
    const user = useUser()

    useEffect(() => {
        const loadOrganization = async () => {
            if (organizationId) {
                const { data } = await getOrganization(user as UserTable, organizationId)
                setOrganization(data)
                setOrganizationId(data._id)
            }
        }
        loadOrganization()
    }, [organizationId, pathname])



    return <MainView />
}

export default OrganizationLayout
