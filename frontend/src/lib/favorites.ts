/**
 * Глобальный Zustand-стор для избранного.
 *
 * Единый источник правды — все компоненты (TourCard, TourDetailPage,
 * TourSharePage, FavoritesPage, ClientDashboard) подписываются на ОДНО
 * состояние.  Данные автоматически сохраняются в localStorage через
 * zustand/persist.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { toast } from '@/lib/toast'

interface FavoritesState {
  favorites: number[]
  toggleFavorite: (tourId: number) => void
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],

      toggleFavorite: (tourId: number) => {
        const current = get().favorites
        const exists = current.includes(tourId)
        const next = exists
          ? current.filter(id => id !== tourId)
          : [...current, tourId]

        set({ favorites: next })

        if (exists) {
          toast.success('Удалено из избранного')
        } else {
          toast.success('Добавлено в избранное')
        }
      },
    }),
    {
      name: 'favorites-storage',
      onRehydrateStorage: () => (state) => {
        if (!state) return
        // Миграция: перенести данные из старого ключа 'favorites'
        try {
          const legacy = localStorage.getItem('favorites')
          if (legacy) {
            const parsed = JSON.parse(legacy) as number[]
            if (Array.isArray(parsed) && parsed.length > 0) {
              const merged = Array.from(new Set([...state.favorites, ...parsed]))
              useFavoritesStore.setState({ favorites: merged })
            }
            localStorage.removeItem('favorites')
          }
        } catch { /* ignore */ }
      },
    }
  )
)

/** Хук-обёртка для удобства */
export function useFavorites() {
  const favorites   = useFavoritesStore(s => s.favorites)
  const toggleFavorite = useFavoritesStore(s => s.toggleFavorite)

  const isFavorite = (tourId: number) => favorites.includes(tourId)

  return { favorites, toggleFavorite, isFavorite }
}
