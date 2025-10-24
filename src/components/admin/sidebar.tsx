"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, UtensilsCrossed, BookOpen, ShoppingCart, BarChart3, ChevronLeft, LogOut } from "lucide-react"

interface SidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const pathname = usePathname()

  const menuItems = [
    { href: "/resto/id", label: "Tableau de bord", icon: LayoutDashboard },
    { href: "/resto/id/dishes", label: "Gestion des plats", icon: UtensilsCrossed },
    { href: "/resto/id/menus", label: "Gestion des menus", icon: BookOpen },
    { href: "/resto/id/orders", label: "Commandes", icon: ShoppingCart },
    { href: "/resto/id/analytics", label: "Statistiques", icon: BarChart3 },
  ]

  return (
    <>
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 lg:relative lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TM</span>
              </div>
              <span className="font-bold text-gray-900">TchopMate</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="lg:hidden">
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start space-x-3",
                      isActive ? "bg-primary/20 text-primary hover:bg-primary/30" : "text-gray-600 hover:bg-gray-100",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="outline"
              className="w-full justify-start space-x-3 text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent border-gray-200"
            >
              <LogOut className="h-5 w-5" />
              <span>Déconnexion</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {open && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => onOpenChange(false)} />}
    </>
  )
}
