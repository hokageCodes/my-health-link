'use client'
import React from 'react'
import { motion } from 'framer-motion'

export const Section = ({
  children,
  background = 'white',
  padding = 'lg',
  className = '',
}) => {
  const backgrounds = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    dark: 'bg-slate-900',
    gradient: 'bg-gradient-to-br from-white to-blue-50',
  }
  
  const paddings = {
    sm: 'py-12',
    md: 'py-16',
    lg: 'py-section',
  }
  
  const classes = `${backgrounds[background]} ${paddings[padding]} ${className}`
  
  return (
    <section className={classes}>
      {children}
    </section>
  )
}