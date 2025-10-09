import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Home, Search } from 'lucide-react'
import { PublicHeader } from '@/components/PublicHeader'
import { PublicFooter } from '@/components/PublicFooter'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicHeader />
      
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-2xl">
          <h1 className="text-9xl font-bold text-airbnb-rausch mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Страница не найдена
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            К сожалению, страница которую вы ищете не существует или была перемещена
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link to="/">
              <Button size="lg" className="bg-airbnb-rausch hover:bg-airbnb-rausch/90">
                <Home size={20} className="mr-2" />
                На главную
              </Button>
            </Link>
            <Link to="/tours">
              <Button size="lg" variant="outline">
                <Search size={20} className="mr-2" />
                Искать экскурсии
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <PublicFooter />
    </div>
  )
}

