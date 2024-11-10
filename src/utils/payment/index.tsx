import { UserTable } from '@/types/user/UserTable'
import { error, success } from '@/utils/toasts'
import request from '@/utils/requestHasToken'

export const handlePayment = async (
  user: UserTable,
  userId: string,
  email: string,
  organizationId: string,
  enrollmentPlanId: string,
  extend: { title: string; type: string },
  price?: GLfloat,
  multiplePayment?: boolean,
  target?: number,
  courseId?: string,
  organizationName?: string
) => {
  if (!userId) {
    error('Login expired, please login again')

    return
  }
  if (!email) {
    error('Login expired, please login again')

    return
  }
  if (organizationId === '') {
    error('Please input institution')

    return
  }
  if (!userId) {
    error('Login expired, please login again')

    return
  }
  if (price && (price === 0 || price < 0.5)) {
    error('Price only support at least $0.5')

    return
  }
  if (organizationId === '') {
    error('Please input institution')

    return
  }
  if (userId && email && organizationId && extend && extend.title && extend.type) {
    const paymentLink = await request(user).post<unknown, { success: boolean; msg: string; link: string }>(
      `/payment/create`,
      {
        userId,
        email,
        price,
        institutionId: organizationId,
        extend,
        enrollmentPlanId,
        multiplePayment,
        target,
        courseId
      }
    )
    if (paymentLink.success && target === 2) {
      success(`You have successfully donated ${(price as number) / 100} to ${organizationName} organization.`)
    }
    if (paymentLink.success) {
      window.location.href = paymentLink.link
    } else {
      if (paymentLink.msg) {
        error(paymentLink.msg)
      }
    }
  }
}

export const createPayment = (
  user: UserTable,
  organizationId: string,
  enrollmentPlanId?: string,
  extend?: { title: string; type: string },
  company?: string | undefined,
  legalName?: string | undefined,
  donationName?: string | undefined
) => {
  return request(user).post<unknown, { success: boolean; msg: string; link: string }>(`/payment/init`, {
    institutionId: organizationId,
    enrollmentPlanId,
    extend,
    company,
    legalName,
    donationName
  })
}
