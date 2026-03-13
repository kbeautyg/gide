import { motion, useInView } from 'framer-motion'
import { useRef, ReactNode } from 'react'

interface FadeInSectionProps {
  children: ReactNode
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  className?: string
}

export function FadeInSection({ 
  children, 
  delay = 0, 
  direction = 'up',
  className = ''
}: FadeInSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const directions = {
    up: { y: 40 },
    down: { y: -40 },
    left: { x: 40 },
    right: { x: -40 }
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, ...directions[direction] }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: [0.25, 0.1, 0.25, 1] // Кривая Безье для плавной анимации
      }}
    >
      {children}
    </motion.div>
  )
}

