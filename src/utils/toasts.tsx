// Third-party Imports
import type { ToastContent, ToastOptions } from 'react-toastify'
import { toast } from 'react-toastify'

const options: ToastOptions = {
  position: 'top-center'
}

export const success = (message: ToastContent) => {
  toast.success(message, options)
}

export const waring = (message: ToastContent) => {
  toast.warning(message, options)
}

export const error = (message: ToastContent) => {
  toast.error(message, options)
}
