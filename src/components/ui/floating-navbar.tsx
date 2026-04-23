"use client";

import React, { useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export const FloatingNav = ({
  navItems,
  className,
}: {
  navItems: {
    name: string;
    link: string;
    icon?: JSX.Element;
    subItems?: Array<{
      name: string;
      link: string;
      description?: string;
    }>;
  }[];
  className?: string;
}) => {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (previous !== undefined && latest > previous && latest > 150) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  // Handle authentication-aware navigation
  const handleAuthClick = (e: React.MouseEvent, route: string) => {
    e.preventDefault();
    
    // If user is already logged in, redirect to dashboard
    if (isLoaded && userId) {
      router.push('/dashboard');
    } else {
      // Otherwise go to specified auth route
      router.push(route);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{
          opacity: visible ? 1 : 0,
          y: visible ? 0 : -100,
        }}
        transition={{
          duration: 0.2,
        }}
        className={cn(
          "flex max-w-fit fixed top-10 inset-x-0 mx-auto border border-indigo-700 rounded-full bg-indigo-600 shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] z-[5000] pr-2 pl-8 py-2 items-center justify-center space-x-6",
          className
        )}
      >
        {navItems.map((navItem, idx) => (
          <div 
            key={`nav-item-${idx}`}
            className="group relative"
          >
            {/* Check if the nav item has subitems */}
            {navItem.subItems && navItem.subItems.length > 0 ? (
              // If it has subitems, render a div (not clickable)
              <div
                className={cn(
                  "relative text-white items-center flex space-x-1 hover:text-indigo-200 cursor-pointer py-2"
                )}
              >
                <span className="block sm:hidden">{navItem.icon}</span>
                <span className="hidden sm:block text-sm">{navItem.name}</span>
                <ChevronDown className="w-4 h-4 ml-1 group-hover:transform group-hover:rotate-180 transition-transform" />
              </div>
            ) : (
              // If it doesn't have subitems, render a Link (clickable)
              <Link
                href={navItem.link}
                className={cn(
                  "relative text-white items-center flex space-x-1 hover:text-indigo-200 py-2"
                )}
              >
                <span className="block sm:hidden">{navItem.icon}</span>
                <span className="hidden sm:block text-sm">{navItem.name}</span>
              </Link>
            )}
            
            {/* Create an invisible bridge element to ensure no hover gap */}
            {navItem.subItems && navItem.subItems.length > 0 && (
              <>
                <div className="hidden group-hover:block absolute -bottom-2 left-0 right-0 h-3 bg-transparent" />
                
                <div className="hidden group-hover:block absolute top-full left-0 pt-1 w-56 z-50">
                  <div className="bg-white rounded-lg shadow-lg border border-indigo-100 overflow-hidden">
                    <div className="py-2">
                      {navItem.subItems.map((subItem, subIdx) => (
                        <Link
                          key={`sub-item-${idx}-${subIdx}`}
                          href={subItem.link}
                          className="block px-4 py-2 hover:bg-indigo-50 text-indigo-800 text-sm transition-colors"
                        >
                          <div className="font-medium">{subItem.name}</div>
                          {subItem.description && (
                            <div className="text-xs text-gray-500 mt-0.5">{subItem.description}</div>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
        <div className="flex items-center space-x-2">
          <Link 
            href="#"
            onClick={(e) => handleAuthClick(e, '/auth/sign-in')}
            className="border text-sm font-medium relative border-indigo-400 text-white px-4 py-2 rounded-full hover:bg-indigo-700"
          >
            <span>Login</span>
            <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent h-px" />
          </Link>
          <Link 
            href="#"
            onClick={(e) => handleAuthClick(e, '/auth/sign-up')}
            className="bg-white text-sm font-medium text-indigo-600 px-3 py-2 rounded-full hover:bg-indigo-100 transition-colors"
          >
            <span>Sign Up</span>
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}; 