'use client'

// React Imports
import { useEffect, useRef, useState } from 'react'

// MUI Imports
import { useMediaQuery } from '@mui/material'
import Backdrop from '@mui/material/Backdrop'
import type { Theme } from '@mui/material/styles'

// Third-party Imports
import classnames from 'classnames'
// Component Imports
import SidebarLeft from './SidebarLeft'
import MailContent from './MailContent'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { commonLayoutClasses } from '@layouts/utils/layoutClasses'
import { useUser } from '@/hooks/useGlobal'
import { useEmail } from '@/hooks/useEmail'
import { useOrganization } from '@/hooks/useOrganization'
import { OrganizationMail } from '@/types/organization/mail'

const EmailWrapper = ({ folder, label }: { folder?: string; label?: string }) => {
  // States
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [backdropOpen, setBackdropOpen] = useState(false)
  // States
  const [openCompose, setOpenCompose] = useState(false)
  const [mail, setMail] = useState<OrganizationMail>()

  // Refs
  const isInitialMount = useRef(true)

  // Hooks
  const { settings } = useSettings()
  const isBelowLgScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'))
  const isBelowMdScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))
  const isBelowSmScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
  const user = useUser()
  const { refreshMail } = useEmail()
  const { organizationId } = useOrganization()

  useEffect(() => {
    if (user && organizationId && refreshMail && typeof refreshMail === 'function')
      refreshMail(user, organizationId, folder as string, label as string)
  }, [organizationId, user, folder, label, refreshMail])

  // Vars
  const uniqueLabels = [...new Set(['private', 'company', 'personal', 'important'])]

  // Handle backdrop on click
  const handleBackdropClick = () => {
    setSidebarOpen(false)
    setBackdropOpen(false)
  }

  // Set loading false on initial mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
    }
  }, [])

  // Hide backdrop when left sidebar is closed
  useEffect(() => {
    if (backdropOpen && !sidebarOpen) {
      setBackdropOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sidebarOpen])

  // Hide backdrop when screen size is above md
  useEffect(() => {
    if (backdropOpen && !isBelowMdScreen) {
      setBackdropOpen(false)
    }

    if (sidebarOpen && !isBelowMdScreen) {
      setSidebarOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBelowMdScreen])

  return (
    <div
      className={classnames(commonLayoutClasses.contentHeightFixed, 'flex is-full overflow-hidden rounded relative', {
        border: settings.skin === 'bordered',
        'shadow-md': settings.skin !== 'bordered'
      })}
    >
      <SidebarLeft
        isBelowLgScreen={isBelowLgScreen}
        isBelowMdScreen={isBelowMdScreen}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        folder={folder}
        uniqueLabels={uniqueLabels}
        label={label || ''}
        openCompose={openCompose}
        setOpenCompose={setOpenCompose}
        mail={mail}
        setMail={setMail}
      />
      <Backdrop open={backdropOpen} onClick={handleBackdropClick} className='absolute z-10' />
      <MailContent
        folder={folder}
        label={label}
        uniqueLabels={uniqueLabels}
        isInitialMount={isInitialMount.current}
        setSidebarOpen={setSidebarOpen}
        isBelowLgScreen={isBelowLgScreen}
        isBelowMdScreen={isBelowMdScreen}
        isBelowSmScreen={isBelowSmScreen}
        setBackdropOpen={setBackdropOpen}
        setOpenCompose={setOpenCompose}
        setMail={setMail}
      />
    </div>
  )
}

export default EmailWrapper
