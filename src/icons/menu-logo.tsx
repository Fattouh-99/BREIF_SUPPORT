import React from 'react'
import Image from 'next/image'

type MenuLogoProps = {
  onClick(): void
}

export const MenuLogo = ({ onClick }: MenuLogoProps) => {
  return (
    <div onClick={onClick} style={{ cursor: 'pointer' }}>
      <Image
        src="/icons/Icon-Only-Color.svg"
        alt="LOGO"
        className="animate-fade-in opacity-0 ml-2 mt-[-7px] delay-300 fill-mode-forwards"
        style={{
          width: '80%',
          height: 'auto',
        }}
        width={0}
        height={0}
      />
    </div>
  )
}
