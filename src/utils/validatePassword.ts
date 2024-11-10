export const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

export const validatePassword = (password: string) => {
  return re.test(String(password))
}
