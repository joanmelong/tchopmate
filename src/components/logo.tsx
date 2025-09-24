import { Utensils } from "lucide-react"

export function Logo({ size = "default" }: { size?: "small" | "default" | "large" }) {
  const sizeClasses = {
    small: "text-xl",
    default: "text-2xl",
    large: "text-4xl",
  }

  const iconSizes = {
    small: 20,
    default: 28,
    large: 40,
  }

  return (
    <div className="flex items-center gap-2">
      <div className="bg-primary rounded-lg p-2">
        <Utensils className="text-primary-foreground" size={iconSizes[size]} />
      </div>
      <span className={`font-bold text-primary ${sizeClasses[size]}`}>TchopMate</span>
    </div>
  )
}
