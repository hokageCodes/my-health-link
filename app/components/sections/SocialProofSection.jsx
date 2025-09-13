// components/sections/SocialProofSection.tsx
'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { Star, Heart, Users, Stethoscope, Quote } from 'lucide-react'
import { Section } from '../ui/Section'
import { Container } from '../ui/Container'
import { FadeIn } from '../ui/FadeIn'

const SocialProofSection = () => {
  const testimonials = [
    {
      name: "Adunni Olatunji",
      role: "Mother of 3",
      condition: "Managing Family Health",
      avatar: "/api/placeholder/60/60",
      rating: 5,
      testimonial: "MyHealthLink has been a lifesaver for managing my family's health records. When my youngest had an emergency, I could instantly share his vaccination history and allergy information with the doctors. No more digging through papers or trying to remember dates!",
      highlight: "Shared critical info instantly during emergency"
    },
    {
      name: "Dr. Kemi Adebayo",
      role: "General Practitioner",
      condition: "Lagos University Teaching Hospital",
      avatar: "/api/placeholder/60/60",
      rating: 5,
      testimonial: "I encourage all my patients to use MyHealthLink. Having complete health histories accessible during consultations helps me make better diagnoses and treatment decisions. The organized format saves so much time during appointments.",
      highlight: "Helps doctors make better treatment decisions"
    },
    {
      name: "Chukwudi Okafor",
      role: "Diabetic Patient",
      condition: "Type 2 Diabetes Management",
      avatar: "/api/placeholder/60/60",
      rating: 5,
      testimonial: "Tracking my blood sugar levels and medication has never been easier. The reminders keep me consistent, and when I visit my endocrinologist, she can see my complete progress history. My HbA1c has improved significantly since I started using this app.",
      highlight: "HbA1c improved with consistent tracking"
    },
    {
      name: "Fatima Ibrahim",
      role: "Business Executive",
      condition: "Frequent Traveler",
      avatar: "/api/placeholder/60/60",
      rating: 5,
      testimonial: "I travel between Lagos, Abuja, and Kano frequently for work. Having my health profile accessible anywhere has been incredible. When I needed urgent care in Abuja, the doctor had my complete medical history in seconds.",
      highlight: "Access to health records anywhere in Nigeria"
    },
    {
      name: "Elderly Care Home",
      role: "Sunrise Care Center",
      condition: "Managing 50+ Elderly Residents",
      avatar: "/api/placeholder/60/60",
      rating: 5,
      testimonial: "Managing health records for our residents used to be a nightmare of paperwork. Now each resident has their complete history accessible instantly. The emergency information feature has helped paramedics provide better care during urgent situations.",
      highlight: "Streamlined care for 50+ elderly residents"
    },
    {
      name: "Tunde Bakare",
      role: "Hypertension Patient",
      condition: "Managing High Blood Pressure",
      avatar: "/api/placeholder/60/60",
      rating: 5,
      testimonial: "The blood pressure tracking feature is fantastic. I can easily spot patterns and share detailed reports with my cardiologist. My doctor says I'm one of his most prepared patients because I always come with organized data.",
      highlight: "Doctor says I'm his most prepared patient"
    }
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
    <Section background="gray">
      <Container>
        <FadeIn className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium mb-6">
            <Heart className="w-4 h-4" />
            Trusted by Patients and Doctors
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Real Stories from Real{' '}
            <span className="text-primary-600">Nigerian Families</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join hundreds of Nigerians who have already taken control of their health records. 
            Here's what they have to say about MyHealthLink.
          </p>
        </FadeIn>

        {/* Stats Bar */}
    

        {/* Testimonials Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="group"
            >
              <div className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-primary-200 hover:shadow-soft transition-all duration-300 h-full relative">
                {/* Quote Icon */}
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <Quote className="w-4 h-4 text-white" />
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-gray-700 leading-relaxed mb-6 italic">
                  "{testimonial.testimonial}"
                </p>

                {/* Highlight */}
                <div className="bg-blue-50 text-blue-800 px-3 py-2 rounded-lg text-sm font-medium mb-6">
                  💡 {testimonial.highlight}
                </div>

                {/* User Info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                    <p className="text-xs text-gray-500">{testimonial.condition}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust Indicators */}
        <FadeIn className="bg-white rounded-2xl p-8 border border-gray-200">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Healthcare Professionals Love MyHealthLink
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're working with leading healthcare providers across Nigeria to improve patient care
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">50+ Doctors</h4>
              <p className="text-gray-600 text-sm">Actively recommend MyHealthLink to their patients</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">15+ Clinics</h4>
              <p className="text-gray-600 text-sm">Use MyHealthLink links for faster patient consultations</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">3 Hospitals</h4>
              <p className="text-gray-600 text-sm">Piloting integration with MyHealthLink for emergency care</p>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold text-gray-900">Healthcare Professional?</span>
            </div>
            <p className="text-center text-gray-700 mb-4">
              Join our healthcare provider program and help your patients organize their health records better.
            </p>
            <div className="text-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Learn About Provider Program
              </motion.button>
            </div>
          </div>
        </FadeIn>
      </Container>
    </Section>
  )
}

export default SocialProofSection