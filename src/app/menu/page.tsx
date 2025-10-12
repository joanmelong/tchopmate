"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Logo } from "@/components/logo"
import { supabase } from "@/lib/supabaseClient"
import {
  Bell,
  Clock,
  Star,
  ChefHat,
  Coffee,
  Cookie,
  Settings,
  LogOut,
  Search,
  Filter,
  ArrowLeft,
  Heart,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { GoogleLogin } from "@/components/auth/GoogleLogin"
import { Footer } from "@/components/ui/footer"
import Image from "next/image"

export default function MenuPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data.user) setUser(data.user);
      getUser();
    };
  }, []);
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  const categories = [
    { id: "all", name: "Tout", icon: ChefHat },
    { id: "plats", name: "Plats", icon: ChefHat },
    { id: "boissons", name: "Boissons", icon: Coffee },
    { id: "desserts", name: "Desserts", icon: Cookie },
  ]

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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()} className="hover:bg-orange-50">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Logo size="small" />
              
              <div className="hidden md:block">
                <h1 className="text-xl font-semibold text-yellow-600">Menu</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-orange-500 text-white text-xs">
                  3
                </Badge>
              </Button>

              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarImage src="/student-avatar.png" />
                  <AvatarFallback className="bg-orange-100 text-orange-600">ET</AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">Étudiant</p>
                  <p className="text-xs text-gray-500">Université Saint Jean</p>
                </div>
              </div>

              <Button variant="ghost" size="sm">
                <Settings className="h-5 w-5" />
              </Button>
              <div className="p-4">
                {user ? (
                  <div>
                    <h1>{user.email}</h1>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </div>
                ) : (
                  <GoogleLogin />
                )}
              </div>
              
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">Menu du jour - Samedi 04 Octobre</h2>
            <p className="text-orange-100">Découvrez tous nos plats, boissons et desserts disponibles aujourd'hui</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un plat, boisson ou dessert..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <Button
              variant="outline"
              className="flex items-center space-x-2 bg-transparent"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              <span>Filtres</span>
            </Button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-sm">Végétarien</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-sm">Épicé</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-sm">Disponible</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-sm">Moins de 2000 FCFA</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="mb-8">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => {
              const Icon = category.icon
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
                </Button>
              )
            })}
          </div>
        </div>

        {/* Menu Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
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
                <Button variant="ghost" size="sm" className="absolute bottom-2 right-2 bg-white/80 hover:bg-white">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <CardDescription className="text-sm text-gray-600">{item.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-orange-600">{item.price}</span>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>{item.preparationTime}</span>
                  </div>
                </div>

                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white" disabled={!item.available}>
                  {item.available ? "Commander" : "Non disponible"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
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

      {/* Footer */}
      <Footer />
    </div>
  )
}
