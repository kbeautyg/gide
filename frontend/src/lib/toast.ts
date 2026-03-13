import { toast as sonnerToast } from 'sonner'

// Красивая обертка над sonner с нашими стилями
const toast = {
  success: (message: string, description?: string) => {
    sonnerToast.success(message, {
      description,
      duration: 4000,
      className: 'bg-green-50 border-green-200 text-green-900',
    })
  },
  
  error: (message: string, description?: string) => {
    sonnerToast.error(message, {
      description,
      duration: 5000,
      className: 'bg-red-50 border-red-200 text-red-900',
    })
  },
  
  info: (message: string, description?: string) => {
    sonnerToast.info(message, {
      description,
      duration: 4000,
      className: 'bg-blue-50 border-blue-200 text-blue-900',
    })
  },
  
  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, {
      description,
      duration: 4500,
      className: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    })
  },
  
  loading: (message: string) => {
    return sonnerToast.loading(message, {
      className: 'bg-gray-50 border-gray-200 text-gray-900',
    })
  },
  
  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((err: any) => string)
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading,
      success,
      error,
    })
  },
  
  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId)
  },
}

export { toast }

