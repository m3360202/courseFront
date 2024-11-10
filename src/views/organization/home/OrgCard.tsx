import { Box, Button, Card, CardActionArea, CardActions, CardContent, Typography } from '@mui/material'
import { getOrgBgColor } from '@/utils/getOrgBgColor'
import { Locale } from '@/configs/i18n'
import { getLocalizedUrl } from '@/utils/i18n'
import { useParams } from 'next/navigation'
import { useOrganizationManager } from '@/hooks/useOrganization'
import Link from 'next/link'
import { getImg } from '@/utils/getImg'

export const OrgCard = ({ item }: { item: any }) => {
  //States
  const { lang: locale } = useParams()

  //Hooks
  const isManager = useOrganizationManager(item)

  //Hooks
  let cardBackground = {}
  let cardContent = {}
  if (item.orgImg && item.orgImg !== 'null') {
    const backgroundImage = `url(${getImg(item.orgImg?.temporary)})`
    cardBackground = {
      backgroundImage: backgroundImage,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      height: '105px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }

    cardContent = {
      textAlign: 'center'
    }
  } else {
    const backgroundColor = getOrgBgColor(item.name)
    cardBackground = {
      backgroundColor,
      height: '105px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '2rem',
      color: 'white'
    }
    cardContent = {
      textAlign: 'center'
    }
  }

  return (
    <Card sx={{ width: '96%' }}>
      <CardActionArea className='cursor-default'>
        <Box sx={cardBackground}>
          {item.orgImg && item.orgImg !== 'null' ? null : item.name && item.name[0].toUpperCase()}
        </Box>
        <CardContent sx={cardContent}>
          <Typography gutterBottom variant='h5' component='div'>
            {item.organization}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {item.name}
          </Typography>
        </CardContent>
        <CardActions className=' justify-center gap-5'>
          <Button
            size='small'
            variant='outlined'
            component={Link}
            href={getLocalizedUrl(`/organization/${item._id}/main`, locale as Locale)}
          >
            Home page
          </Button>
          <Button
            size='small'
            variant='outlined'
            component={Link}
            href={getLocalizedUrl(
              `/organization/${item._id}/${isManager ? 'detail/home' : 'my-space'}`,
              locale as Locale
            )}
            target={isManager ? '_blank' : '_self'}
          >
            {isManager ? 'Business Management' : 'My space'}
          </Button>
        </CardActions>
      </CardActionArea>
    </Card>
  )
}
