import { Skeleton } from '@mui/material'
import React from 'react'

function SkeletonLoading({ height }: { height: any }) {
  return (
    <div>
      <Skeleton style={{ height: `${height}px`, width: '100%' }} />
    </div>
  )
}

export default SkeletonLoading
