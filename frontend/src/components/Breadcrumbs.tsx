import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="bg-gray-100">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link 
            to="/" 
            className="hover:text-gray-900 transition-colors flex items-center gap-1"
          >
            <Home size={16} />
            <span>Главная</span>
          </Link>
          
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <ChevronRight size={16} className="text-gray-400" />
              {item.href ? (
                <Link 
                  to={item.href} 
                  className="hover:text-gray-900 transition-colors hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-900 font-medium">{item.label}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  )
}

