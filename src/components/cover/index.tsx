"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Simplified version of Cover component with fewer animations
export const Cover = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative hover:bg-indigo-900 group/cover inline-block dark:bg-indigo-900 bg-indigo-100 px-2 py-2 transition duration-200 rounded-sm"
    >
      {/* Simple highlight effect instead of complex sparkles */}
      {hovered && (
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 via-indigo-500/20 to-indigo-400/20 animate-pulse" />
      )}
      
      <motion.span
        animate={{
          scale: hovered ? 0.95 : 1,
        }}
        transition={{
          duration: 0.2,
        }}
        className={cn(
          "dark:text-white inline-block text-neutral-900 relative z-20 group-hover/cover:text-white transition duration-200",
          className
        )}
      >
        {children}
      </motion.span>
      
      {/* Simple corner accents */}
      <div className="absolute -right-[2px] -top-[2px] h-2 w-2 rounded-full bg-neutral-600 dark:bg-white opacity-20 group-hover/cover:bg-white group-hover/cover:hidden" />
      <div className="absolute -bottom-[2px] -right-[2px] h-2 w-2 rounded-full bg-neutral-600 dark:bg-white opacity-20 group-hover/cover:bg-white group-hover/cover:hidden" /> 
      <div className="absolute -left-[2px] -top-[2px] h-2 w-2 rounded-full bg-neutral-600 dark:bg-white opacity-20 group-hover/cover:bg-white group-hover/cover:hidden" />
      <div className="absolute -bottom-[2px] -left-[2px] h-2 w-2 rounded-full bg-neutral-600 dark:bg-white opacity-20 group-hover/cover:bg-white group-hover/cover:hidden" />
    </div>
  );
};
