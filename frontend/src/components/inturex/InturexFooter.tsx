import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { api } from '@/lib/api'

/**
 * Inturex footer + newsletter band — warm editorial travel design.
 * Uses the .ix-scoped design system; render inside a .ix container.
 */
export function InturexFooter() {
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)

  const subscribe = async () => {
    const value = email.trim()
    if (!value || !value.includes('@')) {
      toast.error('Введите корректный e-mail')
      return
    }
    setSending(true)
    try {
      await api.post('/subscribe', { email: value })
      toast.success('Спасибо! Мы пришлём лучшие маршруты.')
      setEmail('')
    } catch {
      toast.error('Не удалось подписаться, попробуйте позже')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <div className="wrap">
        <div className="newsletter">
          <div>
            <span className="eyebrow" style={{ color: '#ffb3c1' }}>Рассылка Inturex</span>
            <h2 className="display">Лучшие маршруты Азии — раз в неделю</h2>
            <p>Подборки авторских экскурсий, советы гидов и честные цены в рублях. Без спама.</p>
          </div>
          <form
            className="nl-form"
            onSubmit={(e) => { e.preventDefault(); void subscribe() }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ваш e-mail"
              aria-label="E-mail для рассылки"
            />
            <button className="btn btn-primary" type="submit" disabled={sending}>
              {sending ? 'Отправляем…' : 'Подписаться'}
            </button>
          </form>
        </div>
      </div>

      <footer className="site-footer wrap">
        <div className="footer-cols">
          <div className="footer-brand">
            <Link className="brand" to="/">
              <span className="brand-mark" aria-hidden="true"><img src="/inturex-logo.png" alt="" /></span>
              <span style={{ color: 'var(--ink)' }}>Intur<span>e</span>x</span>
            </Link>
            <p>Маркетплейс авторских экскурсий по Азии с русскоязычными гидами. Честные цены в рублях, безопасное бронирование.</p>
            <div className="footer-social">
              <a href="https://t.me/inturex" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.9 4.3 3.4 11.5c-1 .4-1 1.8.1 2.1l4.6 1.4 1.8 5.5c.3.8 1.3 1 1.9.4l2.6-2.5 4.6 3.4c.7.5 1.7.1 1.9-.7l3-14.1c.2-1-.8-1.9-1.6-1.2zM9.7 14.3l8.2-5.1-6.7 6.1c-.2.2-.3.4-.4.7l-.3 2.3-1-4z" /></svg>
              </a>
              <a href="https://instagram.com/inturex" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
              </a>
            </div>
          </div>

          <div>
            <h4>Экскурсии</h4>
            <Link to="/tours?location=Таиланд">Таиланд</Link>
            <Link to="/tours?location=Вьетнам">Вьетнам</Link>
            <Link to="/tours?location=Япония">Япония</Link>
            <Link to="/tours">Все направления</Link>
          </div>

          <div>
            <h4>Компания</h4>
            <Link to="/about">О нас</Link>
            <Link to="/contact">Контакты</Link>
            <Link to="/request">Заказать экскурсию</Link>
            <Link to="/become-guide">Стать гидом</Link>
          </div>

          <div>
            <h4>Помощь</h4>
            <Link to="/faq">Вопросы и ответы</Link>
            <Link to="/journal">Журнал</Link>
            <Link to="/contact">Поддержка 24/7</Link>
          </div>

          <div>
            <h4>Офисы</h4>
            <a href="mailto:hello@inturex.pro">hello@inturex.pro</a>
            <a href="mailto:help@inturex.pro">help@inturex.pro</a>
            <span style={{ display: 'block', padding: '5px 0', color: 'var(--muted)', fontSize: '.94rem' }}>Пхукет · Бишкек</span>
          </div>
        </div>

        <div className="footer-bottom">
          <span className="cc">© 2026 Inturex Pro · авторские экскурсии по Азии</span>
          <div className="legal">
            <Link to="/terms">Условия</Link>
            <Link to="/privacy">Конфиденциальность</Link>
            <Link to="/offer">Оферта</Link>
          </div>
        </div>
      </footer>
    </>
  )
}
