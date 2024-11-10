import { Tab } from '@mui/material'
import Link from 'next/link'

interface Props {
  label: string
  href: string
  icon?: string
}

const LinkTab = (props: Props) => {
  const { label, icon, href, ...rest } = props

  return (
    <Tab
      label={label}
      component={Link}
      href={href}
      className='flex-row justify-start !min-is-full'
      icon={icon ? <i className={icon} /> : undefined}
      iconPosition='start'
      {...rest}
    />
  )
}

export default LinkTab
