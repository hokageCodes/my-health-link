// components/sections/HeroSection.tsx
'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, Star, Users, CheckCircle } from 'lucide-react'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Section } from '../ui/Section'
import { Container } from '../ui/Container'
import { FadeIn } from '../ui/FadeIn'

const HeroSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
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

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  }

  return (
    <Section className="min-h-screen flex items-center" background="gradient">
      <Container>
        <motion.div
          className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left Content */}
          <motion.div className="space-y-8" variants={itemVariants}>
            {/* Trust Badge */}
            <motion.div variants={itemVariants}>
              <Badge variant="blue" className="inline-flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Secure & NDPR Compliant
              </Badge>
            </motion.div>

            {/* Main Headline */}
            <motion.div className="space-y-4" variants={itemVariants}>
              <h1 className="text-hero font-bold text-primary-600 leading-tight">
                One Link{' '}
                <span className="text-gray-800">for Your Health Records</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Never lose your medical records again. Store lab results, prescriptions and medical profile in one secure, shareable link.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              variants={itemVariants}
            >
              <Button 
                variant="primary" 
                size="lg" 
                icon={ArrowRight}
                className="bg-primary-600 hover:bg-primary-700"
              >
                Get Started Free
              </Button>
              <Button variant="ghost" size="lg">
                See How It Works
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 pt-4"
              variants={itemVariants}
            >
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-5 h-5 text-secondary-600" />
                <span className="text-sm">500+ Nigerians trust us</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm">Trusted by patients & doctors</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Visual */}
          <motion.div 
            className="relative"
            variants={itemVariants}
          >
            {/* Main Mockup */}
            <motion.div
              className="relative z-10"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
                {/* Mock Health Profile Interface */}
                <div className="space-y-4">
                  {/* Profile Header */}
                  <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-semibold">JD</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">John Doe</h3>
                      <p className="text-sm text-gray-500">Blood Type: O+</p>
                    </div>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-xs text-green-600 font-medium">Current Meds</p>
                      <p className="text-sm font-semibold text-green-900">2 Active</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs text-blue-600 font-medium">Last Check</p>
                      <p className="text-sm font-semibold text-blue-900">2 days ago</p>
                    </div>
                  </div>
                  
                  {/* Recent Activity */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 text-sm">Recent Activity</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-700">Lab results uploaded</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-700">BP tracked: 120/80</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floating Elements */}
            <motion.div
              className="absolute -top-6 -right-6 bg-secondary-500 text-white p-4 rounded-xl shadow-lg z-20"
              variants={floatingVariants}
              animate="animate"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">Secure</span>
              </div>
            </motion.div>

            <motion.div
              className="absolute -bottom-4 -left-4 bg-white p-4 rounded-xl shadow-lg z-20 border border-gray-100"
              variants={floatingVariants}
              animate="animate"
              style={{ animationDelay: '1s' }}
            >
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-600">500+</p>
                <p className="text-xs text-gray-600">Happy Users</p>
              </div>
            </motion.div>

            {/* Background Decorative Elements */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-primary-100 rounded-full opacity-20 animate-pulse-slow" />
              <div className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-secondary-100 rounded-full opacity-20 animate-pulse-slow" style={{ animationDelay: '2s' }} />
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </Section>
  )
}

export default HeroSection