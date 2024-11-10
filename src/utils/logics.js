import { BASE_URL } from '@/types'

export const isSameSenderMargin = (messages, m, i, userId) => {
  if (i < messages.length - 1 && messages[i + 1].sender?._id === m.sender?._id && messages[i].sender?._id !== userId)
    return 33
  else if (
    (i < messages.length - 1 && messages[i + 1].sender?._id !== m.sender._id && messages[i].sender?._id !== userId) ||
    (i === messages.length - 1 && messages[i].sender?._id !== userId)
  )
    return 0
  else return 'auto'
}
export function timeSince(date) {
  var seconds = Math.floor((new Date() - date) / 1000)

  var interval = seconds / 31536000

  if (interval > 1) {
    return Math.floor(interval) + ' year ago'
  }
  interval = seconds / 2592000
  if (interval > 1) {
    return Math.floor(interval) + ' month ago'
  }
  interval = seconds / 86400
  if (interval > 1) {
    return Math.floor(interval) + ' day ago'
  }
  interval = seconds / 3600
  if (interval > 1) {
    return Math.floor(interval) + ' hour ago'
  }
  interval = seconds / 60
  if (interval > 1) {
    return Math.floor(interval) + ' minute ago'
  }

  return Math.floor(seconds) + ' seconda ago'
}
export const isSameSender = (messages, m, i, userId) => {
  return (
    i < messages.length - 1 &&
    (messages[i + 1].sender?._id !== m.sender?._id || messages[i + 1].sender?._id === undefined) &&
    messages[i].sender?._id !== userId
  )
}
export const isLastMessage = (messages, i, userId) => {
  return (
    i === messages.length - 1 &&
    messages[messages.length - 1].sender?._id !== userId &&
    messages[messages.length - 1].sender?._id
  )
}
export const isSameUser = (messages, m, i) => {
  return i > 0 && messages[i - 1].sender?._id === m.sender?._id
}
export const getSender = (activeUser, users) => {
  return activeUser.id === users[0]._id
    ? users[1].nickName || users[1].username
    : users[0].nickName || users[0].username
}
export const getChatName = (activeChat, activeUser) => {
  return activeChat?.isGroup
    ? activeChat?.chatName
    : activeChat?.users[0]?._id === activeUser.id
      ? activeChat?.users[1]?.nickName || activeChat?.users[1]?.username
      : activeChat?.users[0]?.nickName || activeChat?.users[0]?.username
}
export const getChatPhoto = (activeChat, activeUser) => {
  return activeChat?.isGroup
    ? BASE_URL + activeChat.photo
    : activeChat?.users[0]?._id === activeUser?.id
      ? BASE_URL + activeChat?.users[1]?.userImg
      : BASE_URL + activeChat?.users[0]?.userImg
}
