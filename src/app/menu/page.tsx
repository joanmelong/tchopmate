
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
  ChefHat,
  Coffee,
  Cookie,
  Search,
  ArrowLeft,
  Heart,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Menu,
  ClipboardList,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Footer } from "@/components/ui/footer"
import Image from "next/image"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { supabase } from "@/lib/supabaseClient"
import type { User } from "@supabase/supabase-js"

type CartItem = {
  id: number
  name: string
  price: string
  quantity: number
  image: string
}

export default function MenuPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [cartAnimation, setCartAnimation] = useState(false)
  const [favorites, setFavorites] = useState<number[]>([])

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
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("tchopmate-favorites", JSON.stringify(favorites))
  }, [favorites])

  const toggleFavorite = (itemId: number) => {
    setFavorites((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId)
      } else {
        return [...prev, itemId]
      }
    })
  }

  // Charger les plats depuis les menus activés
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Array<{ id: string; name: string; icon: any }>>([
    { id: "all", name: "Tout", icon: ChefHat },
  ])

  useEffect(() => {
    loadActiveMenuDishes()
  }, [])

  const loadActiveMenuDishes = async () => {
    try {
      setLoading(true)
      // Récupérer tous les menus activés avec leurs plats
      const { data: activeMenus, error } = await supabase
        .from('menu')
        .select(`
          id,
          nom,
          description,
          image_url,
          menu_plat (
            id,
            quantite,
            plat (
              id,
              nom,
              description,
              prix,
              image_url,
              categorie,
              disponible,
              temps_preparation
            )
          )
        `)
        .eq('disponible', true)

      if (error) throw error

      // Transformer les données pour correspondre au format attendu
      const dishes: any[] = []
      activeMenus?.forEach((menu) => {
        menu.menu_plat?.forEach((mp: any) => {
          if (mp.plat && mp.plat.disponible) {
            dishes.push({
              id: mp.plat.id,
              name: mp.plat.nom,
              description: mp.plat.description || '',
              price: `${mp.plat.prix} FCFA`,
              rating: 4.5,
              image: mp.plat.image_url || null,
              category: mp.plat.categorie?.toLowerCase() || 'plats',
              available: mp.plat.disponible,
              preparationTime: mp.plat.temps_preparation ? `${mp.plat.temps_preparation} min` : '20 min',
              spicy: false,
              vegetarian: false,
              menuName: menu.nom,
            })
          }
        })
      })

      setMenuItems(dishes)

      // Extraire les catégories uniques des plats
      const uniqueCategories = Array.from(new Set(dishes.map(d => d.category).filter(Boolean)))
      
      // Mapper les catégories avec des icônes appropriées
      const categoryIcons: Record<string, any> = {
        'plats': ChefHat,
        'plat': ChefHat,
        'boissons': Coffee,
        'boisson': Coffee,
        'desserts': Cookie,
        'dessert': Cookie,
        'entrées': ChefHat,
        'entrée': ChefHat,
      }

      const dynamicCategories = [
        { id: "all", name: "Tout", icon: ChefHat },
        ...uniqueCategories.map(cat => ({
          id: cat,
          name: cat.charAt(0).toUpperCase() + cat.slice(1),
          icon: categoryIcons[cat.toLowerCase()] || ChefHat,
        }))
      ]

      setCategories(dynamicCategories)
    } catch (error) {
      console.error('Error loading menu dishes:', error)
    } finally {
      setLoading(false)
    }
  }

  const oldMenuItems = [
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

  const addToCart = (item: (typeof menuItems)[0]) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id)
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        )
      }
      return [...prevCart, { id: item.id, name: item.name, price: item.price, quantity: 1, image: item.image }]
    })

    setCartAnimation(true)
    setTimeout(() => setCartAnimation(false), 600)
  }

  const updateQuantity = (id: number, change: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.id === id) {
            const newQuantity = item.quantity + change
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null
          }
          return item
        })
        .filter((item): item is CartItem => item !== null)
    })
  }

  const removeFromCart = (id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const price = Number.parseInt(item.price.replace(/\D/g, ""))
      return total + price * item.quantity
    }, 0)
  }

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-yellow-600 bg-gradient-to-b from-background">
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
                <h1 className="text-lg sm:text-xl font-semibold text-yellow-600">Menu</h1>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/commandes")}
                className="hover:bg-orange-50"
              >
                <ClipboardList className="h-5 w-5 mr-2" />
                Mes commandes
              </Button>

              <Button variant="ghost" size="sm" onClick={() => router.push("/favoris")} className="hover:bg-orange-50">
                <Heart className="h-5 w-5 mr-2" />
                Favoris
                {favorites.length > 0 && (
                  <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                    {favorites.length}
                  </Badge>
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={`relative transition-transform ${cartAnimation ? "animate-bounce" : ""}`}
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
                className={`relative transition-transform ${cartAnimation ? "animate-bounce" : ""}`}
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
                        router.push("/commandes")
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      <ClipboardList className="h-5 w-5 mr-2" />
                      Mes commandes
                    </Button>

                    <Button
                      variant="ghost"
                      className="justify-start relative"
                      onClick={() => {
                        router.push("/favoris")
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      <Heart className="h-5 w-5 mr-2" />
                      Favoris
                      {favorites.length > 0 && (
                        <Badge className="ml-auto h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                          {favorites.length}
                        </Badge>
                      )}
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl p-4 sm:p-6 text-white">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              Menu du jour - {new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                day: '2-digit', 
                month: 'long' 
              }).replace(/^\w/, (c) => c.toUpperCase())}
            </h2>
            <p className="text-sm sm:text-base text-orange-100">
              Découvrez tous nos plats, boissons et desserts disponibles aujourd'hui
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative w-full sm:max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un plat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => {
              const Icon = category.icon
              const count = category.id === "all" 
                ? menuItems.length 
                : menuItems.filter(item => item.category === category.id).length
              
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className={`flex items-center space-x-2 whitespace-nowrap ${
                    selectedCategory === category.id
                      ? "bg-orange-500 hover:bg-orange-600 text-white"
                      : "hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200"
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <Icon className="h-4 w-4" />
                  <span>{category.name}</span>
                  {count > 0 && (
                    <Badge 
                      className={`ml-1 ${
                        selectedCategory === category.id 
                          ? "bg-orange-600 text-white" 
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {count}
                    </Badge>
                  )}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Menu Items */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
              <div className="relative h-48 bg-gray-100">
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="%239ca3af"%3EImage non disponible%3C/text%3E%3C/svg%3E';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <ChefHat className="h-16 w-16 text-gray-400" />
                  </div>
                )}
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
                  <Heart
                    className={`h-4 w-4 transition-colors ${
                      favorites.includes(item.id) ? "fill-red-500 text-red-500" : "text-gray-600"
                    }`}
                  />
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
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm sm:text-base"
                  disabled={!item.available}
                  onClick={() => addToCart(item)}
                >
                  {item.available ? "Commander" : "Non disponible"}
                </Button>
              </CardContent>
            </Card>
            ))}
          </div>
        )}

        {!loading && filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Aucun élément trouvé pour votre recherche.</p>
            <Button
              variant="outline"
              className="mt-4 bg-transparent"
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
              }}
            >
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </main>

      <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] sm:max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-orange-600 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
              Mon Panier
            </DialogTitle>
            <DialogDescription>
              {cart.length === 0 ? "Votre panier est vide" : `${getTotalItems()} article(s) dans votre panier`}
            </DialogDescription>
          </DialogHeader>

          {cart.length === 0 ? (
            <div className="py-12 text-center">
              <ShoppingCart className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">Votre panier est vide</p>
              <Button onClick={() => setIsCartOpen(false)} className="bg-orange-500 hover:bg-orange-600">
                Continuer mes achats
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Cart Items */}
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">{item.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {item.price} × {item.quantity}
                      </p>
                      <p className="text-sm sm:text-base text-orange-600 font-bold">
                        {Number.parseInt(item.price.replace(/\D/g, "")) * item.quantity} FCFA
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                        >
                          <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <span className="w-6 sm:w-8 text-center font-semibold text-sm sm:text-base">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 w-7 sm:h-8 sm:w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4 sm:h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-semibold">{getTotalPrice()} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Frais de service</span>
                  <span className="font-semibold">0 FCFA</span>
                </div>
                <div className="flex justify-between text-base sm:text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span className="text-orange-600">{getTotalPrice()} FCFA</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setIsCartOpen(false)}>
                  Continuer mes achats
                </Button>
                <Button
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={() => {
                    alert("Commande confirmée!")
                  }}
                >
                  Confirmer la commande
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <Footer />
    </div>
  )
}
