"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Logo } from "@/components/logo"
import {
  Bell,
  Clock,
  Star,
  ArrowLeft,
  Heart,
  Menu,
  ShoppingBag,
  Package,
  Utensils,
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Footer } from "@/components/ui/footer"
import Image from "next/image"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { supabase } from "@/lib/supabaseClient"
import type { User } from "@supabase/supabase-js"

interface CartItem {
  id: number
  name: string
  price: string
  quantity: number
  image: string
}

export default function FavorisPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [favorites, setFavorites] = useState<number[]>([])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartAnimation, setCartAnimation] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const savedFavorites = localStorage.getItem("tchopmate-favorites")
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    } else {
      const defaultFavorites = [1, 2, 4]
      setFavorites(defaultFavorites)
      localStorage.setItem("tchopmate-favorites", JSON.stringify(defaultFavorites))
    }
  }, [])

  const toggleFavorite = (itemId: number) => {
    const updatedFavorites = favorites.filter((id) => id !== itemId)
    setFavorites(updatedFavorites)
    localStorage.setItem("tchopmate-favorites", JSON.stringify(updatedFavorites))
  }

  const addToCart = (item: { id: number; name: string; price: string; image: string }) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id)
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        )
      }
      return [...prevCart, { ...item, quantity: 1 }]
    })

    // Trigger animation
    setCartAnimation(true)
    setTimeout(() => setCartAnimation(false), 500)
  }

  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(itemId)
      return
    }
    setCart((prevCart) => prevCart.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item)))
  }

  const removeFromCart = (itemId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId))
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const price = typeof item.price === 'number' ? item.price : (Number.parseInt(String(item.price).replace(/\D/g, "")) || 0)
      return total + price * item.quantity
    }, 0)
  }

  const menuItems = [
    {
      id: 1,
      name: "Ndolé aux crevettes",
      description: "Plat traditionnel camerounais avec des légumes verts et crevettes",
      price: "2500 FCFA",
      rating: 4.8,
      image: "/ndole-camerounais-plat-traditionnel.jpg",
      category: "plats",
      available: true,
      preparationTime: "25 min",
      spicy: true,
      vegetarian: false,
    },
    {
      id: 2,
      name: "Poulet DG",
      description: "Poulet sauté aux légumes et plantains, spécialité locale",
      price: "3000 FCFA",
      rating: 4.9,
      image: "/poulet-dg-cameroun-plantain.jpg",
      category: "plats",
      available: true,
      preparationTime: "30 min",
      spicy: false,
      vegetarian: false,
    },
    {
      id: 3,
      name: "Riz sauté aux légumes",
      description: "Riz parfumé sauté avec des légumes frais de saison",
      price: "1800 FCFA",
      rating: 4.5,
      image: "/riz-saut--l-gumes.jpg",
      category: "plats",
      available: true,
      preparationTime: "20 min",
      spicy: false,
      vegetarian: true,
    },
    {
      id: 4,
      name: "Jus de bissap",
      description: "Boisson rafraîchissante à base d'hibiscus",
      price: "500 FCFA",
      rating: 4.6,
      image: "/jus-bissap-hibiscus-rouge.jpg",
      category: "boissons",
      available: true,
      preparationTime: "5 min",
      spicy: false,
      vegetarian: true,
    },
    {
      id: 5,
      name: "Jus d'orange frais",
      description: "Jus d'orange pressé à la minute",
      price: "600 FCFA",
      rating: 4.7,
      image: "/jus-orange-frais.jpg",
      category: "boissons",
      available: true,
      preparationTime: "3 min",
      spicy: false,
      vegetarian: true,
    },
    {
      id: 6,
      name: "Eau minérale",
      description: "Eau minérale naturelle 50cl",
      price: "300 FCFA",
      rating: 4.0,
      image: "/bouteille-eau-min-rale.jpg",
      category: "boissons",
      available: true,
      preparationTime: "1 min",
      spicy: false,
      vegetarian: true,
    },
    {
      id: 7,
      name: "Beignets haricots",
      description: "Beignets croustillants aux haricots, parfait pour le petit-déjeuner",
      price: "1000 FCFA",
      rating: 4.7,
      image: "/beignets-haricots-cameroun-frits.jpg",
      category: "desserts",
      available: false,
      preparationTime: "20 min",
      spicy: false,
      vegetarian: true,
    },
    {
      id: 8,
      name: "Banane plantain grillée",
      description: "Banane plantain grillée avec un soupçon de cannelle",
      price: "800 FCFA",
      rating: 4.4,
      image: "/banane-plantain-grill-e.jpg",
      category: "desserts",
      available: true,
      preparationTime: "15 min",
      spicy: false,
      vegetarian: true,
    },
    {
      id: 9,
      name: "Fruit de saison",
      description: "Sélection de fruits frais de saison",
      price: "700 FCFA",
      rating: 4.3,
      image: "/fruits-tropicaux-frais.jpg",
      category: "desserts",
      available: true,
      preparationTime: "2 min",
      spicy: false,
      vegetarian: true,
    },
  ]

  const favoriteItems = menuItems.filter((item) => favorites.includes(item.id))

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()} className="hover:bg-orange-50">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Logo size="small" />

              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-semibold text-orange-600">Mes Favoris</h1>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/menu")}
                className="hover:bg-orange-50 text-gray-700"
              >
                <Utensils className="h-4 w-4 mr-2" />
                Menu
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/commandes")}
                className="hover:bg-orange-50 text-gray-700"
              >
                <Package className="h-4 w-4 mr-2" />
                Commandes
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={`relative ${cartAnimation ? "animate-bounce" : ""}`}
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="h-5 w-5" />
                {getTotalItems() > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-orange-500 text-white text-xs">
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>

              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-orange-500 text-white text-xs">
                  3
                </Badge>
              </Button>

              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarImage src={user?.user_metadata?.avatar_url || "/student-avatar.png"} />
                  <AvatarFallback className="bg-orange-100 text-orange-600">
                    {user?.email?.charAt(0).toUpperCase() || "ET"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {user?.user_metadata?.full_name || user?.email || "Étudiant"}
                  </p>
                  <p className="text-xs text-gray-500">Université Saint Jean</p>
                </div>
              </div>
            </div>

            <div className="flex md:hidden items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className={`relative ${cartAnimation ? "animate-bounce" : ""}`}
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="h-5 w-5" />
                {getTotalItems() > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-orange-500 text-white text-xs">
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>

              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                  <div className="flex flex-col space-y-6 mt-6">
                    <div className="flex items-center space-x-3 pb-4 border-b">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user?.user_metadata?.avatar_url || "/student-avatar.png"} />
                        <AvatarFallback className="bg-orange-100 text-orange-600">
                          {user?.email?.charAt(0).toUpperCase() || "ET"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user?.user_metadata?.full_name || user?.email || "Étudiant"}
                        </p>
                        <p className="text-sm text-gray-500">Université Saint Jean</p>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => {
                        router.push("/menu")
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      <Utensils className="h-5 w-5 mr-2" />
                      Menu
                    </Button>

                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => {
                        router.push("/commandes")
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      <Package className="h-5 w-5 mr-2" />
                      Mes commandes
                    </Button>

                    <Button variant="ghost" className="justify-start relative" asChild>
                      <div>
                        <Bell className="h-5 w-5 mr-2" />
                        Notifications
                        <Badge className="ml-auto h-5 w-5 rounded-full p-0 flex items-center justify-center bg-orange-500 text-white text-xs">
                          3
                        </Badge>
                      </div>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-orange-600 flex items-center gap-2">
              <ShoppingCart className="h-6 w-6" />
              Mon Panier
            </DialogTitle>
            <DialogDescription>
              {cart.length === 0 ? "Votre panier est vide" : `${getTotalItems()} article(s) dans votre panier`}
            </DialogDescription>
          </DialogHeader>

          {cart.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">Votre panier est vide</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-orange-50 rounded-lg">
                  <div className="relative h-20 w-20 flex-shrink-0">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                    <p className="text-sm text-orange-600 font-medium">{typeof item.price === 'number' ? `${item.price} FCFA` : item.price}</p>
                    <p className="text-xs text-gray-600">
                      Total: {(typeof item.price === 'number' ? item.price : (Number.parseInt(String(item.price).replace(/\D/g, "")) || 0)) * item.quantity} FCFA
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-medium">{getTotalPrice()} FCFA</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-orange-600">{getTotalPrice()} FCFA</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsCartOpen(false)} className="w-full sm:w-auto">
              Continuer mes achats
            </Button>
            {cart.length > 0 && (
              <Button
                className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white"
                onClick={() => {
                  setIsCartOpen(false)
                  // Handle order confirmation
                }}
              >
                Confirmer la commande
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl p-4 sm:p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="h-8 w-8 fill-white" />
              <h2 className="text-xl sm:text-2xl font-bold">Mes Plats Préférés</h2>
            </div>
            <p className="text-sm sm:text-base text-orange-100">
              {favoriteItems.length > 0
                ? `Vous avez ${favoriteItems.length} plat${favoriteItems.length > 1 ? "s" : ""} favori${favoriteItems.length > 1 ? "s" : ""}`
                : "Vous n'avez pas encore de plats favoris"}
            </p>
          </div>
        </div>

        {favoriteItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl p-12 shadow-sm max-w-md mx-auto">
              <Heart className="h-20 w-20 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun favori pour le moment</h3>
              <p className="text-gray-600 mb-6">
                Parcourez le menu et cliquez sur le cœur pour ajouter vos plats préférés
              </p>
              <Button
                onClick={() => router.push("/")}
                className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Découvrir le menu
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {favoriteItems.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className="relative h-48">
                  <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                  {!item.available && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="secondary" className="bg-red-500 text-white">
                        Non disponible
                      </Badge>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <Badge className="bg-white/90 text-gray-900 flex items-center space-x-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{item.rating}</span>
                    </Badge>
                  </div>
                  <div className="absolute top-2 left-2 flex space-x-1">
                    {item.vegetarian && <Badge className="bg-green-500 text-white text-xs">Végé</Badge>}
                    {item.spicy && <Badge className="bg-red-500 text-white text-xs">Épicé</Badge>}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute bottom-2 right-2 bg-white/80 hover:bg-white"
                    onClick={() => toggleFavorite(item.id)}
                  >
                    <Heart className="h-4 w-4 fill-orange-500 text-orange-500" />
                  </Button>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-base sm:text-lg">{item.name}</CardTitle>
                  <CardDescription className="text-sm text-gray-600 line-clamp-2">{item.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-base sm:text-lg font-bold text-orange-600">{item.price}</span>
                    <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{item.preparationTime}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white text-sm sm:text-base"
                    onClick={() => addToCart({ id: item.id, name: item.name, price: item.price, image: item.image })}
                    disabled={!item.available}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Ajouter au panier
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}