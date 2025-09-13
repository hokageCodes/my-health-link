// components/sections/SolutionSection.tsx
'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Link, TrendingUp, Smartphone, QrCode, FileText } from 'lucide-react'
import { Section } from '../ui/Section'
import { Container } from '../ui/Container'
import { FadeIn } from '../ui/FadeIn'
import { Button } from '../ui/Button'

const SolutionSection = () => {
  const features = [
    {
      icon: Shield,
      title: "Store Securely",
      description: "Upload and organize all your health documents with bank-level encryption",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Link,
      title: "Share Instantly",
      description: "One link gives doctors your complete history - no more scattered files",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "Monitor health metrics over time with beautiful, easy-to-read charts",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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
    <Section background="white" className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-transparent" />
      
      <Container className="relative">
        <FadeIn className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Everything in One Place.{' '}
            <span className="text-primary-600">Always Accessible.</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your complete health profile, organized and shareable with a single secure link. 
            It's like having a digital health assistant that never forgets.
          </p>
        </FadeIn>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Features */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="space-y-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex gap-4 group"
              >
                <div className={`${feature.bgColor} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300 h-fit`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* CTA */}
            <motion.div variants={itemVariants} className="pt-4">
              <Button variant="primary" size="lg" className="bg-primary-600 hover:bg-primary-700">
                See It In Action
              </Button>
            </motion.div>
          </motion.div>

          {/* Right: Product Demo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Main Interface Mockup */}
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Browser Header */}
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="flex-1 bg-white rounded px-3 py-1 text-sm text-gray-500 ml-4">
                  myhealth.link/john-doe
                </div>
              </div>

              {/* Interface Content */}
              <div className="p-6">
                {/* Profile Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      JD
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">John Doe</h3>
                      <p className="text-gray-500">Last updated 2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      O+ Blood
                    </div>
                  </div>
                </div>

                {/* Emergency Info */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-800 font-medium text-sm">Emergency Information</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-red-600 font-medium">Allergies:</span>
                      <p className="text-red-700">Penicillin, Shellfish</p>
                    </div>
                    <div>
                      <span className="text-red-600 font-medium">Emergency Contact:</span>
                      <p className="text-red-700">Sarah Doe - 080XXXXXXXX</p>
                    </div>
                  </div>
                </div>

                {/* Current Health Status */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">120/80</div>
                    <div className="text-xs text-blue-600">Blood Pressure</div>
                    <div className="text-xs text-gray-500">Today</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">3</div>
                    <div className="text-xs text-green-600">Active Meds</div>
                    <div className="text-xs text-gray-500">Current</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">12</div>
                    <div className="text-xs text-purple-600">Documents</div>
                    <div className="text-xs text-gray-500">Stored</div>
                  </div>
                </div>

                {/* Recent Documents */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Recent Documents</h4>
                  <div className="space-y-2">
                    {[
                      { type: 'Lab Result', name: 'Blood Work - Complete Panel', date: '2 days ago', icon: FileText },
                      { type: 'Prescription', name: 'Lisinopril 10mg Daily', date: '1 week ago', icon: FileText },
                      { type: 'X-Ray', name: 'Chest X-Ray Report', date: '2 weeks ago', icon: FileText },
                    ].map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <doc.icon className="w-5 h-5 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                          <p className="text-xs text-gray-500">{doc.type} • {doc.date}</p>
                        </div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Action Buttons */}
            <motion.div
              className="absolute -top-4 -right-4 bg-primary-600 text-white p-3 rounded-xl shadow-lg"
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <QrCode className="w-6 h-6" />
            </motion.div>

            <motion.div
              className="absolute -bottom-4 -left-4 bg-secondary-600 text-white p-3 rounded-xl shadow-lg"
              animate={{ y: [5, -5, 5] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
              <Smartphone className="w-6 h-6" />
            </motion.div>

            {/* Background Glow */}
            <div className="absolute -inset-10 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-3xl opacity-20 -z-10 blur-2xl"></div>
          </motion.div>
        </div>

        {/* Bottom Stats */}
        <FadeIn delay={0.8} className="text-center mt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '500+', label: 'Active Users' },
              { number: '5,000+', label: 'Documents Stored' },
              { number: '99.9%', label: 'Uptime' },
              { number: '24/7', label: 'Access Anywhere' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </FadeIn>
      </Container>
    </Section>
  )
}

export default SolutionSection