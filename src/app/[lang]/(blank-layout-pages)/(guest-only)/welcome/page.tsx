// Next Imports
import type { Metadata } from 'next'

// Component Imports
import Welcome from '@views/Welcome'

export const metadata: Metadata = {
  title: 'Register',
  description: 'Register to your account'
}

const WelcomePage = () => {
  // Vars

  return <Welcome />
}

export default WelcomePage
