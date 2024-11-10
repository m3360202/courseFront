import { UserTable } from '@/types/user/UserTable'
import { error } from '../toasts'
import { sendRecordMail } from '@/api/sendRecordMail'

const gotoRecord = async (user: UserTable, recordings?: { url: string }[]) => {
  try {
    if (!recordings || recordings?.length === 0) {
      error('Recording file not found!')

      return
    }
    if (user?.recordEmail) {
      await sendRecordMail(user, {
        to: user.recordEmail,
        title: 'Replay video email',
        message: recordings.map(item => item.url).join(';')
      })
    }
    recordings.map(item => {
      window.open(item.url)
    })
  } catch {
    //error('Recording file not found!')
  }
}

export default gotoRecord
