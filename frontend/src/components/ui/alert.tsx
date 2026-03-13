import * as React from 'react'
import { cn } from '@/lib/utils'

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'warning' | 'success' | 'error'
}

const variantClasses: Record<NonNullable<AlertProps['variant']>, string> = {
  default: 'bg-gray-100 text-gray-900 border-gray-200',
  warning: 'bg-orange-50 text-orange-900 border-orange-200',
  success: 'bg-green-50 text-green-900 border-green-200',
  error: 'bg-red-50 text-red-900 border-red-200'
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn('rounded-xl border p-4', variantClasses[variant], className)}
      {...props}
    />
  )
)
Alert.displayName = 'Alert'

export interface AlertDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  AlertDescriptionProps
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm leading-relaxed', className)} {...props} />
))
AlertDescription.displayName = 'AlertDescription'
