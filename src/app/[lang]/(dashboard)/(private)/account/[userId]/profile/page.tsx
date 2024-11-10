// Next Imports
import dynamic from 'next/dynamic'

// Component Imports
import UserProfile from '@/views/account'

const ProfileTab = dynamic(() => import('@views/account/profile/index'))
// const TeamsTab = dynamic(() => import('@views/pages/user-profile/teams/index'))
// const ConnectionsTab = dynamic(() => import('@views/pages/user-profile/connections/index'))

// Vars
const tabContentList = () => ({
  profile: <ProfileTab />,
  // teams: <TeamsTab user={user} />,
  // connections: <ConnectionsTab user={user}/>
})

const ProfilePage = async () => {

  return <UserProfile tabContentList={tabContentList()} />
}

export default ProfilePage
