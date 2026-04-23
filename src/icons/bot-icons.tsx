import React from 'react'

interface IconProps {
  className?: string;
  color?: string;
}

interface IconWrapperProps extends IconProps {
  src: string;
}

const IconWrapper = ({ src, className = "w-8 h-8", color = "currentColor" }: IconWrapperProps) => (
  <img 
    src={src} 
    className={className}
    style={{ filter: color === 'white' ? 'brightness(0) invert(1)' : undefined }}
    alt="bot icon"
  />
)

export const BotIcons = {
  Default: (props: IconProps) => (
    <IconWrapper {...props} src="https://api.iconify.design/material-symbols:smart-toy.svg" />
  ),
  
  Assistant: (props: IconProps) => (
    <IconWrapper {...props} src="https://api.iconify.design/material-symbols:support-agent.svg" />
  ),

  Chat: (props: IconProps) => (
    <IconWrapper {...props} src="https://api.iconify.design/material-symbols:chat-bubble.svg" />
  ),

  Modern: (props: IconProps) => (
    <IconWrapper {...props} src="https://api.iconify.design/material-symbols:robot.svg" />
  ),

  Friendly: (props: IconProps) => (
    <IconWrapper {...props} src="https://api.iconify.design/material-symbols:favorite.svg" />
  ),

  Help: (props: IconProps) => (
    <IconWrapper {...props} src="https://api.iconify.design/material-symbols:help.svg" />
  ),

  Support: (props: IconProps) => (
    <IconWrapper {...props} src="https://api.iconify.design/material-symbols:contact-support.svg" />
  ),

  Smart: (props: IconProps) => (
    <IconWrapper {...props} src="https://api.iconify.design/material-symbols:psychology.svg" />
  ),

  AI: (props: IconProps) => (
    <IconWrapper {...props} src="https://api.iconify.design/material-symbols:memory.svg" />
  )
}

export type BotIconType = keyof typeof BotIcons; 