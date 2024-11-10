import React from 'react'

function Typing({ className, width, height }: { className?: any; width: any; height: any }) {
  return (
    <div className={className}>
      {/**@ts-ignore */}
      <lottie-player
        src='https://assets8.lottiefiles.com/packages/lf20_xxgrirnx.json'
        background='transparent'
        speed='1'
        style={{ width: `${width}px`, height: `${height}px` }}
        loop
        autoplay
      >
        {/**@ts-ignore */}
      </lottie-player>
    </div>
  )
}

export default Typing
