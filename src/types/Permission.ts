export type Permission = {
  isView: boolean
  isAdd?: boolean
  isEdit?: boolean
  isDelete?: boolean
  isJoin?: boolean
  isImport?: boolean
  isInstitutionManager?: boolean
  isInstitutionTeacher?: boolean
  isGuardianParent?: boolean
  isSystemInfo?: boolean
  uploadImage?: boolean
}

export type PermissionIem = {
  code: string
  permission: Permission
}
