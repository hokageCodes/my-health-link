// components/sections/FinalCTASection.tsx
'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle, Clock, Shield, Heart, Smartphone, Users } from 'lucide-react'
import { Button } from '../ui/Button'
import { Section } from '../ui/Section'
import { Container } from '../ui/Container'
import { FadeIn } from '../ui/FadeIn'

const FinalCTASection = () => {
  const benefits = [
    { icon: Clock, text: "Set up in under 5 minutes" },
    { icon: Shield, text: "Bank-level security guaranteed" },
    { icon: CheckCircle, text: "Free forever, no hidden fees" },
    { icon: Users, text: "No credit card required" },
  ]

  const urgencyReasons = [
    {
      icon: Heart,
      title: "Your Next Emergency",
      description: "When every second counts, having your medical history instantly accessible could save your life"
    },
    {
      icon: Smartphone,
      title: "Stop Losing Documents",
      description: "How many times will you retake the same tests because you can't find the results?"
    },
    {
      icon: Users,
      title: "Peace of Mind",
      description: "Sleep better knowing your family's complete health history is organized and secure"
    }
  ]

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  }

  return (
    <Section className="relative overflow-hidden" background="gradient">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-200 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary-200 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <Container className="relative">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-800 px-4 py-2 rounded-full font-medium mb-6">
              <Heart className="w-4 h-4" />
              Join 500+ Nigerians Taking Control of Their Health
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Start Building Your
              <br />
              <span className="text-primary-600">Health Profile Today</span>
            </h2>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              Don't wait for the next medical emergency or lost document to take action. 
              Your future self will thank you for organizing your health records today.
            </p>
          </FadeIn>

          {/* Urgency Reasons */}
          <FadeIn delay={0.3}>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {urgencyReasons.map((reason, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-soft flex items-center justify-center mx-auto mb-4">
                    <reason.icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{reason.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{reason.description}</p>
                </motion.div>
              ))}
            </div>
          </FadeIn>

          {/* Main CTA */}
          <FadeIn delay={0.6}>
            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-200 mb-8">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="text-left lg:flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Ready to Get Started?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Create your secure health profile in less time than it takes to find 
                    a lost prescription bottle.
                  </p>
                  
                  {/* Benefits Checklist */}
                  <div className="grid sm:grid-cols-2 gap-3 mb-6">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <benefit.icon className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{benefit.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:flex-1 text-center">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      variant="primary" 
                      size="lg" 
                      icon={ArrowRight}
                      className="bg-primary-600 hover:bg-primary-700 text-lg px-12 py-4 mb-4"
                    >
                      Create My Health Profile
                    </Button>
                  </motion.div>
                  
                  <p className="text-sm text-gray-500 mb-4">
                    Free forever • No credit card required
                  </p>

                  <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Secure</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>NDPR Compliant</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span>Nigerian-Made</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Alternative Options */}
          <FadeIn delay={0.8}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button variant="ghost" size="lg">
                Watch 2-Minute Demo
              </Button>
              <span className="text-gray-400">or</span>
              <Button variant="secondary" size="lg">
                Download Sample Profile
              </Button>
            </div>
          </FadeIn>

          {/* Social Proof Reminder */}
          <FadeIn delay={1}>
            <div className="mt-12 p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20">
              <p className="text-gray-600 mb-3">
                <strong>Still not sure?</strong> Here's what happened to recent users:
              </p>
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-gray-700">Sarah saved 2 hours at her doctor visit</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-gray-700">Ahmed avoided retaking ₦15,000 in tests</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-gray-700">Kemi's emergency was handled in minutes</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-10 right-10 hidden lg:block"
          variants={floatingVariants}
          animate="animate"
        >
          <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center">
            <Heart className="w-10 h-10 text-red-400" />
          </div>
        </motion.div>

        <motion.div
          className="absolute bottom-10 left-10 hidden lg:block"
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: '2s' }}
        >
          <div className="w-16 h-16 bg-primary-600 rounded-xl shadow-lg flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </motion.div>
      </Container>
    </Section>
  )
}

export default FinalCTASection