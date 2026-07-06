import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { formatRUB, getImageUrl } from '@/lib/utils'
import { getCountryImage } from '@/constants/countryData'
import { InturexHeader } from '@/components/inturex/InturexHeader'
import { InturexFooter } from '@/components/inturex/InturexFooter'

/* ---------- inline icons (match the design) ---------- */
const Star = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17.8 5.9 20.4 7.4 13.6 2.2 9l6.9-.7z" /></svg>
)
const Arrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
)
const Clock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
)
const Ver = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="9" /></svg>
)

const dec = (n: number) => n.toFixed(1).replace('.', ',')

// Статические описания/картинки стран (фолбэк к данным с бэкенда)
const COUNTRY_STATIC_DATA: Record<string, { description: string; image: string; highlights?: string[] }> = {
  'Таиланд': { description: 'Золотые храмы, белоснежные пляжи, уличная еда и тропические острова', image: getCountryImage('Таиланд'), highlights: ['Бангкок', 'Пхукет', 'Паттайя'] },
  'ОАЭ': { description: 'Футуристические небоскребы, бескрайние пустыни и восточная роскошь', image: getCountryImage('ОАЭ'), highlights: ['Дубай', 'Абу-Даби', 'Шарджа'] },
  'Япония': { description: 'Древние храмы, современные технологии, суши и цветущая сакура', image: getCountryImage('Япония'), highlights: ['Токио', 'Киото', 'Осака'] },
  'Южная Корея': { description: 'K-pop культура, дворцы, уличная еда и неоновые улицы Сеула', image: getCountryImage('Южная Корея') },
  'Индонезия': { description: 'Рисовые террасы Бали, вулканы, серфинг и древние храмы', image: getCountryImage('Индонезия') },
  'Вьетнам': { description: 'Бухта Халонг, традиционная кухня, древние города и рисовые поля', image: getCountryImage('Вьетнам') },
  'Сингапур': { description: 'Город-сад с небоскребами, мультикультурность и уличная еда', image: getCountryImage('Сингапур') },
  'Китай': { description: 'Великая стена, Терракотовая армия, мегаполисы и древняя культура', image: getCountryImage('Китай') },
  'Индия': { description: 'Тадж-Махал, йога, специи, духовные практики и красочные фестивали', image: getCountryImage('Индия') },
  'Турция': { description: 'Каппадокия, Стамбул, море и античные руины', image: getCountryImage('Турция') },
  'Малайзия': { description: 'Небоскребы Куала-Лумпура, чайные плантации и джунгли Борнео', image: getCountryImage('Малайзия') },
}

