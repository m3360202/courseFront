export function getOrgBgColor(username: string | undefined) {
  let hash = 0
  if (!username || username.length === 0) return '#000000'

  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash)
  }

  // 将哈希值转换为颜色
  let color = '#'
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff
    color += ('00' + value.toString(16)).substr(-2)
  }

  return color
}
