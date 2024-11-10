// Next Imports
import { useParams, usePathname } from 'next/navigation'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Type Imports
import type { getDictionary } from '@/utils/getDictionary'

import { Box, Link, List, ListItem, ListItemButton, ListItemIcon, Typography } from '@mui/material'
import type { BoxProps, ListItemButtonProps } from '@mui/material'
import { styled } from '@mui/material/styles'
import { ElementType } from 'react'
import classNames from 'classnames'
import { Locale } from '@/configs/i18n'
import { Menu, MenuItem, SubMenu } from '@menu/vertical-menu'
import useVerticalNav from '@/@menu/hooks/useVerticalNav'
import PerfectScrollbar from 'react-perfect-scrollbar'
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'
import StyledVerticalNavExpandIcon from '@/@menu/styles/vertical/StyledVerticalNavExpandIcon'
import { VerticalMenuContextProps } from '@/@menu/components/vertical-menu/Menu'
import { useGlobal } from '@/hooks/useGlobal'
import PermissionButton from '@/components/buttons/PermissionButton'
import OrganizationRole from '@/types/organization/organizationRole'

type Props = {
  dictionary: Awaited<ReturnType<typeof getDictionary>>
  scrollMenu: (container: any, isPerfectScrollbar: boolean) => void
}

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

// ** Styled Components
const MenuNavLink = styled(ListItemButton)<
  ListItemButtonProps & { component?: ElementType; target?: '_blank' | undefined }
>(({ theme }) => ({
  width: '100%',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  // borderTopRightRadius: 100,
  // borderBottomRightRadius: 100,
  padding: theme.spacing(2.25, 3.5),
  height: 90,
  gap: 0,
  transition: 'opacity .25s ease-in-out',
  '& .MuiTypography-root': {
    color: theme.palette.common.white
  },
  '&.active, &.active:hover': {
    boxShadow: theme.shadows[3],
    backgroundColor: theme.palette.common.white
  },
  '&:hover': {
    boxShadow: theme.shadows[3],
    backgroundColor: theme.colorSchemes.dark.palette.action.hover
  },
  '&.active .MuiTypography-root, &.active .MuiSvgIcon-root': {
    color: `${theme.palette.common.black} !important`
  }
}))

const MenuItemTextMetaWrapper = styled(Box)<BoxProps>({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
})

const isActive = (pathname: string, url: string) =>
  pathname.includes(url) || (url.includes('organization') && pathname.includes('organization'))

const renderMenu = (title: string, url: string, icon: string, pathname: string, locale: Locale) => {
  const active = isActive(pathname, `/${locale}${url}`)

  return (
    <ListItem disablePadding>
      <Link href={url} width={'100%'} height={'100%'} underline='none'>
        <MenuNavLink className={classNames({ active })}>
          <ListItemIcon>
            <i
              className={classNames(icon, 'w-[42px] h-[42px]', {
                'bg-white': !active,
                ' bg-black': active
              })}
            ></i>
          </ListItemIcon>
          <MenuItemTextMetaWrapper>
            <Typography noWrap>
              <span dangerouslySetInnerHTML={{ __html: title }} />
            </Typography>
          </MenuItemTextMetaWrapper>
        </MenuNavLink>
      </Link>
    </ListItem>
  )
}

// const renderOrgMenu = (title: string, url: string, icon: string, pathname: string, locale: Locale) => {
//   const active = isActive(pathname, `/${locale}${url}`)

