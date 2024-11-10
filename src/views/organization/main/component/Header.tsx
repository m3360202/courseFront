// MUI Imports
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

// Hooks Imports
import { useInOrganization, useOrganization, useOrganizationManager } from '@/hooks/useOrganization'

// Next Imports
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

// Thiird parts Imports
import { Locale } from '@/configs/i18n'
import { Swiper, SwiperSlide } from 'swiper/react'
import { error, success } from '@/utils/toasts'
import { getLocalizedUrl } from '@/utils/i18n'
import PermissionButton from '@/components/buttons/PermissionButton'
import { getImg } from '@/utils/getImg'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import { useEffect, useState } from 'react'
import ConfirmDialog from '@/components/confirm'
import { useUser } from '@/hooks/useGlobal'
import { UserTable } from '@/types/user/UserTable'
import { Organization } from '@/types/organization'
import { JoinOrganization } from '../util'
import TargetDialog from '@/components/dialog'
import NotAuthorized from '@/views/NotAuthorized'

const Header = () => {
  //States
  const [open, setOpen] = useState(false)

  //Hooks
  const { organization, viewAllCourse, setViewAllCourse, setOrganization } = useOrganization()
  const inOrg = useInOrganization()
  const isManager = useOrganizationManager()
  const { lang: locale } = useParams()
  const user = useUser()
  const { push } = useRouter()

  useEffect(() => {
    return () => {
      setViewAllCourse(false)
    }
  }, [])

  const getDesc = () => {
    const desc = organization?.description?.replace(/\n/g, '<br/>')
    if (!desc) return ''
    else if (desc.length > 500) return desc.substring(0, 500) + '...'
    else return desc
  }

  const title = organization?.platformUsers?.find(
    c => c.applyType === 1 && c.state === 2 && (c.userId as UserTable)?._id === user?._id
  )
    ? 'Apply again '
    : organization?.platformUsers?.find(
      c => c.applyType === 1 && c.state === 0 && (c.userId as UserTable)?._id === user?._id
    )
      ? 'Cancel to join'
      : 'Join'

  const handleJoin = async () => {
    if (!user) {
      setOpen(true)

      return
    }
    await JoinOrganization(organization as Organization, user as UserTable, locale as Locale, push, title, success, error, setOrganization)
    // if (organization?.noEnrollmentPlan) {
    //   switch (organization.joinType) {
    //     case 0:
    //       await pushOrganizationUser(user as UserTable, organization._id as string, 'undefined')
    //       success('You have successfully joined the organization.')
    //       break
    //     case 1:
    //       if (organization?.platformUsers?.find(c => c.applyType === 1 && (c.userId as UserTable)?._id === user?._id)) {
    //         await deleteOrganizationUser(user as UserTable, organization._id as string, user?._id as string)
    //         success(`${title} successful`)
    //       } else {
    //         await addOrganizationUser(
    //           user as UserTable,
    //           organization._id as string,
    //           user?._id as string,
    //           UserType.Student,
    //           [],
    //           1
    //         )
    //         success(`Apply successful, please wait for the organization's review`)
    //       }
    //       break
    //   }
    //   const { data } = await getOrganization(user as UserTable, organization._id as string)
    //   setOrganization(data)
    // } else {
    //   if (!organization?.joinEnrollmentPlan) {
    //     error('No enrollment plan')

    //     return
    //   }

    //   push(
    //     getLocalizedUrl(`/organization/${organization._id}/share/${organization.joinEnrollmentPlan}`, locale as Locale)
    //   )
    // }
  }

  return (
    <Card>
      {organization?.orgBanners && organization.orgBanners.length > 0 ? (
        <Swiper
          id='customer_swiper'
          navigation={true}
          pagination={false}
          slidesPerView={1}
          spaceBetween={16}
          autoplay={{ delay: 5000 }}
          loop={true}
          className='bs-[250px]'
        >
          {organization?.orgBanners?.map(img => (
            <SwiperSlide key={img._id} style={{ display: 'flex' }}>
              <CardMedia image={getImg(img.temporary)} className=' w-full h-full' />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <CardMedia image={`/images/pages/profile-banner.png`} className='bs-[250px]' />
      )}

      <CardContent className='flex gap-6 items-baseline justify-center flex-col  md:flex-row !pt-0 md:justify-start'>
        <div className='flex  z-50 rounded-bs-md mbs-[-45px] border-[5px] border-backgroundPaper bg-backgroundPaper'>
          {organization?.orgImg ? (
            <img
              height={120}
              width={120}
              src={getImg(organization?.orgImg?.temporary)}
              className='rounded object-cover'
              alt=''
            />
          ) : (
            <div style={{ width: 120, height: 120, border: '1px solid rgb(46 38 61 / 0.12)' }} className='rounded' />
          )}
        </div>
        <div className='flex is-full self-center flex-wrap justify-center flex-col items-center sm:flex-row sm:justify-between sm:items-end gap-5 mt-4'>
          <div className='flex flex-col  items-center sm:items-start gap-2'>
            <Typography variant='h4'>{organization?.name}</Typography>
            <div className='flex flex-wrap gap-6 justify-center sm:justify-normal flex-col'>
              <div className='flex gap-6'>
                {organization && organization.email && (
                  <div
                    className='flex items-center gap-2 cursor-pointer'
                    onClick={async () => {
                      await navigator.clipboard.writeText(organization.email as string)
                      success('Copy Success!')
                    }}
                  >
                    <i className='ri-mail-line text-textSecondary' />
                    <Typography className='font-medium'>{organization?.email}</Typography>
                  </div>
                )}
                {organization && organization.phone && (
                  <div
                    className='flex items-center gap-2 cursor-pointer'
                    onClick={async () => {
                      await navigator.clipboard.writeText(organization.phone as string)
                      success('Copy Success!')
                    }}
                  >
                    <i className='ri-phone-line text-textSecondary' />
                    <Typography className='font-medium'>{organization?.phone}</Typography>
                  </div>
                )}
                {organization && organization.website && (
                  <div
                    className='flex items-center gap-2 cursor-pointer'
                    onClick={() => {
                      if (organization.website && !organization.website.startsWith('http')) {
                        window.open(`https://${organization.website}`)
                      } else {
                        window.open(organization.website)
                      }
                    }}
                  >
                    <i className='ri-global-line text-textSecondary' />
                    <Typography className='font-medium' noWrap maxWidth={200}>
                      {organization?.website}
                    </Typography>
                  </div>
                )}

                {organization && organization.address && (
                  <div className='flex items-center gap-2'>
                    <i className='ri-map-pin-line w-[40px] h-[24px]' />
                    <Typography className='font-medium'>
                      {organization?.address}
                    </Typography>
                  </div>
                )}
              </div>
              <Typography
                title={organization?.description}
                sx={{ pt: 2, pb: 2, maxWidth: 640, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
                dangerouslySetInnerHTML={{
                  __html: getDesc()
                }}
              />
            </div>
          </div>
          <div className='flex gap-4 justify-end w-full'>

            <PermissionButton isShow={isManager}>
              <Button variant='contained' className='flex gap-2' onClick={() => {
                push(getLocalizedUrl(`/organization/${organization?._id}/detail/home`, locale as Locale))
              }}>
                Organization Management
              </Button>
            </PermissionButton>

            <PermissionButton isShow={!inOrg && organization?.isJoinEnrollmentPlanButton && organization?.noEnrollmentPlan}>
              <ConfirmDialog title={title} confirm={handleJoin}>
                <Button variant='contained' className='flex gap-2'>
                  {title}
                </Button>
              </ConfirmDialog>
            </PermissionButton>

            <PermissionButton isShow={!inOrg && organization?.isJoinEnrollmentPlanButton && !organization?.noEnrollmentPlan}>
              <Button variant='contained' className='flex gap-2' onClick={handleJoin}>
                Join
              </Button>
            </PermissionButton>

            <PermissionButton isShow={organization?.isDonateButton && user !== null && user !== undefined}>
              <Button
                variant='contained'
                className='flex gap-2'
                component={Link}
                href={getLocalizedUrl(`/organization/${organization?._id}/main/payment`, locale as Locale)}
              >
                {'Donate'}
              </Button>
            </PermissionButton>
            <PermissionButton
              isShow={
                organization?.isViewCourseButton &&
                (organization.viewCourseRole === 1 || (organization.viewCourseRole === 2 && inOrg))
              }
            >
              <Button variant='contained' className='flex gap-2' onClick={() => setViewAllCourse(!viewAllCourse)}>
                {viewAllCourse ? 'Back home' : 'View all courses'}
              </Button>
            </PermissionButton>
            <PermissionButton isShow={user !== null && user !== undefined}>
              <Button
                variant='contained'
                className='flex gap-2'
                component={Link}
                href={getLocalizedUrl(`/organization/${organization?._id}/my-space`, locale as Locale)}
              >
                {'My space'}
              </Button>
            </PermissionButton>
            <PermissionButton isShow={isManager}>
              <Button
                variant='contained'
                className='flex gap-2'
                component={Link}
                href={getLocalizedUrl(`/organization/${organization?._id}/main/edit`, locale as Locale)}
              >
                <i className='ri-pencil-line'></i>
                <span>Edit</span>
              </Button>
            </PermissionButton>
          </div>
        </div>
      </CardContent>
      <TargetDialog title='Authorized' content={<NotAuthorized mode='system' />} open={open} setOpen={setOpen} />
    </Card>
  )
}

export default Header
