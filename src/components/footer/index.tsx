import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Twitter, Linkedin, Instagram, Mail, MapPin, Phone } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-background text-foreground relative z-60 border-t border-border/40">
      {/* Main Footer Content */}
      <div className="container px-4 py-16 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="space-y-6">
            <Link href="/">
              <Image 
                src="/icons/High-Resolution-Logo-White-on-Transparent-Background.svg" 
                alt="Brief Support Logo" 
                width={150} 
                height={40}
                style={{ height: 'auto' }}
              />
            </Link>
            <p className="text-foreground/70 max-w-xs">
              Transforming customer service with AI-powered solutions that drive growth and satisfaction.
            </p>
            <div className="flex space-x-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-foreground/70 hover:text-primary transition-colors p-2">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-foreground/70 hover:text-primary transition-colors p-2">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-foreground/70 hover:text-primary transition-colors p-2">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-foreground/70 hover:text-primary transition-colors p-2">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-4">
              {[
                { text: 'Home', href: '/' },
                { text: 'Features', href: '#features' },
                { text: 'Pricing', href: '#pricing' },
                { text: 'Customer Feedback', href: '#customer-feedback' },
                { text: 'Newsletter', href: '#newsletter' },
              ].map((link) => (
                <li key={link.text}>
                  <Link 
                    href={link.href}
                    className="text-foreground/70 hover:text-primary transition-colors inline-block py-1"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-6">Company</h3>
            <ul className="space-y-4">
              {[
                // { text: 'About Us', href: '/about' },
                // { text: 'Blog', href: '/blog' },
                { text: 'Careers', href: '/careers' },
                { text: 'Contact Us', href: '/contact' },
                // { text: 'Documentation', href: '/docs' },
              ].map((link) => (
                <li key={link.text}>
                  <Link 
                    href={link.href}
                    className="text-foreground/70 hover:text-primary transition-colors inline-block py-1"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li>
                <a 
                  href="mailto:support@briefsupport.com" 
                  className="flex items-center space-x-3 text-foreground/70 hover:text-primary transition-colors py-1"
                >
                  <Mail className="w-5 h-5" />
                  <span>support@briefsupport.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/40">
        <div className="container px-4 py-6 mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-foreground/60">
            © {new Date().getFullYear()} Brief Support. All rights reserved.
          </div>
          <div className="flex space-x-6 text-sm">
            <Link href="/privacy" className="text-foreground/60 hover:text-primary transition-colors py-1 px-2">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-foreground/60 hover:text-primary transition-colors py-1 px-2">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-foreground/60 hover:text-primary transition-colors py-1 px-2">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
