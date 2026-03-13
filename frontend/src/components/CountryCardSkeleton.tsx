import { motion } from 'framer-motion'

export function CountryCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-gray-200 animate-pulse"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-gray-300 to-gray-200" />
      
      <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between">
        {/* Флаг placeholder */}
        <div className="w-16 h-16 bg-gray-300 rounded-full" />
        
        {/* Текст placeholder */}
        <div className="space-y-3">
          <div className="h-8 bg-gray-300 rounded-lg w-3/4" />
          <div className="h-5 bg-gray-300 rounded-lg w-1/2" />
        </div>
      </div>
    </motion.div>
  )
}

