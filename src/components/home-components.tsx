'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export function DynamicParallaxBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden z-0">
      <div className="absolute inset-0 opacity-50 pointer-events-none">
        <div className="absolute top-1/4 -left-5 w-64 h-64 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        <div className="absolute -bottom-10 right-1/4 w-72 h-72 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
      </div>
      
      <div className="absolute inset-0 bg-gradient-radial from-transparent to-white opacity-90 pointer-events-none"></div>
    </div>
  );
}

export function DynamicHeroTitle() {
  const [typedText, setTypedText] = useState("");
  const fullText = "Brief Support";
  
  useEffect(() => {
    if (typedText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setTypedText(fullText.slice(0, typedText.length + 1));
      }, 150);
      
      return () => clearTimeout(timeout);
    }
  }, [typedText, fullText]);
  
  return (
    <motion.h1 
      className="text-6xl sm:text-7xl lg:text-8xl font-bold text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-primary-800 to-primary-600">
        {typedText}
        <span className="opacity-0">Brief Support</span>
      </span>
    </motion.h1>
  );
} 