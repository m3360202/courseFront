import { FILE_PATH } from '@/types'
import { FileType } from '@/types/file/file'
import { error } from '../toasts'

const downloadFile = (fileUrl: string, fileName: string) => {
  const xhr = new XMLHttpRequest()
  xhr.open('GET', fileUrl, true)
  xhr.responseType = 'blob'
  xhr.withCredentials = true
  xhr.onload = function () {
    if (xhr.status === 200) {
      const blob = xhr.response
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } else {
      console.error('Download error:', xhr.status, xhr.statusText)
    }
  }
  xhr.send()
}

export default downloadFile

export const viewFile = (file?: FileType) => {
  if (!file) {
    error('File not found')

    return false
  }
  window.open(FILE_PATH + file?.temporary)
  
  return true
}
