import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "ai"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm",
        {
            "border-transparent bg-blue-600 text-white hover:bg-blue-700": variant === "default",
            "border-transparent bg-slate-800 text-slate-100 hover:bg-slate-700": variant === "secondary",
            "border-transparent bg-red-900/50 text-red-200": variant === "destructive",
            "text-slate-300 border-slate-700 bg-transparent": variant === "outline",
            "border-transparent bg-green-900/50 text-green-300": variant === "success",
            "border-blue-500 bg-blue-950 text-blue-300 animate-pulse": variant === "ai",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
