/**
 * Логотип Turex Pro с диагональным разделением цветов
 * Половина черная, половина малиновая
 */
import { Link } from 'react-router-dom'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  linkTo?: string
  className?: string
}

export function Logo({ size = 'md', linkTo = '/', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  }

  const logo = (
    <div className={`font-bold ${sizeClasses[size]} ${className}`}>
      {/* Диагональный градиент: черный → малиновый */}
      <span 
        className="bg-gradient-to-br from-black via-black via-50% to-airbnb-rausch bg-clip-text text-transparent"
        style={{ 
          backgroundSize: '200% 200%',
          backgroundPosition: '0% 0%'
        }}
      >
        Turex
      </span>
      <span className="text-airbnb-rausch"> Pro</span>
    </div>
  )

  if (linkTo) {
    return (
      <Link to={linkTo} className="inline-block">
        {logo}
      </Link>
    )
  }

  return logo
}

