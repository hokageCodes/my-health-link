// components/sections/TrustSecuritySection.tsx
'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Lock, Eye, Download, Trash2, MapPin, CheckCircle, AlertCircle } from 'lucide-react'
import { Section } from '../ui/Section'
import { Container } from '../ui/Container'
import { FadeIn } from '../ui/FadeIn'

const TrustSecuritySection = () => {
  const securityFeatures = [
    {
      icon: Shield,
      title: "End-to-End Encryption",
      description: "Your health data is encrypted with AES-256 military-grade encryption before it even leaves your device",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Lock,
      title: "NDPR Compliant",
      description: "Full compliance with Nigeria Data Protection Regulation. Your data stays in Nigeria, under Nigerian law",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Eye,
      title: "You Control What's Shared",
      description: "Granular privacy controls - decide exactly what information is visible to whom, when",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Download,
      title: "Complete Data Export",
      description: "Download all your data anytime in multiple formats. Your health records are always yours",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      icon: Trash2,
      title: "Right to Be Forgotten",
      description: "Delete your account and all associated data with one click. No questions asked",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      icon: MapPin,
      title: "Data Stored in Nigeria",
      description: "All servers and backups are physically located in Nigeria for maximum data sovereignty",
      color: "text-secondary-600",
      bgColor: "bg-secondary-50",
    },
  ]

  const certifications = [
    { name: "SSL Certificate", status: "Active", icon: Shield },
    { name: "NDPR Compliance", status: "Certified", icon: CheckCircle },
    { name: "Security Audit", status: "Q1 2025", icon: Lock },
    { name: "Penetration Test", status: "Passed", icon: AlertCircle },
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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  }

  return (
    <Section id="security" className="relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='7' cy='7' r='7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <Container className="relative">
        <FadeIn className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium mb-6">
            <Shield className="w-4 h-4" />
            Your Health Data, Your Control
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Bank-Level Security with{' '}
            <span className="text-primary-600">Complete Transparency</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We understand that health data is deeply personal. That's why we've built 
            MyHealthLink with privacy and security as our foundation, not an afterthought.
          </p>
        </FadeIn>

        {/* Security Features Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {securityFeatures.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative"
            >
              <div className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-soft transition-all duration-300 h-full">
                <div className={`${feature.bgColor} p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Certifications & Trust Indicators */}
        <FadeIn className="bg-gray-50 rounded-2xl p-8 mb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Certifications */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Certifications & Compliance
              </h3>
              <div className="space-y-4">
                {certifications.map((cert, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <cert.icon className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{cert.name}</p>
                      <p className="text-sm text-gray-500">Status: {cert.status}</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Security Stats */}
            <div className="text-center">
              <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">Security Guarantee</span>
                </div>
                <p className="text-blue-800 text-sm">
                  If there's ever a security breach affecting your data, 
                  we'll notify you within 24 hours and provide a full incident report.
                </p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Privacy Promise */}
        <FadeIn className="text-center max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-8 rounded-2xl border border-primary-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Our Privacy Promise to You
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">We never sell your data</p>
                  <p className="text-gray-600 text-sm">Your health information is not a product to be sold</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">No third-party tracking</p>
                  <p className="text-gray-600 text-sm">No analytics, ads, or tracking beyond essential functions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Transparent policies</p>
                  <p className="text-gray-600 text-sm">Plain English privacy policy, no legal jargon</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-primary-200">
              <p className="text-gray-600 italic">
                "Your health data belongs to you. We're just the secure vault that keeps it safe and organized."
              </p>
              <p className="text-sm text-gray-500 mt-2">— MyHealthLink Team</p>
            </div>
          </div>
        </FadeIn>
      </Container>
    </Section>
  )
}

export default TrustSecuritySection