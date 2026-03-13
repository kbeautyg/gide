/**
 * Логотип Inturex Pro с диагональным разделением цветов
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
    lg: 'text-4xl'
  }

  const logo = (
    <div className={`font-bold tracking-tight whitespace-nowrap flex items-center ${sizeClasses[size]} ${className}`}>
      <span className="text-[#FF385C] mr-1">In</span>
      <span className="text-[#FF385C]">Turex</span>
      <span className="ml-1 text-[#FF385C]/70 font-light hidden sm:inline-block">Pro</span>
    </div>
  )

  if (linkTo) {
    return (
      <Link to={linkTo} className="inline-block hover:opacity-90 transition-opacity">
        {logo}
      </Link>
    )
  }

  return logo
}