//   return (
//     <ListItem disablePadding>
//       <Link href={url} width={'100%'} height={'100%'} underline='none'>
//         <MenuNavLink className={classNames(' flex-row h-6 p-5 gap-2', { active })}>
//           <ListItemIcon>
//             <i
//               className={classNames(icon, 'size-6', {
//                 'bg-white': !active,
//                 ' bg-black': active
//               })}
//             ></i>
//           </ListItemIcon>
//           <MenuItemTextMetaWrapper>
//             <Typography noWrap>
//               <span dangerouslySetInnerHTML={{ __html: title }} />
//             </Typography>
//           </MenuItemTextMetaWrapper>
//         </MenuNavLink>
//       </Link>
//     </ListItem>
//   )
// }

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }: Props) => {
  // Hooks
  const theme = useTheme()
  const { organizationId, lang: locale } = useParams()
  const pathname = usePathname()
  const verticalNavOptions = useVerticalNav()
  const { organizationRoles } = useGlobal()

  // Vars
  const { isBreakpointReached, transitionDuration } = verticalNavOptions
  const inOrg = pathname.includes('organization/' + organizationId + '/detail')
  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar
  // const shadowBgColor = () => {
  //   if (skin === 'semi-dark' && theme.palette.mode === 'light') {
  //     return `linear-gradient(${theme.palette.customColors.darkBg} 40%} 95%,`
  //   } else if (skin === 'semi-dark' && theme.palette.mode === 'dark') {
  //     return `linear-gradient(${theme.palette.customColors.lightBg} 40%, 95%,''`
  //   } else {
  //     return `linear-gradient(${theme.palette.background.default} 40%`
  //   }
  // }

  const OrganizationMenu = (
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
          className: 'bs-full overflow-y-auto overflow-x-hidden',
          onScroll: container => scrollMenu(container, false)
        }
        : {
          options: { wheelPropagation: false, suppressScrollX: true },
          onScrollY: container => scrollMenu(container, true)
        })}
    >
      {/* Incase you also want to scroll NavHeader to scroll with Vertical Menu, remove NavHeader from above and paste it below this comment */}
      {/* Vertical Menu */}
      <Menu
        popoutMenuOffset={{ mainAxis: 10 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-line' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        {/* <SubMenu label={'Organization'} icon={<i className='ri-organization-chart' />}>
          <MenuItem href={`/${locale}/organization/${organizationId}/detail/my-space`}>Home</MenuItem>
        </SubMenu> */}
        <MenuItem
          icon={<i className='ri-archive-line' />}
          href={`/${locale}/organization/${organizationId}/detail/home`}
        >
          Home
        </MenuItem>
        <PermissionButton isShow={organizationRoles?.includes(OrganizationRole.Course)}>
          <SubMenu label={'Courses'} icon={<i className='ri-graduation-cap-line' />}>
            <MenuItem href={`/${locale}/organization/${organizationId}/detail/course`}>Course List</MenuItem>
            <MenuItem href={`/${locale}/organization/${organizationId}/detail/enrollment-plan`}>
              Enrollment Plan
            </MenuItem>
            <MenuItem href={`/${locale}/organization/${organizationId}/detail/enrollment-survey`}>
              Enrollment Survey
            </MenuItem>
            <MenuItem href={`/${locale}/organization/${organizationId}/detail/enrollment-policy`}>
              Enrollment Policy
            </MenuItem>
          </SubMenu>
        </PermissionButton>
        <PermissionButton isShow={organizationRoles?.includes(OrganizationRole.User)}>
          <SubMenu label={'Users'} icon={<i className='ri-group-line' />}>
            <MenuItem href={`/${locale}/organization/${organizationId}/detail/user/manager`}>Managers</MenuItem>
            <MenuItem href={`/${locale}/organization/${organizationId}/detail/user/instructor`}>Instructors</MenuItem>
            <MenuItem href={`/${locale}/organization/${organizationId}/detail/user/student`}>Students</MenuItem>
          </SubMenu>
        </PermissionButton>
        <PermissionButton isShow={organizationRoles?.includes(OrganizationRole.Document)}>
          <SubMenu label={'Library'} icon={<i className='ri-file-history-line' />}>
            <MenuItem href={`/${locale}/organization/${organizationId}/detail/library/document`}>Document</MenuItem>
            <MenuItem href={`/${locale}/organization/${organizationId}/detail/library/quiz`}>Quiz</MenuItem>
            <MenuItem href={`/${locale}/organization/${organizationId}/detail/library/assignment`}>Assignment</MenuItem>
            {/* <MenuItem href={`/${locale}/organization/${organizationId}/detail/library/survey`}>Survey</MenuItem> */}
          </SubMenu>
        </PermissionButton>
        <PermissionButton isShow={organizationRoles?.includes(OrganizationRole.Mail)}>
          <MenuItem
            icon={<i className='ri-mail-line' />}
            href={`/${locale}/organization/${organizationId}/detail/email`}
          >
            Email
          </MenuItem>
        </PermissionButton>
        <PermissionButton isShow={organizationRoles?.includes(OrganizationRole.Payment)}>
          <MenuItem
            icon={<i className='ri-bank-card-line' />}
            href={`/${locale}/organization/${organizationId}/detail/payment`}
          >
            Payment
          </MenuItem>
        </PermissionButton>
      </Menu>
    </ScrollWrapper>
  )

  return inOrg ? (
    OrganizationMenu
  ) : (
    <Box
      sx={{
        // mr: '1rem',
        minHeight: '100vh',
        backgroundColor: theme.palette.mode === 'dark' ? 'inherit' : theme.palette.primary.main,
        overflow: 'hidden'
      }}
    >
      {/* <StyledBoxForShadow ref={shadowRef} sx={{ background: shadowBgColor() }} /> */}
      <Box sx={{ position: 'sticky', top: 0, minHeight: '100vh' }}>
        <List sx={{ padding: 0, minHeight: '100vh' }}>
          <ListItem disablePadding>
            <Link href={`https://www.xtatic.org`} target='_blank' width={'100%'} height={'100%'}>
              <MenuNavLink className=''>
                <ListItemIcon>
                  <img src='/images/logos/logo-white.png' width={60} />
                </ListItemIcon>
              </MenuNavLink>
            </Link>
          </ListItem>

          <>
            {renderMenu('Dashboard', '/dashboard', 'ri-dashboard-line', pathname, locale as Locale)}
            {renderMenu('Course', '/course', 'ri-graduation-cap-line', pathname, locale as Locale)}
            {renderMenu('Calendar', '/calendar', 'ri-calendar-line', pathname, locale as Locale)}
            {renderMenu('Message', '/chat', 'ri-chat-1-line', pathname, locale as Locale)}
            {renderMenu('Search', '/search', 'ri-search-line', pathname, locale as Locale)}
            {renderMenu('Organization', '/organization/home', 'ri-organization-chart', pathname, locale as Locale)}
          </>
          {/* {inOrg && (
            <div className='flex flex-col justify-between h-[85vh] pt-4'>
              <div className='flex flex-col gap-4'>
                {renderOrgMenu(
                  'My Space',
                  `/organization/${organizationId}/detail/my-space`,
                  'ri-archive-line',
                  pathname,
                  locale as Locale
                )}
              </div>
              <ListItem disablePadding>
                <Link href={`/${locale}/organization/home`} width={'100%'} height={'100%'}>
                  <MenuNavLink sx={{ alignItems: 'baseline', height: 40 }}>
                    <ListItemIcon>
                      <i className='ri-arrow-left-line bg-white size-10'></i>
                    </ListItemIcon>
                  </MenuNavLink>
                </Link>
              </ListItem>
            </div>
          )} */}
        </List>
      </Box>
    </Box>
  )
}

export default VerticalMenu
