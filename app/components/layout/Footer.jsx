// components/layout/Footer.tsx
'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { Heart, Mail, MapPin, Phone, Twitter, Facebook, Instagram, Linkedin, Shield, Lock, CheckCircle } from 'lucide-react'

const Footer = () => {
  const footerLinks = {
    product: [
      { name: 'How It Works', href: '#how-it-works' },
      { name: 'Features', href: '#features' },
      { name: 'Security & Privacy', href: '#security' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'API Documentation', href: '/docs' },
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'System Status', href: '/status' },
      { name: 'Report Issue', href: '/report' },
      { name: 'Feature Requests', href: '/feedback' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'NDPR Compliance', href: '/ndpr' },
      { name: 'Data Security', href: '/security' },
      { name: 'Cookie Policy', href: '/cookies' },
    ],
    company: [
      { name: 'About MyHealthLink', href: '/about' },
      { name: 'Our Mission', href: '/mission' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press Kit', href: '/press' },
      { name: 'Blog', href: '/blog' },
    ],
  }

  const socialLinks = [
    { icon: Twitter, href: '#', name: 'Twitter' },
    { icon: Facebook, href: '#', name: 'Facebook' },
    { icon: Instagram, href: '#', name: 'Instagram' },
    { icon: Linkedin, href: '#', name: 'LinkedIn' },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  }

  return (
    <footer className="bg-slate-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <motion.div
          className="grid lg:grid-cols-5 md:grid-cols-2 gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Company Info */}
          <motion.div className="lg:col-span-2" variants={itemVariants}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">MyHealthLink</h3>
                <p className="text-gray-400 text-sm">One Link for Your Health</p>
              </div>
            </div>
            
            <p className="text-gray-300 leading-relaxed mb-6">
              Empowering Nigerians to take control of their health records. 
              Secure, organized, and always accessible when you need them most.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-gray-300">
                <Mail className="w-5 h-5 text-secondary-400" />
                <span>hello@myhealth.link</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <MapPin className="w-5 h-5 text-secondary-400" />
                <span>Lagos, Nigeria</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Phone className="w-5 h-5 text-secondary-400" />
                <span>+234 (0) 800 HEALTH</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon className="w-5 h-5 text-gray-400 group-hover:text-secondary-400 transition-colors" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Product Links */}
          <motion.div variants={itemVariants}>
            <h4 className="font-semibold text-lg mb-6 text-white">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-secondary-400 transition-colors block py-1"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support Links */}
          <motion.div variants={itemVariants}>
            <h4 className="font-semibold text-lg mb-6 text-white">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-secondary-400 transition-colors block py-1"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company & Legal */}
          <motion.div variants={itemVariants}>
            <h4 className="font-semibold text-lg mb-6 text-white">Company</h4>
            <ul className="space-y-3 mb-8">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-secondary-400 transition-colors block py-1"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>

            <h4 className="font-semibold text-lg mb-6 text-white">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.slice(0, 3).map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-secondary-400 transition-colors block py-1"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          className="mt-16 pt-8 border-t border-slate-800"
          variants={itemVariants}
        >
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3 text-gray-300">
              <Shield className="w-6 h-6 text-green-400" />
              <div>
                <p className="font-medium">Bank-Level Security</p>
                <p className="text-sm text-gray-400">256-bit SSL encryption</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <Lock className="w-6 h-6 text-blue-400" />
              <div>
                <p className="font-medium">NDPR Compliant</p>
                <p className="text-sm text-gray-400">Your data, your control</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <CheckCircle className="w-6 h-6 text-secondary-400" />
              <div>
                <p className="font-medium">99.9% Uptime</p>
                <p className="text-sm text-gray-400">Always accessible</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              © 2025 MyHealthLink. All rights reserved. Made with ❤️ in Nigeria.
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="/privacy" className="hover:text-secondary-400 transition-colors">
                Privacy
              </a>
              <a href="/terms" className="hover:text-secondary-400 transition-colors">
                Terms
              </a>
              <a href="/cookies" className="hover:text-secondary-400 transition-colors">
                Cookies
              </a>
              <a href="/sitemap" className="hover:text-secondary-400 transition-colors">
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer