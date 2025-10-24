"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MenuTabsProps {
  activeMenu: string
  onMenuChange: (menu: string) => void
}

export function MenuTabs({ activeMenu, onMenuChange }: MenuTabsProps) {
  return (
    <div className="flex space-x-2 border-b border-gray-200">
      <Button
        variant="ghost"
        className={cn(
          "px-4 py-2 border-b-2 rounded-none font-medium",
          activeMenu === "permanent"
            ? "border-orange-500 text-orange-600"
            : "border-transparent text-gray-600 hover:text-gray-900",
        )}
        onClick={() => onMenuChange("permanent")}
      >
        Menu permanent
      </Button>
      <Button
        variant="ghost"
        className={cn(
          "px-4 py-2 border-b-2 rounded-none font-medium",
          activeMenu === "daily"
            ? "border-orange-500 text-orange-600"
            : "border-transparent text-gray-600 hover:text-gray-900",
        )}
        onClick={() => onMenuChange("daily")}
      >
        Menu du jour
      </Button>
    </div>
  )
}
