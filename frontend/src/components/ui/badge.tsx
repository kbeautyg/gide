import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-all",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-800",
        popular: "bg-orange-100 text-orange-800 border border-orange-200",
        new: "bg-blue-100 text-blue-800 border border-blue-200",
        discount: "bg-green-100 text-green-800 border border-green-200",
        verified: "bg-airbnb-babu/10 text-airbnb-babu border border-airbnb-babu/20",
        guestFavorite: "bg-white text-gray-800 border border-gray-300 shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

