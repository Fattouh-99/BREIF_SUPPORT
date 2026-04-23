"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  className?: string;
}

const OTPInput = React.forwardRef<HTMLDivElement, OTPInputProps>(
  ({ value = '', onChange, maxLength = 6, className }, ref) => {
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
    
    // Ensure value is always a string
    const safeValue = typeof value === 'string' ? value : '';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const newValue = e.target.value;
      if (newValue.length <= 1 && /^[0-9]*$/.test(newValue)) {
        const newOTP = safeValue.split('');
        newOTP[index] = newValue;
        const finalOTP = newOTP.join('');
        onChange(finalOTP);
        
        // Move to next input if there's a value
        if (newValue && index < maxLength - 1) {
          inputRefs.current[index + 1]?.focus();
        }
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (e.key === 'Backspace' && !safeValue[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text');
      const pastedNumbers = pastedData.slice(0, maxLength).replace(/[^0-9]/g, '');
      onChange(pastedNumbers.padEnd(maxLength, ''));
    };

    return (
      <div ref={ref} className={cn("flex gap-2", className)}>
        {Array.from({ length: maxLength }).map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={safeValue[index] || ''}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            className="w-12 h-12 text-center text-2xl font-bold border-2 rounded-md 
                     focus:border-blue-500 focus:outline-none
                     text-gray-900 dark:text-gray-100
                     bg-white dark:bg-gray-800
                     border-gray-200 dark:border-gray-700
                     hover:border-gray-300 dark:hover:border-gray-600
                     focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                     transition-colors duration-200"
          />
        ))}
      </div>
    );
  }
);

OTPInput.displayName = "OTPInput";

export { OTPInput };
