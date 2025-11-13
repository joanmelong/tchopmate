"use client"

import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-md shadow-md py-4" : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Logo size="small" />

          <div className="hidden md:flex items-center gap-6">
            <Link href="/menu" className="text-foreground hover:text-primary transition-colors font-medium">
              Menu
            </Link>
            <Link href="/a-propos" className="text-foreground hover:text-primary transition-colors font-medium">
              À propos
            </Link>
            <Link href="/login">
              <Button variant="ghost" className="text-foreground hover:bg-primary/10">
                Se connecter
              </Button>
            </Link>
            <Link href="/register">
              <Button className="shadow-lg hover:shadow-xl transition-shadow">Commander</Button>
            </Link>
          </div>

          <button
            className="md:hidden p-2 text-foreground hover:bg-primary/10 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? "max-h-64 opacity-100 mt-4" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-col gap-3 py-4 bg-card/50 backdrop-blur-sm rounded-lg px-4">
            <Link href="/home" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full text-foreground hover:bg-primary/10 justify-start">
                Menu
              </Button>
            </Link>
            <Link href="/a-propos" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full text-foreground hover:bg-primary/10 justify-start">
                À propos
              </Button>
            </Link>
            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full text-foreground hover:bg-primary/10">
                Se connecter
              </Button>
            </Link>
            <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full shadow-lg hover:shadow-xl transition-shadow">Commander</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

