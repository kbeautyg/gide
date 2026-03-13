import { useState, useLayoutEffect, useRef, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MapPin, Clock, Star, Users, DollarSign,
  Heart, Share2, CheckCircle, XCircle, Image as ImageIcon,
  Shield, Calendar as CalendarIcon, Gift, Sparkles,
  AlertCircle, Info, Navigation, Globe, ShoppingCart,
  X, ChevronLeft, ChevronRight, ZoomIn, Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toursApi, bookingsApi, api } from '@/lib/api'
import type { Tour } from '@/types/tour'
import { formatRUB } from '@/lib/utils'
import { PublicHeader } from '@/components/PublicHeader'
import { PublicFooter } from '@/components/PublicFooter'
import { TourCard } from '@/components/TourCard'
import { ImageWithFallback } from '@/components/ImageWithFallback'
import { useAuth } from '@/hooks/useAuth'
import { useFavorites } from '@/lib/favorites'
import confetti from 'canvas-confetti'

export default function TourDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { isFavorite, toggleFavorite } = useFavorites()
  const [bookingData, setBookingData] = useState({
    date: '',
    participants: 1,
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    telegram: '',
  })
  const [showSuccess, setShowSuccess] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  
  // Автозаполнение данных пользователя
  useEffect(() => {
    if (user) {
      setBookingData(prev => ({
        ...prev,
        clientName: user.name || prev.clientName,
        clientPhone: user.phone || prev.clientPhone,
        clientEmail: user.email || prev.clientEmail,
      }))
    }
  }, [user])

  const [galleryOpen, setGalleryOpen] = useState<boolean>(false)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const galleryRef = useRef<HTMLDivElement>(null)
  const hasAutoScrolledRef = useRef(false)

  const cleanText = (text: string | undefined): string => {
    if (!text) return ''
    return text
      .replace(/^#{1,6}\s+/gm, '')        // убираем markdown-заголовки ## / ### / ####
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/<strong>(.*?)<\/strong>/gi, '$1')
      .replace(/<b>(.*?)<\/b>/gi, '$1')
      .replace(/<[^>]*>/g, '')
  }

  const { data: tourData, isLoading } = useQuery({
    queryKey: ['tour', id],
    queryFn: () => toursApi.getById(id!),
    enabled: !!id,
  })

  const tour = tourData?.data as Tour | undefined

  useLayoutEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => api.get(`/reviews/${id}`).then(res => res.data),
    enabled: !!id,
  })

  const { data: relatedToursData } = useQuery({
    queryKey: ['related-tours', tour?.category, tour?.location, id],
    queryFn: async () => {
      if (!tour) return { tours: [] }
      const response = await toursApi.getList({
        page: 1,
        page_size: 4,
        category: tour.category,
      })
      const filtered = response.data.tours?.filter((t: Tour) => t.id !== tour.id) || []
      return { tours: filtered.slice(0, 3) }
    },
    enabled: !!tour,
  })

  const reviews = reviewsData || []
  const relatedTours = relatedToursData?.tours || []

  const bookingMutation = useMutation({
    mutationFn: () => bookingsApi.create({
      tour_id: Number(id),
      date: bookingData.date,
      participants_count: bookingData.participants,
      client_name: bookingData.clientName,
      client_phone: bookingData.clientPhone,
      client_email: bookingData.clientEmail || undefined,
      telegram_username: bookingData.telegram || undefined,
    }),
    onSuccess: () => {
      setShowSuccess(true)
      setIsSubmitted(true)
      
      // Запускаем конфетти
      const duration = 3 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 }

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

      const interval: ReturnType<typeof setInterval> = setInterval(function() {
        const timeLeft = animationEnd - Date.now()
        if (timeLeft <= 0) {
          return clearInterval(interval)
        }
        const particleCount = 50 * (timeLeft / duration)
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
      }, 250)

      setBookingData({
        date: '',
        participants: 1,
        clientName: '',
        clientPhone: '',
        clientEmail: '',
        telegram: '',
      })
    },
  })

  const handleBooking = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/tours/${id}` } })
      return
    }
    if (!bookingData.date || !bookingData.clientName || !bookingData.clientPhone) {
      return
    }
    bookingMutation.mutate()
  }

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return
    if (!tour) {
      hasAutoScrolledRef.current = false
      return
    }
    if (!galleryRef.current || hasAutoScrolledRef.current) return
    const rafId = window.requestAnimationFrame(() => {
      if (!galleryRef.current) return
      const yOffset = -20
      const y = galleryRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'auto' })
      hasAutoScrolledRef.current = true
    })
    return () => window.cancelAnimationFrame(rafId)
  }, [tour?.id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="h-[400px] bg-gray-200 rounded-xl animate-pulse mb-8" />
          <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-8">
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded-lg animate-pulse w-3/4" />
              <div className="h-5 bg-gray-200 rounded animate-pulse w-1/2" />
              <div className="space-y-3 mt-6">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6" />
              </div>
            </div>
            <div className="h-[400px] bg-gray-200 rounded-xl animate-pulse mt-8 lg:mt-0" />
          </div>
        </div>
      </div>
    )
  }

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Экскурсия не найдена</p>
      </div>
    )
  }

  const photos = tour.photos?.length > 0 
    ? tour.photos 
    : ['https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=1200&h=800&fit=crop']

  const totalPrice = tour.price * bookingData.participants

  const seoTitle = `${tour.title} — Экскурсия в ${tour.location || 'Азии'} | Inturex`
  const seoDescription = tour.description 
    ? tour.description.slice(0, 160).replace(/<[^>]*>/g, '') + '...'
    : `Забронируйте экскурсию "${tour.title}" в ${tour.location}. Авторский тур с русскоговорящим гидом. Цена от ${formatRUB(tour.price)}.`
  const seoImage = photos[0] || 'https://inturex.pro/og-image.jpg'
  const canonicalUrl = `https://inturex.pro/tours/${id}`

  const tourJsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    "name": tour.title,
    "description": seoDescription,
    "image": photos,
    "url": canonicalUrl,
    "touristType": "Экскурсия",
    "provider": {
      "@type": "TravelAgency",
      "name": "Inturex",
      "url": "https://inturex.pro/"
    },
    "offers": {
      "@type": "Offer",
      "price": tour.price,
      "priceCurrency": "RUB",
      "availability": "https://schema.org/InStock",
      "url": canonicalUrl
    },
    ...(tour.location && {
      "itinerary": {
        "@type": "ItemList",
        "itemListElement": [{
          "@type": "ListItem",
          "position": 1,
          "item": {
            "@type": "Place",
            "name": tour.location
          }
        }]
      }
    }),
    ...(tour.rating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": tour.rating,
        "bestRating": 5,
        "worstRating": 1,
        "reviewCount": reviews.length || 1
      }
    }),
    ...(tour.duration && {
      "duration": `PT${tour.duration}H`
    })
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Главная",
        "item": "https://inturex.pro/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Все туры",
        "item": "https://inturex.pro/tours"
      },
      ...(tour.location ? [{
        "@type": "ListItem",
        "position": 3,
        "name": tour.location,
        "item": `https://inturex.pro/tours?location=${encodeURIComponent(tour.location)}`
      }] : []),
      {
        "@type": "ListItem",
        "position": tour.location ? 4 : 3,
        "name": tour.title
      }
    ]
  }

  const reviewsJsonLd = reviews.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": tour.title,
    "description": seoDescription,
    "image": photos[0],
    "url": canonicalUrl,
    "brand": {
      "@type": "Brand",
      "name": "Inturex"
    },
    "offers": {
      "@type": "Offer",
      "price": tour.price,
      "priceCurrency": "RUB",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": tour.rating,
      "bestRating": 5,
      "worstRating": 1,
      "reviewCount": reviews.length
    },
    "review": reviews.slice(0, 10).map((review: any) => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating || 5,
        "bestRating": 5,
        "worstRating": 1
      },
      "author": {
        "@type": "Person",
        "name": review.user_name || review.client_name || "Анонимный пользователь"
      },
      ...(review.text || review.comment ? {
        "reviewBody": review.text || review.comment
      } : {}),
      ...(review.created_at ? {
        "datePublished": new Date(review.created_at).toISOString().split('T')[0]
      } : {})
    }))
  } : null

  const openGallery = (index: number) => {
    setCurrentPhotoIndex(index)
    setGalleryOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={`экскурсия ${tour.location}, тур ${tour.location}, ${tour.title}, русский гид ${tour.location}, что посмотреть ${tour.location}`} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:image" content={seoImage} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="Inturex — Экскурсии по Азии" />
        <meta property="og:locale" content="ru_RU" />
        <meta property="product:price:amount" content={String(tour.price)} />
        <meta property="product:price:currency" content="RUB" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={seoImage} />
        <script type="application/ld+json">{JSON.stringify(tourJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
        {reviewsJsonLd && <script type="application/ld+json">{JSON.stringify(reviewsJsonLd)}</script>}
      </Helmet>

      <PublicHeader />

      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-2">
          <div className="text-sm text-gray-500 flex items-center gap-1.5 overflow-hidden">
            <Link to="/" className="hover:text-gray-900 transition-colors whitespace-nowrap">Главная</Link>
            <ChevronRight size={14} className="flex-shrink-0" />
            <Link to="/tours" className="hover:text-gray-900 transition-colors whitespace-nowrap">Все туры</Link>
            <ChevronRight size={14} className="flex-shrink-0" />
            <span className="text-gray-900 font-medium truncate">{tour.title}</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {galleryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={() => setGalleryOpen(false)}
          >
            <button
              onClick={() => setGalleryOpen(false)}
              className="absolute top-4 right-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Закрыть галерею"
            >
              <X className="w-8 h-8 text-white" />
            </button>

            <div className="absolute top-4 left-4 z-10 px-4 py-2 bg-white/10 rounded-full text-white text-lg font-medium">
              {currentPhotoIndex + 1} / {photos.length}
            </div>

            {photos.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Предыдущее фото"
              >
                <ChevronLeft className="w-8 h-8 text-white" />
              </button>
            )}

            <motion.img
              key={currentPhotoIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              src={photos[currentPhotoIndex]}
              alt={`${tour.title} - фото ${currentPhotoIndex + 1}`}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            {photos.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setCurrentPhotoIndex((prev) => (prev + 1) % photos.length); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Следующее фото"
              >
                <ChevronRight className="w-8 h-8 text-white" />
              </button>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] pb-2 px-4">
              {photos.map((photo, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setCurrentPhotoIndex(i); }}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    i === currentPhotoIndex ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={photo}
                    alt={`Миниатюра ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div ref={galleryRef} className="mb-6 lg:mb-8">
           <div className="block lg:hidden">
            <div 
              className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg cursor-pointer group"
              onClick={() => openGallery(0)}
            >
              <ImageWithFallback
                src={photos[0]}
                alt={tour.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-3 rounded-full shadow-lg">
                  <ZoomIn className="w-6 h-6 text-gray-900" />
                </div>
              </div>
              {photos.length > 1 && (
                <div className="absolute bottom-3 right-3">
                  <Button variant="secondary" size="sm" className="gap-2 text-xs">
                    <ImageIcon size={14} />
                    {photos.length} фото
                  </Button>
                </div>
              )}
            </div>
            {photos.length > 1 && (
              <div className="flex gap-2 mt-2 overflow-x-auto pb-2 scrollbar-hide">
                {photos.slice(1, 6).map((photo, i) => (
                  <div 
                    key={i} 
                    className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => openGallery(i + 1)}
                  >
                    <ImageWithFallback
                      src={photo}
                      alt={`${tour.title} ${i + 2}`}
                      className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                    />
                  </div>
                ))}
                {photos.length > 6 && (
                  <div 
                    className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-black/50 flex items-center justify-center text-white text-sm font-medium cursor-pointer hover:bg-black/70 transition-colors"
                    onClick={() => openGallery(6)}
                  >
                    +{photos.length - 6}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="hidden lg:grid grid-cols-4 grid-rows-2 gap-2 h-[400px] rounded-xl overflow-hidden shadow-sm">
            <div
              className="col-span-2 row-span-2 cursor-pointer relative group overflow-hidden"
              onClick={() => openGallery(0)}
            >
              <ImageWithFallback
                src={photos[0]}
                alt={tour.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
            <div className="cursor-pointer relative group overflow-hidden" onClick={() => openGallery(1)}>
              <ImageWithFallback src={photos[1]} className="w-full h-full object-cover" alt={`${tour.title} — фото 2`} />
            </div>
            <div className="cursor-pointer relative group overflow-hidden" onClick={() => openGallery(2)}>
              <ImageWithFallback src={photos[2]} className="w-full h-full object-cover" alt={`${tour.title} — фото 3`} />
            </div>
            <div className="cursor-pointer relative group overflow-hidden" onClick={() => openGallery(3)}>
              <ImageWithFallback src={photos[3]} className="w-full h-full object-cover" alt={`${tour.title} — фото 4`} />
            </div>
            <div className="cursor-pointer relative group overflow-hidden" onClick={() => openGallery(4)}>
              <ImageWithFallback src={photos[4]} className="w-full h-full object-cover" alt={`${tour.title} — фото 5`} />
              {photos.length > 5 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-medium text-sm">
                  +{photos.length - 5} фото
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-8 items-start">
          <div className="space-y-6">
            <div>
               <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 leading-tight">{tour.title}</h1>
               <div className="flex flex-wrap items-center gap-4 text-base text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-semibold text-gray-900">{tour.rating.toFixed(1)}</span>
                      <span className="text-gray-400">({tour.reviews_count} отзывов)</span>
                  </div>
                  <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {tour.location}
                  </div>
                  <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {tour.duration} ч
                  </div>
                  
                  {/* Share & Favorite Buttons */}
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={() => toggleFavorite(Number(id))}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      aria-label={isFavorite(Number(id)) ? "Убрать из избранного" : "Добавить в избранное"}
                      title={isFavorite(Number(id)) ? "Убрать из избранного" : "Добавить в избранное"}
                    >
                      <Heart
                        className={`w-5 h-5 ${isFavorite(Number(id)) ? 'fill-airbnb-rausch text-airbnb-rausch' : 'text-gray-600'}`}
                      />
                    </button>
                    <button
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
                      aria-label="Поделиться"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
              </div>
            </div>

            <div className="w-full">
                {cleanText(tour.description)
                  .split(/\n\s*\n/)
                  .filter(p => p.trim())
                  .map((paragraph, i) => (
                    <p key={i} className="text-base text-gray-700 leading-[1.75] mb-4 last:mb-0">
                      {paragraph.replace(/\n/g, ' ').trim()}
                    </p>
                  ))
                }
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {tour.included?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Включено
                  </h3>
                  <ul className="space-y-2.5">
                    {tour.included.map((item, i) => (
                      <li key={i} className="text-base text-gray-600 flex items-start gap-2 leading-relaxed">
                        <span className="block w-1.5 h-1.5 bg-green-400 rounded-full mt-2.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {tour.not_included?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-500" />
                    Не включено
                  </h3>
                  <ul className="space-y-2.5">
                    {tour.not_included.map((item, i) => (
                      <li key={i} className="text-base text-gray-600 flex items-start gap-2 leading-relaxed">
                        <span className="block w-1.5 h-1.5 bg-red-300 rounded-full mt-2.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                Важная информация
              </h3>
              <div className="grid sm:grid-cols-2 gap-4 text-base">
                {tour.meeting_point && (
                  <div>
                    <span className="block text-gray-500 text-sm mb-1">Место встречи</span>
                    <span className="text-gray-900 leading-relaxed">{tour.meeting_point}</span>
                  </div>
                )}
                {tour.max_group_size && (
                  <div>
                    <span className="block text-gray-500 text-sm mb-1">Размер группы</span>
                    <span className="text-gray-900 leading-relaxed">до {tour.max_group_size} человек</span>
                  </div>
                )}
                {tour.languages && tour.languages.length > 0 && (
                  <div>
                    <span className="block text-gray-500 text-sm mb-1">Языки</span>
                    <span className="text-gray-900 leading-relaxed">{tour.languages.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-24 mt-8 lg:mt-0">
             <Card className="shadow-lg border-0 overflow-hidden relative">
                {/* Success Overlay */}
                <AnimatePresence>
                  {showSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center"
                    >
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                        <Check size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Запрос отправлен!</h3>
                      <p className="text-gray-600 mb-6">
                        Гид скоро свяжется с вами для согласования точной даты и деталей.
                      </p>
                      <Button onClick={() => setShowSuccess(false)} variant="outline">
                        Отлично
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="p-5 bg-white">
                  <div className="flex items-baseline justify-between mb-6">
                    <div>
                      <span className="text-base text-gray-500 block mb-1">Стоимость тура</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900">{formatRUB(tour.price)}</span>
                        <span className="text-base text-gray-500">/ чел.</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-base font-medium text-gray-700">Примерная дата</Label>
                        <Input
                          type="date"
                          className="h-11 text-base"
                          value={bookingData.date}
                          onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                        />
                        <span className="text-xs text-gray-400 leading-tight block">
                          Точную дату согласует гид
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-base font-medium text-gray-700">Участники</Label>
                        <Input
                          type="number"
                          min="1"
                          className="h-11 text-base"
                          value={bookingData.participants}
                          onChange={(e) => setBookingData({ ...bookingData, participants: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>

                    {!isAuthenticated ? (
                      <div className="pt-4 text-center">
                        <p className="text-base text-gray-600 mb-3">Войдите, чтобы отправить запрос</p>
                        <Button
                          onClick={() => navigate('/login', { state: { from: `/tours/${id}` } })}
                          className="w-full bg-airbnb-rausch hover:bg-airbnb-rausch/90 text-white"
                        >
                          Войти
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3 pt-2">
                          <Input
                            placeholder="Ваше имя"
                            className="h-11 text-base"
                            autoComplete="name"
                            value={bookingData.clientName}
                            onChange={(e) => setBookingData({ ...bookingData, clientName: e.target.value })}
                          />
                          <Input
                            placeholder="Телефон"
                            className="h-11 text-base"
                            autoComplete="tel"
                            value={bookingData.clientPhone}
                            onChange={(e) => setBookingData({ ...bookingData, clientPhone: e.target.value })}
                          />
                        </div>

                        <div className="pt-2">
                          <div className="flex justify-between items-center mb-4 text-base">
                            <span className="text-gray-600">Итого к оплате:</span>
                            <span className="font-bold text-lg text-gray-900">{formatRUB(totalPrice)}</span>
                          </div>
                          <Button
                            onClick={handleBooking}
                            disabled={!bookingData.date || !bookingData.clientPhone || bookingMutation.isPending || isSubmitted}
                            className="w-full h-12 bg-airbnb-rausch hover:bg-airbnb-rausch/90 text-white font-semibold text-base shadow-md transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {bookingMutation.isPending ? 'Отправка...' : isSubmitted ? 'Запрос отправлен' : 'Отправить запрос'}
                          </Button>
                          <p className="text-center text-sm text-gray-400 mt-3">
                            Бесплатная отмена за 48 часов
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            </div>
        </div>

        {/* Похожие туры */}
        {relatedTours.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Похожие экскурсии</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedTours.map((relatedTour: Tour) => (
                <TourCard key={relatedTour.id} tour={relatedTour} />
              ))}
            </div>
          </div>
        )}
      </div>

      <PublicFooter />
    </div>
  )
}
