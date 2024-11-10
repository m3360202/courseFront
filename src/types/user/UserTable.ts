export enum SettingVisiable {
  VisiableToEveryone = 1,
  VisiableWithinGroup = 2,
  InVisiable = 3
}

export type UserExtend = {
  firstName: string
  lastName: string
  email: string
  phone: string
  parentFirstName: string
  parentLastName: string
  parentEmail: string
  parentPhone: string
  parent1FirstName: string
  parent1LastName: string
  parent1Email: string
  parent1Phone: string
  city: string
}

export type UserTable = {
  order: any
  firstName: any
  lastName: any
  name: string
  phoneNumber: any
  _id: string
  code: string
  email: string
  username: string
  userImg?: string
  nickName: string | undefined
  invitationCode: string
  bio: string | undefined
  website: string | undefined
  timeZone: string
  hasPwd: boolean
  visible: boolean
  recordEmail?: string
  address?: {
    state: string | undefined
    city: string | undefined
  }
  personal?: {
    phone: string | number | undefined
    fax: string | undefined
  }
  userRole?: string[]
  activationToken: string
  experiences?: [
    {
      _id: string
      title: string
      from: Date
      to: Date
      description: string
      files: [{ temporary: string; final: string }]
      isShow: boolean
      hashTag?: string | string[]
      organization: string
      isPresent: boolean
    }
  ]
  hashTag?: string[] | string
  token: string
  settings?: {
    visiable: SettingVisiable
  }
  showChangeTimeZoneDialog?: boolean
  labels?: [{ _id: string; title: string }]
  isAdmin: boolean
  collects?: [UserExtend]
  googleId?: string
}
