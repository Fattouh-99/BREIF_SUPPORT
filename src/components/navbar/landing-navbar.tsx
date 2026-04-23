'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NavItem {
  name: string;
  href: string;
}

const navItems: NavItem[] = [
  // { name: 'Features', href: '#features' },
  // { name: 'Contact', href: '#contact' },
];

export function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Function to handle login button click
  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/auth/sign-in');
  };

  // Function to handle signup button click
  const handleSignupClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/auth/sign-up');
  };

  return (
    <header
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-300 ease-in-out',
        isScrolled
          ? 'bg-background/80 backdrop-blur-lg border-b border-border/40 py-3'
          : 'bg-transparent py-5'
      )}
    >
      <div className="container px-4 mx-auto flex items-center justify-between">
        <Link 
          href="/" 
          className="font-bold text-xl flex items-center gap-2"
        >
          <span className="bg-primary text-white rounded-md p-1">BS</span>
          <span>Brief <span className="text-primary">Support</span></span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-foreground/80 hover:text-foreground transition-colors font-medium"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          
          <Button asChild className="rounded-full" onClick={handleSignupClick}>
            <Link href="#" onClick={handleSignupClick}>Get Started</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full" onClick={handleLoginClick}>
            <Link href="#" onClick={handleLoginClick}>Log In</Link>
          </Button>
        </div>

        {/* Mobile Navigation Toggle */}
        <div className="flex md:hidden items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle mobile menu"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="rounded-full"
          >
            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-background border-b border-border/40"
          >
            <div className="container px-4 py-6 flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className="text-foreground/80 hover:text-foreground py-2 transition-colors font-medium"
                >
                  {item.name}
                </Link>
              ))}
              <Button 
                className="mt-4 rounded-full" 
                onClick={(e) => {
                  setMobileNavOpen(false);
                  handleSignupClick(e);
                }}
              >
                <Link href="#" onClick={handleSignupClick}>Get Started</Link>
              </Button>
              <Button 
                variant="outline" 
                className="rounded-full" 
                onClick={(e) => {
                  setMobileNavOpen(false);
                  handleLoginClick(e);
                }}
              >
                <Link href="#" onClick={handleLoginClick}>Log In</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
} 