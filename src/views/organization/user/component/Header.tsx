// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { useOrganization } from '@/hooks/useOrganization'
import { getLocalizedUrl } from '@/utils/i18n'
import { useParams, useRouter } from 'next/navigation'
import { Locale } from '@/configs/i18n'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import { UserTable } from '@/types/user/UserTable'
import format from '@/utils/format'
import { OrganizationUser } from '@/types/organization'
import { useState } from 'react'
import TargetDialog from '@/components/dialog'
import SendOrgMail from '@/components/send-mail/SendOrgMail'
import ConfirmDialog from '@/components/confirm'
import { deleteOrganizationUser } from '@/api/organization/user/deleteOrganizationUser'
import { useUser } from '@/hooks/useGlobal'
import { success } from '@/utils/toasts'
import delay from '@/utils/delay'
import UserAvatar from '@/components/user-avatar'

const Header = ({ orgUser }: { orgUser: OrganizationUser | undefined }) => {
  //States
  const [mailOpen, setMailOpen] = useState(false)

  //Hooks
  const { organizationId } = useOrganization()
  const { lang: locale } = useParams()
  const { push } = useRouter()
  const user = useUser()

  const handleDelete = async () => {
    await deleteOrganizationUser(user as UserTable, organizationId as string, orgUser?.user?._id as string)
    success('Delete successful!')
    delay(() => {
      push(
        getLocalizedUrl(
          `/organization/${organizationId}/detail/user/${orgUser?.userType?.toLowerCase()}`,
          locale as Locale
        )
      )
    }, 500)
  }

  return (
    <Card>
      <CardContent className='flex gap-6 items-baseline justify-center flex-col  md:flex-row !pt-0 md:justify-start'>
        <div className='flex  z-50 rounded-bs-md mbs-[20px] border-[5px] border-backgroundPaper bg-backgroundPaper'>
          <UserAvatar userImg={orgUser?.user?.userImg} name={orgUser?.user?.username} hiddenName={true} size={120} square={true} />
        </div>
        <div className='flex is-full self-center flex-wrap justify-center flex-col items-center sm:flex-row sm:justify-between sm:items-end gap-5 pt-12'>
          <div className='flex flex-col  items-center sm:items-start gap-2'>
            <Typography variant='h4'>{orgUser?.user?.nickName || orgUser?.user?.username}</Typography>
            <div className='flex flex-wrap gap-2 justify-center items-center'>
              <i className='ri-time-line' />
              <Typography>Join the organization on {format(orgUser?.joinTime)}</Typography>
            </div>
          </div>
          <div className='flex gap-4'>
            <Button
              variant='contained'
              className='flex gap-2'
              onClick={() => {
                push(getLocalizedUrl(`/account/${orgUser?.user?._id}/profile/`, locale as Locale))
              }}
            >
              <i className='ri-profile-line' />
              <span>Profile</span>
            </Button>
            <TargetDialog
              title='Send Mail'
              open={mailOpen}
              setOpen={setMailOpen}
              content={<SendOrgMail setOpen={setMailOpen} selectValue={orgUser?.user ? [orgUser.user] : undefined} />}
              width={'80%'}
            >
              <Button variant='contained' className='flex gap-2'>
                <i className='ri-mail-line' />
                <span>Send mail</span>
              </Button>
            </TargetDialog>
            <ConfirmDialog confirm={handleDelete}>
              <Button variant='contained' className='flex gap-2'>
                <i className='ri-delete-bin-line' />
                <span>Delete</span>
              </Button>
            </ConfirmDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default Header
