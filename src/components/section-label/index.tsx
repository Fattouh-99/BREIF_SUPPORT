import React from 'react'

type SectionProps = {
  label: string
  message: string
  icon?: React.ReactNode
}

const Section = ({ label, message, icon }: SectionProps) => {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <p className="text-sm font-medium">{label}</p>
      <p className="text-sm font-light">{message}</p>
    </div>
  )
}

export default Section
