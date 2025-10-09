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
    <div className={`font-bold ${sizeClasses[size]} ${className} relative inline-block`}>
      {/* Текст */}
      <div className="flex items-center gap-0">
        <span className="text-airbnb-rausch">Turex</span>
        <span className="text-black">Pro</span>
      </div>
      
      {/* Диагональная линия через текст */}
      <div 
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ 
          transform: 'translateZ(0)' // GPU acceleration
        }}
      >
        <div 
          className="absolute bg-airbnb-rausch"
          style={{
            width: '150%',
            height: '3px',
            top: '50%',
            left: '-25%',
            transform: 'rotate(-15deg) translateY(-50%)',
            boxShadow: '0 0 8px rgba(255, 56, 92, 0.5)'
          }}
        />
      </div>
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

