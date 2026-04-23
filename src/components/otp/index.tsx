import React from 'react'
import { OTPInput } from '../ui/input-otp'

type Props = {
  otp: string
  setOtp: React.Dispatch<React.SetStateAction<string>>
}

const OTPInputField = ({ otp, setOtp }: Props) => {
  return (
    <div className="flex justify-center">
      <OTPInput
        maxLength={6}
        value={otp}
        onChange={(value: string) => setOtp(value)}
      />
    </div>
  )
}

export default OTPInputField
