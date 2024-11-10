'use client'

import { useEffect } from 'react'
import { CircularProgress, Typography } from '@mui/material'
import Box from '@mui/material/Box'
import { useParams } from 'next/navigation'
import { useUser } from '@/hooks/useGlobal'
import { paymentCallback } from '@/api/payment'

export default function PaymentCallBack() {
  const { orderId } = useParams()
  const user = useUser()

  useEffect(() => {
    const url = '/organization/home'
    let intervalId: NodeJS.Timeout
    const startTime = Date.now()
    if (!orderId) {
      window.location.href = url
    }
    const checkPaymentStatus = async () => {
      if (!user || !orderId) return

      try {
        const result = await paymentCallback(user, orderId as string)
        if (result.success) {
          clearInterval(intervalId)
          window.location.href = url
        } else if (Date.now() - startTime > 5 * 60 * 1000) {
          clearInterval(intervalId)
          window.location.href = url
        } else {
          clearInterval(intervalId)
          window.location.href = url
        }
      } catch (error) {
        console.error('Payment polling failed:', error)
      }
    }

    if (orderId && user) {
      intervalId = setInterval(checkPaymentStatus, 10000)
    }

    // 组件卸载时清除定时器
    return () => clearInterval(intervalId)
  }, [orderId, user])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100%'
      }}
    >
      <CircularProgress />

      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: '40px' }}>
        <Typography sx={{ fontSize: '1rem', fontWeight: 'bold', marginRight: '10px' }}>
          Payment successful! Verifying and enrolling in the course. Please wait…
        </Typography>
      </div>
    </Box>
  )
}
