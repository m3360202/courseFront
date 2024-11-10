import { last } from 'lodash'

const getFileType = (fileName: string): string => {
  if (!fileName) return ''

  switch (last(fileName.split('.'))?.toLowerCase()) {
    case 'txt':
      return '/images/icons/txt.png'
    case 'pdf':
      return '/images/icons/pdf.png'
    case 'doc':
    case 'docx':
      return '/images/icons/doc.png'
    case 'xls':
    case 'xlsx':
      return '/images/icons/xls.png'
    case 'zip':
      return '/images/icons/zip.png'
    default:
      return '/images/icons/unknow.png'
  }
}

export default getFileType

export const showFileTypeImg = (isFolder: boolean, fileName: string) =>
  !isFolder ? <img alt={fileName} width='22px' src={getFileType(fileName)} /> : <i className='ri-folder-line'></i>
