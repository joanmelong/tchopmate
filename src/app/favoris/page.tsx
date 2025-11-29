// INSTRUCTIONS: Remplacez le contenu de src/app/favoris/page.tsx par ce fichier
// Puis supprimez ce fichier

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Logo } from "@/components/logo"
import {
  Clock,
  Star,
  ArrowLeft,
  Heart,
  Menu,
  ShoppingBag,
  Package,
  Utensils,
  ShoppingCart,
  ChefHat,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Footer } from "@/components/ui/footer"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { supabase } from "@/lib/supabaseClient"
import type { User } from "@supabase/supabase-js"

export default function FavorisPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [favoriteDishes, setFavoriteDishes] = useState<Array<{ 
    id: number; 
    nom: string; 
    name: string;
    prix: number; 
    price: number;
    image_url?: string; 
    image: string;
    description?: string; 
    restaurant_id: string;
    rating: number;
    available: boolean;
    preparationTime: string;
  }>>([])
  const [loading, setLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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

  // Charger les favoris depuis la base de données
  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) {
        setLoading(false)
        return
      }
      
      try {
        setLoading(true)
        
        // Récupérer les favoris avec les détails des plats
        const { data, error } = await supabase
          .from('favoris')
          .select(`
            plat_id,
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
          `)
          .eq('user_id', user.id)
        
        if (error) {
          console.error('Erreur chargement favoris:', error)
          return
        }
        
        // Transformer les données pour l'affichage
        const dishes = data?.map((f: { plat_id: string; plat: Record<string, unknown>[] | Record<string, unknown> }) => {
          const plat = Array.isArray(f.plat) ? f.plat[0] : f.plat
          return {
            id: Number(plat.id),
            nom: String(plat.nom),
            name: String(plat.nom),
            description: String(plat.description || ''),
            prix: Number(plat.prix),
            price: Number(plat.prix),
            image_url: String(plat.image_url || '/placeholder.svg'),
            image: String(plat.image_url || '/placeholder.svg'),
            restaurant_id: String(plat.restaurant_id || ''),
            rating: 4.5,
            available: Boolean(plat.disponible !== false),
            preparationTime: plat.temps_preparation ? `${plat.temps_preparation} min` : '15 min'
          }
        }) || []
        
        setFavoriteDishes(dishes)
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadFavorites()
  }, [user])

  const toggleFavorite = async (itemId: string) => {
    if (!user) return
    
    const { error } = await supabase
      .from('favoris')
      .delete()
      .eq('user_id', user.id)
      .eq('plat_id', itemId)
    
    if (error) {
      console.error('Erreur suppression favori:', error)
      return
    }
    
    setFavoriteDishes(prev => prev.filter(dish => dish.id !== Number(itemId)))
  }

  const addToCart = (item: { id: number; name: string; price: number; image?: string }) => {
    // Récupérer le panier actuel
    const savedCart = localStorage.getItem("tchopmate-cart")
    const cart = savedCart ? JSON.parse(savedCart) : []
    
    // Ajouter l'item
    const existingItem = cart.find((cartItem: { id: number; quantity: number }) => cartItem.id === item.id)
    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cart.push({ ...item, quantity: 1 })
    }
    
    // Sauvegarder
    localStorage.setItem("tchopmate-cart", JSON.stringify(cart))
    
    // Rediriger vers le menu
    router.push("/menu")
  }

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

              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8 cursor-pointer" onClick={() => router.push("/profil")}>
                  <AvatarImage src={user?.user_metadata?.avatar_url || "/student-avatar.png"} />
                  <AvatarFallback className="bg-orange-100 text-orange-600">
                    {user?.email?.charAt(0).toUpperCase() || "ET"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            <div className="flex md:hidden items-center space-x-2">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                  <div className="flex flex-col space-y-6 mt-6">
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
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl p-4 sm:p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="h-8 w-8 fill-white" />
              <h2 className="text-xl sm:text-2xl font-bold">Mes Plats Préférés</h2>
            </div>
            <p className="text-sm sm:text-base text-orange-100">
              {favoriteDishes.length > 0
                ? `Vous avez ${favoriteDishes.length} plat${favoriteDishes.length > 1 ? "s" : ""} favori${favoriteDishes.length > 1 ? "s" : ""}`
                : "Vous n'avez pas encore de plats favoris"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : favoriteDishes.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl p-12 shadow-sm max-w-md mx-auto">
              <Heart className="h-20 w-20 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun favori pour le moment</h3>
              <p className="text-gray-600 mb-6">
                Parcourez le menu et cliquez sur le cœur pour ajouter vos plats préférés
              </p>
              <Button
                onClick={() => router.push("/menu")}
                className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Découvrir le menu
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {favoriteDishes.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className="relative h-48 bg-gray-100">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
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
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-white/90 text-gray-900 flex items-center space-x-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{item.rating}</span>
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute bottom-2 right-2 bg-white/80 hover:bg-white"
                    onClick={() => toggleFavorite(String(item.id))}
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
                    <span className="text-base sm:text-lg font-bold text-orange-600">{item.price} FCFA</span>
                    <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{item.preparationTime}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white text-sm sm:text-base"
                    onClick={() => addToCart(item)}
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
