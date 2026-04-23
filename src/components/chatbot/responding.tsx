import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

export const Responding = () => {
  return (
    <div className="self-start flex items-end gap-3">
      <Avatar className="w-8 h-8">
        <div className="w-full h-full flex items-center justify-center bg-white">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-4/5 h-4/5">
            <defs>
              <radialGradient id="typingStarGradient" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="70%" stopColor="#4285f4" stopOpacity="0.9" />
              </radialGradient>
            </defs>
            <path d="M50,10 C55,30 70,45 90,50 C70,55 55,70 50,90 C45,70 30,55 10,50 C30,45 45,30 50,10 Z" 
              fill="url(#typingStarGradient)" 
            />
          </svg>
        </div>
        <AvatarFallback className="bg-white">
          <div className="w-full h-full flex items-center justify-center">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-4/5 h-4/5">
              <defs>
                <radialGradient id="typingStarGradientFallback" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="70%" stopColor="#4285f4" stopOpacity="0.9" />
                </radialGradient>
              </defs>
              <path d="M50,10 C55,30 70,45 90,50 C70,55 55,70 50,90 C45,70 30,55 10,50 C30,45 45,30 50,10 Z" 
                fill="url(#typingStarGradientFallback)" 
              />
            </svg>
          </div>
        </AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-2 text-sm text-muted-foreground px-4 py-2 rounded-t-md rounded-r-md">
        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></div>
        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse delay-75"></div>
        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse delay-150"></div>
      </div>
    </div>
  )
}
