import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ 
  className, 
  type, 
  ...props 
}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full rounded-lg border border-gray-800 bg-bg-secondary " +
        "px-3 py-2 text-sm text-foreground file:border-0 file:bg-transparent " +
        "file:text-sm file:font-medium placeholder:text-gray-500 " +
        "transition-colors hover:border-gray-700 focus:border-accent-primary " +
        "focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }