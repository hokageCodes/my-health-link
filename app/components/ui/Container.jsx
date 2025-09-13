import React from 'react'

export const Container = ({
  children,
  maxWidth = 'content',
  className = '',
}) => {
  const maxWidths = {
    content: 'max-w-content',
    full: 'max-w-full',
    prose: 'max-w-prose',
  }
  
  const classes = `${maxWidths[maxWidth]} mx-auto px-6 ${className}`
  
  return (
    <div className={classes}>
      {children}
    </div>
  )
}
