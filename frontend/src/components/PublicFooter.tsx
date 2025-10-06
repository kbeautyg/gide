import { Link } from 'react-router-dom'

export function PublicFooter() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">ThaiGuide Pro</h3>
            <p className="text-gray-400">
              Лучшие экскурсии по всей Азии с русскоязычными гидами
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Экскурсии</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/tours?location=phuket" className="hover:text-white transition-colors">Пхукет</Link></li>
              <li><Link to="/tours?location=pattaya" className="hover:text-white transition-colors">Паттайя</Link></li>
              <li><Link to="/tours?location=bangkok" className="hover:text-white transition-colors">Бангкок</Link></li>
              <li><Link to="/tours?location=krabi" className="hover:text-white transition-colors">Краби</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Компания</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/about" className="hover:text-white transition-colors">О нас</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Контакты</Link></li>
              <li><Link to="/request" className="hover:text-white transition-colors">Заказать экскурсию</Link></li>
              <li><Link to="/guides" className="hover:text-white transition-colors">Стать гидом</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Поддержка</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Условия использования</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Политика конфиденциальности</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>© 2025 ThaiGuide Pro. Все права защищены.</p>
        </div>
      </div>
    </footer>
  )
}