export default function HomePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Prefetch (как в оригинале) — прогрев кэша журнала и туров
  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ['all-articles'],
      queryFn: async () => (await api.get('/articles/', { params: { limit: 1000 } })).data,
      staleTime: 1000 * 60 * 30,
    })
    queryClient.prefetchQuery({
      queryKey: ['tours', '', [], [], [], [], [], [0, 100000], [0, 24], [0, 5], 1, null, '', '', 1],
      queryFn: async () => (await api.get('/tours/', { params: { page: 1, page_size: 50 } })).data,
      staleTime: 1000 * 60 * 5,
    })
  }, [queryClient])

  // Страны из API (queryKey сохранён)
  const { data: countriesData } = useQuery({
    queryKey: ['countries-stats-home'],
    queryFn: async () => (await api.get('/destinations/countries-stats')).data,
    staleTime: 1000 * 60 * 10,
  })
  const countries = (countriesData?.countries || [])
    .filter((c: any) => c.tours_count > 0)
    .sort((a: any, b: any) => b.tours_count - a.tours_count)
    .map((c: any) => {
      const s = COUNTRY_STATIC_DATA[c.country]
      return {
        name: c.country,
        description: c.description || s?.description || '',
        image: c.image || s?.image || getCountryImage(c.country),
        tours: c.tours_count || 0,
        link: `/tours?location=${encodeURIComponent(c.country)}`,
      }
    })
  const totalToursCount = countries.reduce((sum: number, c: any) => sum + (c.tours || 0), 0)

  // Отзывы (queryKey сохранён)
  const { data: reviewsApiData } = useQuery({
    queryKey: ['homepage-reviews'],
    queryFn: async () => {
      try { return (await api.get('/reviews/latest', { params: { limit: 3 } })).data } catch { return { reviews: [] } }
    },
    staleTime: 1000 * 60 * 5,
  })
  const reviews = (reviewsApiData?.reviews || []).map((r: any) => ({
    name: r.author_name || 'Путешественник',
    rating: r.rating || 5,
    text: r.text || r.comment || '',
    tour: r.tour_title || '',
  }))

  // Избранные экскурсии для главной
  const { data: featuredData } = useQuery({
    queryKey: ['home-featured-tours'],
    queryFn: async () => (await api.get('/tours/', { params: { page: 1, page_size: 8, is_public: true } })).data,
    staleTime: 1000 * 60 * 5,
  })
  const featured = (featuredData?.tours || []).slice(0, 8)

  // Рубрики (динамическая навигация)
  const { data: navData } = useQuery({
    queryKey: ['home-nav'],
    queryFn: async () => {
      const r = await api.get('/tours/dynamic-navigation')
      return r.data?.data || r.data
    },
    staleTime: 1000 * 60 * 10,
  })
  const cats = ((navData?.categories?.length ? navData.categories : navData?.themes) || []).slice(0, 8)

  const heroPhotos = [getCountryImage('Япония'), getCountryImage('Таиланд'), getCountryImage('Индонезия')]

  return (
    <div className="ix">
      <Helmet>
        <title>Inturex — авторские экскурсии по Азии с русскоязычными гидами</title>
        <meta name="description" content="Маркетплейс авторских экскурсий по Азии с русскоязычными гидами. Таиланд, Вьетнам, Япония, Китай и не только. Честные цены в рублях, безопасное бронирование." />
      </Helmet>

      <InturexHeader />

      <main>
        {/* ===== HERO ===== */}
        <div className="hero">
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">Авторские экскурсии по Азии</span>
              <h1 className="display">Откройте <em>Азию</em> с гидом, <em>который говорит на вашем языке</em></h1>
              <p className="lede">Тысячи живых маршрутов от русскоязычных гидов в Таиланде, Вьетнаме, Японии, Китае и не только. Честные цены в рублях и бронирование без риска.</p>

              <div className="searchbar" role="search">
                <label className="seg">
                  <span style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--ink)' }}>Направление</span>
                  <select id="heroDest" defaultValue="Таиланд" aria-label="Направление">
                    {(countries.length ? countries.map((c: any) => c.name) : ['Таиланд', 'Вьетнам', 'Япония', 'Китай', 'Индонезия']).map((n: string) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </label>
                <div className="divider" />
                <label className="seg">
                  <span style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--ink)' }}>Даты</span>
                  <input type="date" aria-label="Дата" />
                </label>
                <div className="divider" />
                <label className="seg">
                  <span style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--ink)' }}>Гостей</span>
                  <select defaultValue="2 гостя" aria-label="Гостей"><option>1 гость</option><option>2 гостя</option><option>3 гостя</option><option>4 гостя</option><option>5 гостей</option></select>
                </label>
                <button
                  className="search-go"
                  type="button"
                  aria-label="Найти экскурсии"
                  onClick={() => {
                    const el = document.getElementById('heroDest') as HTMLSelectElement | null
                    navigate(`/tours?location=${encodeURIComponent(el?.value || 'Таиланд')}`)
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
                </button>
              </div>

              <div className="hero-trust">
                <span className="t"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="9" /></svg><b>4,9</b>&nbsp;средний рейтинг</span>
                <span className="t"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7l9-4 9 4-9 4-9-4z" /><path d="M3 7v7l9 4 9-4V7" /></svg><b>{totalToursCount > 0 ? `${totalToursCount}+` : '2 400+'}</b>&nbsp;экскурсий</span>
                <span className="t"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z" /></svg><b>{countries.length || 18}</b>&nbsp;стран Азии</span>
              </div>
            </div>

            <div className="hero-collage">
              <div className="ph hc-1"><img src={heroPhotos[0]} alt="" loading="eager" /></div>
              <div className="ph hc-2"><img src={heroPhotos[1]} alt="" loading="lazy" /></div>
              <div className="ph hc-3"><img src={heroPhotos[2]} alt="" loading="lazy" /></div>
              <div className="float-card float-a">
                <span className="fc-ic"><Star /></span>
                <div><small>Рейтинг гидов</small><strong>4,9 из 5 · 38 000 отзывов</strong></div>
              </div>
              <div className="float-card float-b">
                <span className="fc-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 6 9 17l-5-5" /></svg></span>
                <div><small>Русскоязычные гиды</small><strong>520+ проверенных</strong></div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== DESTINATIONS ===== */}
        {countries.length > 0 && (
          <div className="section wrap">
            <div className="section-head">
              <div>
                <span className="eyebrow">Куда отправимся</span>
                <h2 className="display">Популярные направления</h2>
              </div>
              <Link className="link-arrow" to="/tours">Все страны <Arrow /></Link>
            </div>
            <div className="dest-scroll">
              {countries.map((c: any) => (
                <Link className="dest-card" to={c.link} key={c.name}>
                  <div className="ph"><img src={getImageUrl(c.image) || c.image} alt={c.name} loading="lazy" /></div>
                  <div className="dest-info">
                    <h3>{c.name}</h3>
                    <div className="dest-tagline">{c.tours} авторских экскурсий</div>
                    <div className="row">
                      <span className="rating" style={{ color: '#fff' }}><Star /><span style={{ color: '#fff' }}>4,9</span></span>
                      <span className="from">Смотреть</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ===== CATEGORIES ===== */}
        {cats.length > 0 && (
          <div className="section wrap" style={{ paddingTop: 0 }}>
            <div className="section-head"><div>
              <span className="eyebrow">По интересам</span>
              <h2 className="display">Что вам по душе?</h2>
            </div></div>
            <div className="cats">
              {cats.map((c: any) => (
                <Link className="cat-chip" to={`/tours?category=${encodeURIComponent(c.name)}`} key={c.name}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.5 6.5L21 9l-5 4.5L17.5 21 12 17l-5.5 4L8 13.5 3 9l6.5-.5z" /></svg>
                  {c.name}{typeof c.count === 'number' ? ` · ${c.count}` : ''}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ===== FEATURED TOURS ===== */}
        {featured.length > 0 && (
          <div className="band-cream">
            <div className="section wrap">
              <div className="section-head">
                <div>
                  <span className="eyebrow">Выбор Inturex</span>
                  <h2 className="display">Экскурсии, которые запоминаются</h2>
                  <p>Отобраны за авторский маршрут, харизму гида и отзывы путешественников.</p>
                </div>
                <Link className="link-arrow" to="/tours">Все экскурсии <Arrow /></Link>
              </div>
              <div className="tour-grid">
                {featured.map((t: any) => (
                  <Link className="tcard" to={`/tours/${t.id}`} key={t.id} aria-label={t.title}>
                    <div className="tcard-media">
                      <div className="ph"><img src={getImageUrl(t.photos?.[0]) || t.photos?.[0] || getCountryImage(t.location)} alt={t.title} loading="lazy" /></div>
                      {typeof t.rating === 'number' && t.rating >= 4.8 && (
                        <span className="badge badge-coral tag"><Star />Хит</span>
                      )}
                    </div>
                    <div className="tcard-body">
                      <div className="tcard-top">
                        <span className="tcard-cat">{[t.category, t.location].filter(Boolean).join(' · ')}</span>
                        <span className="rating"><Star /> {typeof t.rating === 'number' ? dec(t.rating) : '4,9'}<span className="muted"> ({t.reviews_count || 0})</span></span>
                      </div>
                      <h3 className="tcard-title">{t.title}</h3>
                      <div className="tcard-guide"><Ver /> Гид {t.guide_name || 'Inturex'}</div>
                      <div className="tcard-foot">
                        <span className="tcard-meta"><Clock /> {t.duration ? `${t.duration} ч` : 'Экскурсия'}</span>
                        <span className="tcard-price"><b>{formatRUB(t.price)}</b> / чел.</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== VALUE PROPS ===== */}
        <div className="section wrap">
          <div className="section-head" style={{ justifyContent: 'center', textAlign: 'center', flexDirection: 'column', alignItems: 'center' }}>
            <span className="eyebrow">Почему Inturex</span>
            <h2 className="display">С нами путешествовать спокойнее</h2>
          </div>
          <div className="props">
            <div className="prop">
              <div className="p-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5l-8-3z" /><path d="m9 12 2 2 4-4" /></svg></div>
              <h3>Проверенные гиды</h3>
              <p>Каждый гид проходит верификацию: документы, интервью и реальные отзывы гостей. Все говорят по-русски.</p>
            </div>
            <div className="prop">
              <div className="p-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><rect x="2" y="5" width="20" height="14" rx="2.5" /><path d="M2 10h20" /><path d="M6 15h4" /></svg></div>
              <h3>Оплата в рублях</h3>
              <p>Цены сразу в ₽ — без скрытых комиссий за конвертацию и сюрпризов в выписке по карте.</p>
            </div>
            <div className="prop">
              <div className="p-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M3 12a9 9 0 1 1 9 9" /><path d="M3 12v5h5" /><path d="M12 8v4l3 2" /></svg></div>
              <h3>Бесплатная отмена</h3>
              <p>Планы меняются — отмените большинство экскурсий за 24 часа и получите полный возврат.</p>
            </div>
            <div className="prop">
              <div className="p-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg></div>
              <h3>Поддержка 24/7</h3>
              <p>Команда на связи на русском языке до, во время и после поездки — в любом часовом поясе.</p>
            </div>
          </div>
        </div>

        {/* ===== HOW IT WORKS ===== */}
        <div className="section wrap" id="howItWorks" style={{ paddingTop: 0 }}>
          <div className="section-head"><div>
            <span className="eyebrow">Как это работает</span>
            <h2 className="display">Три шага до встречи с гидом</h2>
          </div></div>
          <div className="how-strip">
            <div className="how-step"><span className="hs-n">1</span><div><h3>Выберите экскурсию</h3><p>Фильтры по стране, городу и интересам. Живые отзывы и честные рейтинги.</p></div></div>
            <div className="how-step"><span className="hs-n">2</span><div><h3>Забронируйте в ₽</h3><p>Оплата картой в рублях. Пока гид не подтвердит бронь — деньги не списываются.</p></div></div>
            <div className="how-step"><span className="hs-n">3</span><div><h3>Встретьтесь с гидом</h3><p>Точка встречи и контакты придут заранее. Отмена за 24 часа — бесплатно.</p></div></div>
          </div>
        </div>

        {/* ===== GUIDE BAND ===== */}
        <div className="wrap" style={{ paddingBottom: 64 }}>
          <div className="guide-band">
            <div className="ph"><img src={getCountryImage('Вьетнам')} alt="" loading="lazy" /></div>
            <div className="guide-band-inner">
              <span className="eyebrow">Для гидов</span>
              <h2 className="display">Знаете своё место лучше любого путеводителя?</h2>
              <p>Публикуйте авторские экскурсии, встречайте русскоязычных путешественников и зарабатывайте на том, что любите.</p>
              <div className="stats">
                <div><b>от 45 000 ₽</b><small>средний доход в месяц</small></div>
                <div><b>0 ₽</b><small>за размещение экскурсии</small></div>
              </div>
              <Link className="btn btn-white btn-lg" to="/become-guide">Стать гидом Inturex</Link>
            </div>
          </div>
        </div>

        {/* ===== REVIEWS ===== */}
        {reviews.length > 0 && (
          <div className="band-cream">
            <div className="section wrap">
              <div className="section-head" style={{ justifyContent: 'center', textAlign: 'center', flexDirection: 'column', alignItems: 'center' }}>
                <span className="eyebrow">Отзывы</span>
                <h2 className="display">Что говорят путешественники</h2>
              </div>
              <div className="reviews">
                {reviews.map((r: any, i: number) => (
                  <div className="review" key={i}>
                    <div className="stars">{Array.from({ length: 5 }).map((_, k) => <Star key={k} />)}</div>
                    <blockquote>«{r.text}»</blockquote>
                    <div className="who">
                      <span style={{ width: 44, height: 44, borderRadius: '50%', flex: 'none', background: 'var(--coral-tint)', color: 'var(--coral)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '1.1rem' }}>{(r.name[0] || 'A').toUpperCase()}</span>
                      <div><b>{r.name}</b><small>{r.tour || 'Путешественник'}</small></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <InturexFooter />
    </div>
  )
}
