import { Link } from 'react-router-dom'
import { buildToursLink } from '@/lib/navigationUtils'

export function PublicFooter() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

          <div>
            <h4 className="font-semibold mb-4">Экскурсии</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><Link to={buildToursLink({ location: 'Пхукет' })} className="hover:text-white transition-colors">Пхукет</Link></li>
              <li><Link to={buildToursLink({ location: 'Паттайя' })} className="hover:text-white transition-colors">Паттайя</Link></li>
              <li><Link to={buildToursLink({ location: 'Бангкок' })} className="hover:text-white transition-colors">Бангкок</Link></li>
              <li><Link to={buildToursLink({ location: 'Краби' })} className="hover:text-white transition-colors">Краби</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Компания</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><Link to="/about" className="hover:text-white transition-colors">О нас</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Контакты</Link></li>
              <li><Link to="/request" className="hover:text-white transition-colors">Заказать экскурсию</Link></li>
              <li><Link to="/become-guide" className="hover:text-white transition-colors">Стать гидом</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Офисы</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>🇹🇭 Пхукет, Таиланд</li>
              <li>🇰🇬 Бишкек, Кыргызстан</li>
              <li>🇷🇺 Москва, Россия</li>
            </ul>
            <div className="mt-4 space-y-1 text-gray-300 text-sm">
              <a href="mailto:help@inturex.pro" className="block hover:text-white transition-colors">help@inturex.pro</a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Время работы</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>🇹🇭 10:00—19:00 <span className="text-gray-400">(GMT+7)</span></li>
              <li>🇰🇬 9:00—19:00 <span className="text-gray-400">(GMT+6)</span></li>
              <li>🇷🇺 9:00—19:00 <span className="text-gray-400">(МСК)</span></li>
              <li className="pt-1 text-white/70">📧 Поддержка 24/7</li>
            </ul>
          </div>
        </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-gray-400 text-sm">© 2026 Inturex Pro. Все права защищены.</p>
            <div className="flex gap-4 text-gray-500 text-xs">
              <Link to="/terms" className="hover:text-white transition-colors">Условия</Link>
              <Link to="/privacy" className="hover:text-white transition-colors">Конфиденциальность</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
