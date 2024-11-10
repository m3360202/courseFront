// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { useOrganization, useOrganizationManager } from '@/hooks/useOrganization'
import PermissionButton from '@/components/buttons/PermissionButton'
import Link from 'next/link'
import { getLocalizedUrl } from '@/utils/i18n'
import { useParams } from 'next/navigation'
import { Locale } from '@/configs/i18n'
import { UserTable } from '@/types/user/UserTable'
import format from '@/utils/format'
import { getImg } from '@/utils/getImg'

const Header = ({ isOrgHome }: { isOrgHome?: boolean }) => {
  //Hooks
  const { organization } = useOrganization()
  const isManager = useOrganizationManager()
  const { lang: local } = useParams()

  const getDesc = () => {
    const desc = organization?.description?.replace(/\n/g, '<br/>')
    if (!desc) return ''
    else if (desc.length > 500) return desc.substring(0, 500) + '...'
    else return desc
  }

  return (
    <Card>
      <CardContent className='flex gap-6 items-baseline justify-center flex-col  md:flex-row  md:justify-center'>
        <div className='flex   rounded-bs-md  border-[5px] border-backgroundPaper bg-backgroundPaper'>
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
        <div className='flex is-full self-center flex-wrap justify-center flex-col items-center sm:flex-row sm:justify-between sm:items-end gap-5'>
          <div className='flex flex-col  items-center sm:items-start gap-2'>
            <Typography variant='h4'>{organization?.name}</Typography>
            <Typography variant='h6'>{organization?.organization}</Typography>
            <Typography>
              Owner:{(organization?.userId as UserTable)?.nickName || (organization?.userId as UserTable)?.username}
            </Typography>
            <Typography>Created on:{format(organization?.createdAt)}</Typography>
            <div className='flex flex-wrap gap-6 justify-center sm:justify-normal flex-col'>
              <div className='flex gap-6'>
                {(organization && organization.email) && (
                  <div className='flex items-center gap-2'>
                    <i className='ri-mail-line text-textSecondary' />
                    <Typography className='font-medium'>{organization?.email}</Typography>
                  </div>
                )}
                {(organization && organization.phone) && (
                  <div className='flex items-center gap-2'>
                    <i className='ri-phone-line text-textSecondary' />
                    <Typography className='font-medium'>{organization?.phone}</Typography>
                  </div>
                )}
                {(organization && organization.website) && (
                  <div className='flex items-center gap-2'>
                    <i className='ri-global-line text-textSecondary' />
                    <Typography className='font-medium' noWrap maxWidth={200}>
                      {organization?.website}
                    </Typography>
                  </div>
                )}
                {(organization && organization.address) && (
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
          <div className='flex gap-4'>
            <Button
              variant='contained'
              className='flex gap-2'
              component={Link}
              href={getLocalizedUrl(`/organization/${organization?._id}/main`, local as Locale)}
            >
              {'Organization Main'}
            </Button>
            <PermissionButton isShow={isManager}>
              <Button
                variant='contained'
                className='flex gap-2'
                component={Link}
                href={getLocalizedUrl(
                  `/organization/${organization?._id}/detail/${isOrgHome ? 'home/edit' : 'home'}`,
                  local as Locale
                )}
              >
                {/* <i className='ri-pencil-line'></i> */}
                <span>{isOrgHome ? 'Edit' : 'Organization Management'}</span>
              </Button>
            </PermissionButton>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default Header
