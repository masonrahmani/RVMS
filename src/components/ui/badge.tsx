import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Updated variants for better color mapping based on globals.css status colors
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: // Greenish (Fixed status)
          "border-transparent bg-[hsl(var(--status-fixed))] text-primary-foreground hover:bg-[hsl(var(--status-fixed))]/80",
        secondary: // Orange/Yellowish (Medium status / In Progress)
          "border-transparent bg-[hsl(var(--status-medium))] text-secondary-foreground hover:bg-[hsl(var(--status-medium))]/80",
        destructive: // Red (Critical/High risk / Open status)
          "border-transparent bg-[hsl(var(--status-critical))] text-destructive-foreground hover:bg-[hsl(var(--status-critical))]/80",
        outline: // Yellowish (Low risk) - Using border might be better if theme supports it
          "border-[hsl(var(--status-low))] text-[hsl(var(--status-low))] bg-transparent",
         // Add specific variants if needed, e.g., for High risk separately
         high: "border-transparent bg-red-700 text-white hover:bg-red-700/80", // Example custom high variant
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
