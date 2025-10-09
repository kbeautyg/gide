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
      src="/1760049644299-0199cb22-01c2-7f61-89e3-555384ad83b4 (1).png"
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

