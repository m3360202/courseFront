'use client'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import NavToggle from './NavToggle'
import NavSearch from '@components/layout/shared/search'
// import LanguageDropdown from '@components/layout/shared/LanguageDropdown'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
// import ShortcutsDropdown from '@components/layout/shared/ShortcutsDropdown'
import NotificationsDropdown from '@components/layout/shared/NotificationsDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'
import { useGlobal } from '@/hooks/useGlobal'
import ConfirmDialog from '@/components/confirm'

// Vars
// const shortcuts: ShortcutsType[] = [
//   {
//     url: '/apps/calendar',
//     icon: 'ri-calendar-line',
//     title: 'Calendar',
//     subtitle: 'Appointments'
//   },
//   {
//     url: '/apps/invoice/list',
//     icon: 'ri-file-list-3-line',
//     title: 'Invoice App',
//     subtitle: 'Manage Accounts'
//   },
//   {
//     url: '/apps/user/list',
//     icon: 'ri-user-3-line',
//     title: 'Users',
//     subtitle: 'Manage Users'
//   },
//   {
//     url: '/apps/roles',
//     icon: 'ri-computer-line',
//     title: 'Role Management',
//     subtitle: 'Permissions'
//   },
//   {
//     url: '/dashboards/crm',
//     icon: 'ri-pie-chart-2-line',
//     title: 'Dashboard',
//     subtitle: 'User Dashboard'
//   },
//   {
//     url: '/pages/account-settings',
//     icon: 'ri-settings-4-line',
//     title: 'Settings',
//     subtitle: 'Account Settings'
//   }
// ]

const NavbarContent = () => {
  const { topButtons } = useGlobal()

  return (
    <div className={classnames(verticalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}>
      <div className='flex items-center gap-[7px]'>
        <NavToggle />
        <NavSearch />
      </div>
      <div className='flex items-center'>
        {topButtons && topButtons.map(button => button.key?.toLocaleLowerCase()?.includes('submit') ? <ConfirmDialog key={button.key} title='Are you sure' confirm={() => { button.props.onClick() }}>{button}</ConfirmDialog> : button)}
        {/* {clock && (
          <div className='flex gap-1 items-center'>
            <i className='ri-time-line'></i>
            <Typography variant='h5' color={'error'}>
              {clock}
            </Typography>
          </div>
        )} */}
        {/* <LanguageDropdown /> */}
        <ModeDropdown />
        {/* <ShortcutsDropdown shortcuts={shortcuts} /> */}
        <NotificationsDropdown />
        <UserDropdown />
      </div>
    </div>
  )
}

export default NavbarContent
