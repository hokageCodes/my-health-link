'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { FileX, MessageSquare, AlertTriangle, ArrowRight } from 'lucide-react'
import { Section } from '../ui/Section'
import { Container } from '../ui/Container'
import { FadeIn } from '../ui/FadeIn'

const ProblemSection = () => {
  const problems = [
    {
      icon: FileX,
      title: "Records Everywhere",
      description: "Lab results with one provider, X-rays with another, prescriptions on paper. Your health records are scattered across multiple platforms and hospitals.",
      color: "text-red-400",
      bgColor: "bg-red-400/10",
    },
    {
      icon: FileX,
      title: "Lost Lab Results",
      description: "Without access to previous lab results, doctors may repeat tests, leading to unnecessary costs and delays in diagnosis.",
      color: "text-red-400",
      bgColor: "bg-red-400/10",
    },
    {
      icon: AlertTriangle,
      title: "Emergency Struggles",
      description: "In emergencies, critical medical infiormation is hard to access quickly. Doctors make decisions without knowing your allergies, medical histories or if youre on any medication",
      color: "text-orange-400",
      bgColor: "bg-orange-400/10",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  }

  return (
    <Section background="dark" className="text-white">
      <Container>
        <FadeIn className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">
            Your Health Records Are Probably <span className="text-secondary-400">Scattered.</span>
            
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Travelling? Changing hospitals? Medical records spread across different platrofms and hospitals, lost test results and inaccessible health history when we need it the most. Sounds familiar? We Fix That.
          </p>
        </FadeIn>

        <motion.div
          className="grid md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="group"
            >
              <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-slate-600 transition-all duration-300 h-full">
                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Icon */}
                  <div className={`p-4 rounded-2xl ${problem.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                    <problem.icon className={`w-8 h-8 ${problem.color}`} />
                  </div>
                  
                  {/* Content */}
                  <div>
                    <h3 className="text-xl font-semibold mb-3">{problem.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{problem.description}</p>
                  </div>
                  
                  {/* Hover effect */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRight className="w-5 h-5 text-secondary-400" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <FadeIn delay={0.6} className="text-center mt-16">
          <p className="text-lg text-gray-300 mb-2">
            These problems cost you time, money, and peace of mind.
          </p>
          <p className="text-secondary-400 font-medium">
            But there's a better way...
          </p>
        </FadeIn>
      </Container>
    </Section>
  )
}

export default ProblemSection