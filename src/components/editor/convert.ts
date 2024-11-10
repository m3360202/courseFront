export function convertContent(content: string) {
  if (!content) return ''

  return content.replaceAll('<p>', '\u2000').replaceAll('</p>', '\u2002')
}

export function convertHTML(content: string) {
  if (!content) return ''

  return content?.replaceAll('\u2000', '<p>').replaceAll('\u2002', '</p>')
}
