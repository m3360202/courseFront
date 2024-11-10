import { success } from './toasts'

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
  success('Has been copied to your clipboard.')
}

export default copyToClipboard
