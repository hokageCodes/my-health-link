'use client'
import React from 'react'
import { motion } from 'framer-motion'

export const FadeIn = ({
  children,
  delay = 0,
  direction = 'up',
  className = '',
}) => {
  const directions = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
  }
  
  const initial = {
    opacity: 0,
    ...directions[direction],
  }
  
  const animate = {
    opacity: 1,
    x: 0,
    y: 0,
  }
  
  return (
    <motion.div
      initial={initial}
      whileInView={animate}
      transition={{
        duration: 0.6,
        delay,
        ease: 'easeOut',
      }}
      viewport={{ once: true, amount: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
