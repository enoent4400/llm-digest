import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import * as React from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "btn inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all gap-2 cursor-pointer [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default: "btn-primary",
        secondary: "btn-secondary",
        ghost: "bg-transparent text-gray-400 hover:text-gray-200 hover:bg-white/[0.02] rounded-lg",
        destructive: "bg-accent-error hover:bg-accent-error/90 text-white",
      },
      size: {
        default: "px-4 py-2 rounded-lg",
        sm: "px-3 py-1.5 text-xs rounded-md",
        lg: "px-6 py-3 text-base rounded-xl",
        icon: "size-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
