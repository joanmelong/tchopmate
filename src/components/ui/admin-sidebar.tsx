"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { LayoutDashboard, UtensilsCrossed, ShoppingBag, Users, BarChart3, Clock, Bell, Menu } from "lucide-react"
import { cn } from "@/lib/utils"

const navigationLinks = [
  { href: "/resto/id", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/resto/id/plats", label: "Gestion des plats", icon: UtensilsCrossed },
  { href: "/resto/id/commandes", label: "Gestion des commandes", icon: ShoppingBag },
  { href: "/resto/id/creneaux", label: "Créneaux horaires", icon: Clock },
  { href: "/resto/id/clients", label: "Gestion des clients", icon: Users },
  { href: "/resto/id/statistiques", label: "Statistiques", icon: BarChart3 },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-gradient-to-b from-orange-500 via-orange-600 to-amber-600">
      {/* Logo */}
      <div className="border-b border-orange-400/30 p-6">
        <Link href="/resto/id" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-lg">
            <UtensilsCrossed className="h-7 w-7 text-orange-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">TchopMate</h1>
            <p className="text-xs text-orange-100">Admin</p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2 p-4">
        {navigationLinks.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all",
                isActive ? "bg-white text-orange-600 shadow-lg" : "text-white hover:bg-white/10 hover:text-white",
              )}
            >
              <link.icon className="h-5 w-5" />
              <span>{link.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-orange-400/30 p-4">
        <div className="mb-3 flex items-center justify-center">
          <Button variant="ghost" size="sm" className="relative text-white hover:bg-white/10 hover:text-white">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
            </span>
          </Button>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-white/10 p-3">
          <Avatar className="h-10 w-10 border-2 border-white">
            <AvatarImage src="/placeholder-user.jpg" />
            <AvatarFallback className="bg-white text-orange-600">AD</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Administrateur</p>
            <p className="text-xs text-orange-100">admin@tchopmate.cm</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64">
        <SidebarContent />
      </aside>

      {/* Mobile Menu Button */}
      <div className="fixed left-4 top-4 z-50 lg:hidden">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button
              size="sm"
              className="bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg hover:from-orange-600 hover:to-amber-600"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
