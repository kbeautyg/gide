import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, AlertTriangle, Clock, CheckCircle2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

interface TourRescheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tourOrRequestName: string
  currentDate: string
  newDate: string
  onConfirm: () => void
  loading?: boolean
  type?: 'tour' | 'request'
}

export function TourRescheduleDialog({
  open,
  onOpenChange,
  tourOrRequestName,
  currentDate,
  newDate,
  onConfirm,
  loading = false,
  type = 'tour'
}: TourRescheduleDialogProps) {
  const [clientConfirmed, setClientConfirmed] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [dragEnabled, setDragEnabled] = useState(false)

  useEffect(() => {
    if (!open) {
      setClientConfirmed(false)
      setDragEnabled(false)
      setTimeLeft(60)
    }
  }, [open])

  useEffect(() => {
    if (dragEnabled && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setDragEnabled(false)
            onOpenChange(false)
            return 60
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [dragEnabled, timeLeft, onOpenChange])

  const handleEnableDrag = () => {
    if (!clientConfirmed) {
      return
    }
    setDragEnabled(true)
    onConfirm()
    onOpenChange(false)
  }

  if (!open) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onOpenChange(false)}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Dialog */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border-2 border-blue-200"
        >
          {/* Gradient overlay */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl -z-10" />

          {/* Close button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          <div className="p-6">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg"
            >
              <Calendar className="w-8 h-8 text-white" />
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-center text-gray-900 mb-2"
            >
              Изменить дату {type === 'tour' ? 'экскурсии' : 'заявки'}?
            </motion.h2>

            {/* Name */}
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center text-gray-700 font-medium mb-6"
            >
              {tourOrRequestName}
            </motion.p>

            {/* Dates comparison */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-3 mb-6"
            >
              <div className="flex items-center justify-between bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <span className="text-sm font-semibold text-red-900">Текущая дата:</span>
                <span className="text-lg font-bold text-red-700">{currentDate}</span>
              </div>

              <div className="flex justify-center">
                <motion.div
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-blue-600"
                >
                  ↓
                </motion.div>
              </div>

              <div className="flex items-center justify-between bg-green-50 border-2 border-green-200 rounded-xl p-4">
                <span className="text-sm font-semibold text-green-900">Новая дата:</span>
                <span className="text-lg font-bold text-green-700">{newDate}</span>
              </div>
            </motion.div>

            {/* Warning */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 mb-6"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-orange-900">
                  <strong className="font-bold">Важно!</strong> Убедитесь, что согласовали новую дату с клиентом перед переносом.
                </p>
              </div>
            </motion.div>

            {/* Confirmation checkbox */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mb-6"
            >
              <label className="flex items-center gap-3 cursor-pointer group">
                <Checkbox
                  checked={clientConfirmed}
                  onCheckedChange={(checked) => setClientConfirmed(checked as boolean)}
                  className="h-6 w-6"
                />
                <span className="text-gray-900 font-medium group-hover:text-blue-700 transition-colors">
                  Я согласовал новую дату с клиентом
                </span>
                {clientConfirmed && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </motion.div>
                )}
              </label>
            </motion.div>

            {/* Timer info (after enabling) */}
            {dragEnabled && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-blue-300 rounded-xl p-4 mb-6"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-700" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-blue-900">Режим переноса активен</p>
                    <p className="text-xs text-blue-700">Перетащите {type === 'tour' ? 'тур' : 'заявку'} на новую дату</p>
                  </div>
                  <div className="text-2xl font-bold text-blue-700">{timeLeft}с</div>
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex gap-3"
            >
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                className="flex-1 border-2 hover:bg-gray-50"
                disabled={loading}
              >
                Отмена
              </Button>
              
              <Button
                onClick={handleEnableDrag}
                disabled={!clientConfirmed || loading}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Переношу...
                  </>
                ) : (
                  'Разрешить перенос'
                )}
              </Button>
            </motion.div>

            {!clientConfirmed && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-xs text-center text-gray-500 mt-3"
              >
                Подтвердите согласование с клиентом для продолжения
              </motion.p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

