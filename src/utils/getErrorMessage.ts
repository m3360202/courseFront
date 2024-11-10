export type ErrorType = {
  message: string[]
}

export const getErrorMessage = (error: any) => {
  if (!error) return ''
  const errorMsg = JSON.parse(error) as ErrorType

  if (!errorMsg || !errorMsg.message || errorMsg.message.length === 0) return ''
  
return errorMsg.message.join(';')
}
