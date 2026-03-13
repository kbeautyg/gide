import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

interface ReviewCardProps {
  review: {
    user_name: string
    user_photo?: string
    rating: number
    text: string
    experience_count: number
    created_at: string
  }
  index?: number
}

export function ReviewCard({ review, index = 0 }: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const shouldTruncate = review.text.length > 200

  return (
    <motion.div
      className="bg-gray-50 rounded-xl p-6 border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="flex items-start gap-3 mb-4">
        <img
          src={review.user_photo || `https://i.pravatar.cc/150?img=${index}`}
          alt={review.user_name}
          className="w-12 h-12 rounded-full object-cover shrink-0"
          loading="lazy"
        />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900">{review.user_name}</div>
          <div className="flex items-center gap-1 my-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={14}
                className={
                  i < Math.floor(review.rating)
                    ? 'fill-gray-900 text-gray-900'
                    : 'text-gray-300'
                }
              />
            ))}
          </div>
          <div className="text-xs text-gray-500">
            Опыт: {review.experience_count} экскурси{review.experience_count === 1 ? 'я' : 'й'}
          </div>
        </div>
        <div className="text-xs text-gray-500 shrink-0">
          {new Date(review.created_at).toLocaleDateString('ru')}
        </div>
      </div>

      <p className={!isExpanded && shouldTruncate ? 'text-gray-700 line-clamp-3' : 'text-gray-700'}>
        {review.text}
      </p>

      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-gray-900 underline mt-2 hover:text-gray-700 transition-colors"
        >
          {isExpanded ? 'Свернуть' : 'ещё'}
        </button>
      )}
    </motion.div>
  )
}

