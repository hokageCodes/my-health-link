import React from 'react'


export const Badge = ({
  children,
  variant = 'blue',
  className = '',
}) => {
  const variants = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    gray: 'bg-gray-100 text-gray-800',
  }
  
  const classes = `inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${variants[variant]} ${className}`
  
  return (
    <span className={classes}>
      {children}
    </span>
  )
}