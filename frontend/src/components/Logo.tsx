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
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12'
  }

  const logo = (
    <img
      src="/logo.png"
      alt="Turex Pro"
      className={`${sizeClasses[size]} ${className} object-contain`}
      style={{ width: 'auto' }}
    />
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

