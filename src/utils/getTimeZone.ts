import type { UserTable } from '@/types/user/UserTable'

import moment from 'moment-timezone';

const getTimeZone = (user: UserTable | undefined | null) => {
  // 检查用户是否有定义的时区
  if (user && user.timeZone) {

    return user.timeZone;
  }
  // 如果没有提供用户时区或提供的时区无效，返回本地时区
  
  return moment.tz.guess(); // moment.tz.guess() 尝试猜测用户的本地时区
};

export default getTimeZone;