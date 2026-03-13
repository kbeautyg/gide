import { motion } from 'framer-motion'

export function CityCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.04 }}
      className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-200 animate-pulse"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-gray-300 to-gray-200" />
      
      <div className="absolute bottom-0 left-0 right-0 p-5 space-y-2">
        <div className="h-4 bg-gray-300 rounded w-1/3" />
        <div className="h-7 bg-gray-300 rounded w-2/3" />
        <div className="h-4 bg-gray-300 rounded w-1/2" />
      </div>
    </motion.div>
  )
}

