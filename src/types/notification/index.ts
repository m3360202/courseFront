
export enum NotificationType {
  InviteStudent = "inviteStudent",
  GuardianBind = "guardianBind",
  AddOrgAdmin = "addOrgAdmin",
  AddOrgTeacher = "addOrgTeacher",
  AddOrgStudent = "addOrgStudent",
}

enum RosterState {
  Active = 0,
  Reject = 1,
  Accept = 2
}

enum State {
  Active = 0,
  Reject = 2,
  Accept = 1
}

export const getApplyStatus = (type: NotificationType) => {
  if (type === NotificationType.InviteStudent) return RosterState
  else return State
}