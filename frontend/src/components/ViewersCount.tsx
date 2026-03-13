import { Eye } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ViewersCountProps {
  tourId: number
}

export function ViewersCount({ tourId }: ViewersCountProps) {
  // Генерируем случайное количество зрителей (для реалистичности)
  const [viewers, setViewers] = useState(0)

  useEffect(() => {
    // Базовое количество зависит от ID тура (для стабильности)
    const base = (tourId % 20) + 1 // от 1 до 20
    
    // Добавляем случайную вариацию каждые 10 секунд
    const updateViewers = () => {
      const variation = Math.floor(Math.random() * 5) - 2 // -2 до +2
      setViewers(Math.max(1, base + variation))
    }
    
    updateViewers()
    const interval = setInterval(updateViewers, 10000)
    
    return () => clearInterval(interval)
  }, [tourId])

  if (viewers === 0) return null

  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
      <Eye size={12} className="text-airbnb-rausch" />
      <span className="font-medium">{viewers} {viewers === 1 ? 'человек смотрит' : 'смотрят'}</span>
    </div>
  )
}

