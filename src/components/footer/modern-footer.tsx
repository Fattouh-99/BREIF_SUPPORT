'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Twitter, Github, Linkedin, Facebook, Instagram, Mail } from 'lucide-react';
import { RevealOnScroll } from '@/components/motion/parallax-scroll';
import { SUPPORT_EMAIL } from '@/constants/support';

interface FooterLink {
  title: string;
  href: string;
  external?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const footerSections: FooterSection[] = [
  {
    title: 'Product',
    links: [
      { title: 'Features', href: '#features' },
      { title: 'Pricing', href: '#pricing' },
      { title: 'Documentation', href: '/docs' },
    ],
  },
  {
    title: 'Company',
    links: [
      { title: 'About', href: '/about' },
      { title: 'Blog', href: '/blog' },
      { title: 'Careers', href: '/careers' },
      { title: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { title: 'Help Center', href: '/help' },
      { title: 'Testimonials', href: '#customer-feedback' },
      { title: 'Newsletter', href: '#newsletter' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { title: 'Privacy Policy', href: '/privacy' },
      { title: 'Terms of Service', href: '/terms' },
      { title: 'Cookie Policy', href: '/cookies' },
    ],
  },
];

const socialLinks = [
  { title: 'Twitter', href: 'https://twitter.com', icon: Twitter, external: true },
  { title: 'LinkedIn', href: 'https://linkedin.com', icon: Linkedin, external: true },
  { title: 'GitHub', href: 'https://github.com', icon: Github, external: true },
  { title: 'Email', href: `mailto:${SUPPORT_EMAIL}`, icon: Mail, external: true },
];

export function ModernFooter() {
  return (
    <footer className="container px-4 mx-auto">      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-10">
        <div className="lg:col-span-1">
          <RevealOnScroll>
            <Link href="/" className="font-bold text-xl flex items-center gap-2 mb-6">
              <span className="bg-primary text-white rounded-md p-1">BS</span>
              <span>Brief <span className="text-primary">Support</span></span>
            </Link>
            <p className="text-foreground/70 mb-6">
              Empowering businesses with next-generation AI solutions that drive growth and efficiency.
            </p>
          </RevealOnScroll>
          
          <RevealOnScroll delay={0.1}>
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.title}
                    href={social.href}
                    target={social.external ? "_blank" : undefined}
                    rel={social.external ? "noopener noreferrer" : undefined}
                    className="w-9 h-9 rounded-full border border-border/40 flex items-center justify-center text-foreground/70 hover:text-foreground hover:border-border hover:bg-muted transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={social.title}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.a>
                );
              })}
            </div>
          </RevealOnScroll>
        </div>
        
        {footerSections.map((section, index) => (
          <div key={section.title} className="space-y-4">
            <RevealOnScroll delay={0.05 * (index + 1)}>
              <h3 className="font-bold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.title}>
                    <Link
                      href={link.href}
                      className="text-foreground/70 hover:text-foreground transition-colors"
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </RevealOnScroll>
          </div>
        ))}
      </div>
      
      <div className="border-t border-border/40 py-6 mt-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-foreground/60">
            © {new Date().getFullYear()} Brief Support. All rights reserved.
          </p>
          
          <div className="flex gap-6">
            <Link href="/privacy" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 