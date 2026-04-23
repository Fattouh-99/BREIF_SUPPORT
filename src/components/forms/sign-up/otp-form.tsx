import React from "react";
import { OTPInput } from "@/components/ui/input-otp";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";

type Props = {
  setOTP?: (value: string) => void;
  onOTP?: string;
  register?: UseFormRegister<FieldValues>;
  errors?: FieldErrors<FieldValues>;
};

const OTPForm = ({ onOTP, setOTP, register, errors }: Props) => {
  const handleChange = (value: string) => {
    if (setOTP) {
      setOTP(value);
    }
  };

  // Ensure onOTP is a valid string to prevent syntax errors
  const safeOTP = typeof onOTP === 'string' ? onOTP : '';

  return (
    <div className="flex flex-col items-center space-y-4 sm:space-y-6">
      <div className="flex flex-col items-center space-y-1 sm:space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 text-center">Enter verification code</h2>
        <p className="text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          We've sent a 6-digit code to your email
        </p>
      </div>

      <div className="w-full max-w-sm flex justify-center px-2 sm:px-0">
        <OTPInput
          value={safeOTP}
          onChange={handleChange}
          maxLength={6}
        />
      </div>
    </div>
  );
};

export default OTPForm;