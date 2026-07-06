import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

/**
 * Inturex header — warm editorial travel design.
 * Uses the .ix-scoped design system (styles/inturex.css); must render inside a .ix container.
 */
export function InturexHeader() {
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`site-header${scrolled ? ' scrolled' : ''}`}>
      <div className="wrap header-row">
        <Link className="brand" to="/" aria-label="Inturex — на главную">
          <span className="brand-mark" aria-hidden="true" style={{ background: 'linear-gradient(135deg,#FF385C,#FC642D)', display: 'grid', placeItems: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-5.2-9.3-9.6C1 8 3 4 6.5 4 9 4 10.5 5.6 12 7.6 13.5 5.6 15 4 17.5 4 21 4 23 8 21.3 11.4 19 15.8 12 21 12 21z" /></svg>
          </span>
          <span style={{ color: 'var(--ink)' }}>Intur<span>e</span>x</span>
        </Link>
        <nav className="nav-main">
          <Link to="/" className="active">Главная</Link>
          <Link to="/tours">Направления</Link>
          <Link to="/tours">Экскурсии</Link>
          <a href="/#howItWorks">Как это работает</a>
        </nav>
        <div className="header-spacer" />
        <div className="header-actions">
          <Link className="become-link" to="/become-guide">Стать гидом</Link>
          <button className="icon-btn" title="Русский · ₽ RUB" aria-label="Язык и валюта" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></svg>
          </button>
          <Link className="icon-btn" to="/dashboard/favorites" aria-label="Избранное" title="Избранное">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-4.6-9.3-9C1 8.5 2.7 5 6.2 5c2 0 3.3 1.1 4.1 2.3.4.6 1 .6 1.4 0C12.5 6.1 13.8 5 15.8 5c3.5 0 5.2 3.5 3.5 7-2.3 4.4-9.3 9-9.3 9z" /></svg>
          </Link>
          <button className="pill-btn" onClick={() => navigate('/login')} aria-label="Войти" type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
            <span className="pb-text">Войти</span>
            <span className="avatar" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" /></svg></span>
          </button>
        </div>
      </div>
    </header>
  )
}
