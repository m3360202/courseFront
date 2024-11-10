import { getServerSession } from 'next-auth'

const useUser = async () => {
  const session = await getServerSession()

  if (!session) return { user: null }

  // const { settings } = useSettings()

  // const user = cloneDeep({
  //   ...session.user,
  //   timeZone: settings.timeZone || (session.user as UserTable).timeZone
  // }) as UserTable

  return { user: session }
}

export default useUser
