import { cn } from "@/lib/utils"

export default function GlassmorphicContainer({ children, className }) {
  // Changed rounded-xl to rounded-3xl for more pronounced corners
  return <div className={cn("glassmorphic p-6 rounded-3xl shadow-lg text-glass-text", className)}>{children}</div>
}
