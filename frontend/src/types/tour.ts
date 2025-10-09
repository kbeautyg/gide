/**
 * TypeScript интерфейсы для экскурсий
 */

export interface Tour {
  id: number
  guide_id: number
  guide_name?: string
  title: string
  description: string
  price: number
  duration: number
  location: string
  category: string
  start_date?: string
  end_date?: string
  photos: string[]
  rating: number
  reviews_count: number
  active: boolean
  is_public?: boolean
  share_code?: string
  created_at?: string
  
  // Контентные блоки (Tripster-стиль)
  what_to_expect?: string
  organizational_details?: string
  included?: string[]
  not_included?: string[]
  meeting_point?: string
  languages?: string[]
  max_group_size?: number
  min_age?: number
  difficulty_level?: string
  
  // Теги и категоризация
  landmarks?: string[]
  tags?: string[]
  themes?: string[]
  formats?: string[]
  
  // SEO
  seo_title?: string
  seo_description?: string
  long_description?: string
  
  // Статистика и промо
  total_bookings?: number
  views_count?: number
  has_discount?: boolean
  is_new?: boolean
  discount_percentage?: number
  original_price?: number
  
  created_at?: string
  updated_at?: string
}

export interface TourCreate {
  title: string
  description: string
  price: number
  duration: number
  location: string
  category: string
  photos?: string[]
  start_date?: string
  end_date?: string
  
  what_to_expect?: string
  organizational_details?: string
  included?: string[]
  not_included?: string[]
  meeting_point?: string
  languages?: string[]
  max_group_size?: number
  min_age?: number
  difficulty_level?: string
  landmarks?: string[]
  tags?: string[]
  themes?: string[]
  formats?: string[]
}

export interface TourListResponse {
  tours: Tour[]
  total: number
  page: number
  per_page: number
}

