// components/sections/HowItWorksSection.tsx
'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { UserPlus, Upload, Share2, BarChart3, ArrowRight, CheckCircle } from 'lucide-react'
import { Section } from '../ui/Section'
import { Container } from '../ui/Container'
import { FadeIn } from '../ui/FadeIn'

const HowItWorksSection = () => {
  const steps = [
    {
      number: 1,
      icon: UserPlus,
      title: "Create Your Profile",
      description: "Add basic info, blood type, allergies, current medications in just 5 minutes",
      details: ["Enter personal information", "Add emergency contacts", "Set privacy preferences"],
      color: "blue",
    },
    {
      number: 2,
      icon: Upload,
      title: "Upload Documents",
      description: "Drag and drop lab results, prescriptions, X-rays - we'll organize everything",
      details: ["Drag & drop any file format", "Auto-categorize documents", "OCR text extraction"],
      color: "green",
    },
    {
      number: 3,
      icon: Share2,
      title: "Share & Access",
      description: "Generate your secure link and QR code for instant sharing with healthcare providers",
      details: ["One-click link generation", "Downloadable QR code", "Control what you share"],
      color: "purple",
    },
    {
      number: 4,
      icon: BarChart3,
      title: "Track & Monitor",
      description: "Set up custom health tracking for any metric - BP, weight, medications, and more",
      details: ["Custom tracking periods", "Visual progress charts", "Reminder notifications"],
      color: "orange",
    },
  ]

  const colors = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', accent: 'bg-blue-600' },
    green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', accent: 'bg-green-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', accent: 'bg-purple-600' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', accent: 'bg-orange-600' },
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  }

  const stepVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  }

  return (
    <Section background="gray" className="relative">
      <Container>
        <FadeIn className="text-center mb-20">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Get Started in <span className="text-primary-600">Minutes</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Setting up your digital health profile is simple, secure, and completely free. 
            Here's how it works:
          </p>
        </FadeIn>

        {/* Desktop Timeline */}
        <div className="hidden lg:block">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="relative"
          >
            {/* Timeline Line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-green-200 via-purple-200 to-orange-200"></div>

            <div className="grid grid-cols-4 gap-8">
              {steps.map((step, index) => {
                const color = colors[step.color]
                return (
                  <motion.div
                    key={index}
                    variants={stepVariants}
                    className="relative"
                  >
                    {/* Step Circle */}
                    <div className="relative z-10 mx-auto w-fit">
                      <div className={`w-20 h-20 ${color.accent} rounded-full flex items-center justify-center mb-6 shadow-lg`}>
                        <step.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className={`absolute -top-2 -right-2 w-8 h-8 bg-white ${color.border} border-2 rounded-full flex items-center justify-center text-sm font-bold ${color.text}`}>
                        {step.number}
                      </div>
                    </div>

                    {/* Step Content */}
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                        {step.description}
                      </p>
                      <div className="space-y-2">
                        {step.details.map((detail, idx) => (
                          <div key={idx} className="flex items-center justify-center gap-2 text-xs text-gray-500">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span>{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* Mobile/Tablet Vertical Layout */}
        <div className="lg:hidden">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="space-y-12"
          >
            {steps.map((step, index) => {
              const color = colors[step.color]
              const isLast = index === steps.length - 1
              
              return (
                <motion.div
                  key={index}
                  variants={stepVariants}
                  className="relative"
                >
                  {/* Connection Line */}
                  {/* {!isLast && (
                    <div className="absolute left-10 top-20 w-0.5 h-12 bg-gradient-to-b from-gray-300 to-transparent"></div>
                  )} */}

                  <div className="flex gap-6">
                    {/* Step Icon */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-20 h-20 ${color.accent} rounded-full flex items-center justify-center shadow-lg`}>
                        <step.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className={`absolute -top-2 -right-2 w-8 h-8 bg-white ${color.border} border-2 rounded-full flex items-center justify-center text-sm font-bold ${color.text}`}>
                        {step.number}
                      </div>
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 pt-2">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {step.description}
                      </p>
                      <div className="space-y-2">
                        {step.details.map((detail, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-gray-500">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>

        {/* Call to Action */}
        <FadeIn delay={0.8} className="text-center mt-20">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-gray-600 mb-6">
              Join hundreds of Nigerians who have already organized their health records. 
              It's free, secure, and takes less than 5 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                Create My Health Profile
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="text-primary-600 hover:bg-primary-50 px-8 py-3 rounded-lg font-medium transition-colors border border-primary-600"
              >
                Watch Demo (2 min)
              </motion.button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Free forever</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>NDPR compliant</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>No credit card required</span>
              </div>
            </div>
          </div>
        </FadeIn>
      </Container>
    </Section>
  )
}

export default HowItWorksSection