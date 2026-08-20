import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Image as ImageIcon } from 'lucide-react'
import { getImageUrl, getImageFallbackUrl } from '@/lib/utils'

interface ImageWithFallbackProps {
  src: string
  alt: string
  className?: string
  fallbackSrc?: string
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className,
  fallbackSrc = ''
}) => {
  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Обрабатываем src при изменении
  const processedSrc = getImageUrl(src)

  useEffect(() => {
    setIsLoading(true)
    setHasError(false)
    
    if (!processedSrc) {
        setHasError(true)
        setImgSrc(fallbackSrc)
        setIsLoading(false)
        return
    }

    const img = new Image()
    img.src = processedSrc
    img.onload = () => {
      setImgSrc(processedSrc)
      setIsLoading(false)
    }
    img.onerror = () => {
      // Пробуем российское зеркало, прежде чем показывать заглушку
      const mirrorSrc = getImageFallbackUrl(src)
      if (mirrorSrc && mirrorSrc !== processedSrc) {
        const mirror = new Image()
        mirror.src = mirrorSrc
        mirror.onload = () => {
          setImgSrc(mirrorSrc)
          setIsLoading(false)
        }
        mirror.onerror = () => {
          if (import.meta.env.DEV) console.warn(`Failed to load image: ${processedSrc}`)
          setHasError(true)
          setImgSrc(fallbackSrc)
          setIsLoading(false)
        }
        return
      }

      if (import.meta.env.DEV) console.warn(`Failed to load image: ${processedSrc}`)
      setHasError(true)
      setImgSrc(fallbackSrc)
      setIsLoading(false)
    }
  }, [processedSrc, src, fallbackSrc])

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Skeleton / Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-10"
          >
            <ImageIcon className="w-8 h-8 text-gray-400 opacity-50" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actual Image or gradient placeholder */}
      {imgSrc ? (
        <motion.img
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          src={imgSrc}
          alt={alt}
          className={className}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : hasError && !fallbackSrc ? (
        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <ImageIcon className="w-10 h-10 text-gray-300" />
        </div>
      ) : null}
    </div>
  )
}
