"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Logo } from "@/components/logo"
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  MapPin,
  Phone,
  User,
  Calendar,
  CreditCard,
  Bell,
  Menu,
  ShoppingBag,
  Utensils,
  Heart,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Footer } from "@/components/ui/footer"
import Image from "next/image"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { supabase } from "@/lib/supabaseClient"
import type { User as SupabaseUser } from "@supabase/supabase-js"

type OrderItem = {
  id: number | string
  name: string
  quantity: number
  price: number | string
  image: string
  description?: string | null
  categorie?: string | null
  temps_preparation?: number | null
}

type Order = {
  id: string
  date: string
  status: "en_cours" | "livree"
  items: OrderItem[]
  total: number
  clientName: string
  clientPhone: string
  restaurantAddress: string
}

// Type pour les données de l'API
type ApiCommandeItem = {
  id?: string | number
  plat_id?: string
  quantite?: number
  quantity?: number
  plat?: {
    nom?: string
    prix?: number
    image_url?: string
    description?: string
    categorie?: string
    temps_preparation?: number
  }
  name?: string
  price?: number
  image?: string
  description?: string
  categorie?: string
  temps_preparation?: number
}

type ApiCommande = {
  id_commande?: string
  id?: string
  date_commande?: string
  created_at?: string
  date?: string
  statut?: string
  montant_total?: number
  total?: number
  clientName?: string
  client_name?: string
  clientPhone?: string
  client_phone?: string
  restaurantAddress?: string
  restaurant_address?: string
  items?: ApiCommandeItem[]
  client?: {
    id?: number
    nom?: string
    prenom?: string
    email?: string
    numero_tel?: string
  }
}

// Fonction pour transformer les données de l'API en format Order
function transformApiCommande(apiCommande: ApiCommande): Order | null {
  try {
    // Transformer les items avec toutes les informations du plat
    const items: OrderItem[] = (apiCommande.items || []).map((item: ApiCommandeItem, index: number) => {
      const plat = item.plat || {}
      return {
        id: item.id || item.plat_id || index, // Utiliser id, plat_id, ou index comme clé unique
        name: plat.nom || item.name || 'Plat inconnu',
        quantity: item.quantite || item.quantity || 1,
        price: plat.prix || item.price || 0,
        image: plat.image_url || item.image || '/placeholder.svg',
        description: plat.description || item.description || null,
        categorie: plat.categorie || item.categorie || null,
        temps_preparation: plat.temps_preparation || item.temps_preparation || null,
      }
    })

    // Déterminer le statut
    let status: "en_cours" | "livree" = "en_cours"
    if (apiCommande.statut) {
      const statutLower = apiCommande.statut.toLowerCase()
      if (statutLower === 'livree' || statutLower === 'livré' || statutLower === 'livre') {
        status = "livree"
      } else {
        status = "en_cours"
      }
    }

    // Récupérer les informations client depuis l'API ou utiliser les valeurs par défaut
    const client = apiCommande.client || {}
    const clientName = client.nom && client.prenom
      ? `${client.prenom} ${client.nom}`
      : apiCommande.clientName || apiCommande.client_name || 'Client'
    const clientPhone = client.numero_tel || apiCommande.clientPhone || apiCommande.client_phone || ''

    return {
      id: apiCommande.id_commande || apiCommande.id || `CMD-${Date.now()}`,
      date: apiCommande.date_commande || apiCommande.created_at || apiCommande.date || new Date().toISOString(),
      status,
      items,
      total: apiCommande.montant_total || apiCommande.total || 0,
      clientName,
      clientPhone,
      restaurantAddress: apiCommande.restaurantAddress || apiCommande.restaurant_address || 'Adresse non disponible',
    }
  } catch (e) {
    console.error('Erreur transformation commande:', e, apiCommande)
    return null
  }
}

export default function CommandesPage() {
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])

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

  // Charger les commandes depuis localStorage
  useEffect(() => {
    const savedOrders = localStorage.getItem('tchopmate-orders')
    if (savedOrders) {
      try {
        const parsed = JSON.parse(savedOrders)
        setOrders(parsed)
      } catch (e) {
        console.warn('Erreur lecture commandes', e)
        setOrders([])
      }
    }
  }, [])

  // Charger depuis l'API Supabase et synchroniser localStorage
  useEffect(() => {
    const fetchFromApi = async () => {
      try {
        const mod = await import('@/services/commandes')
        const commandes = await mod.getCommandes()
        if (Array.isArray(commandes)) {
          // Transformer les données de l'API
          const transformedOrders = commandes
            .map(transformApiCommande)
            .filter((order): order is Order => order !== null)
          
          if (transformedOrders.length > 0) {
            setOrders(transformedOrders)
            try {
              localStorage.setItem('tchopmate-orders', JSON.stringify(transformedOrders))
            } catch (e) {
              console.warn('Erreur sauvegarde commandes local', e)
            }
          }
        }
      } catch (e) {
        console.warn('Erreur fetch commandes API', e)
      }
    }

    fetchFromApi()
  }, [])

  const defaultOrders: Order[] = [
    {
      id: "CMD-001",
      date: "2024-10-22 12:30",
      status: "livree",
      items: [
        {
          id: 1,
          name: "Ndolé aux crevettes",
          quantity: 2,
          price: 2500,
          image: "/ndole-camerounais-plat-traditionnel.jpg",
          description: "Plat traditionnel camerounais avec des feuilles de ndolé, des crevettes et de la viande",
          categorie: "Plat principal",
          temps_preparation: 45,
        },
        {
          id: 4,
          name: "Jus de bissap",
          quantity: 2,
          price: 500,
          image: "/jus-bissap-hibiscus-rouge.jpg",
          description: "Jus frais de fleurs d'hibiscus, rafraîchissant et naturel",
          categorie: "Boisson",
          temps_preparation: 5,
        },
      ],
      total: 6000,
      clientName: "Jean Dupont",
      clientPhone: "+237 6 XX XX XX XX",
      restaurantAddress: "Restaurant Universitaire Saint Jean, Campus Principal, Yaoundé",
    },
    {
      id: "CMD-002",
      date: "2024-10-21 19:15",
      status: "en_cours",
      items: [
        {
          id: 2,
          name: "Poulet DG",
          quantity: 1,
          price: 3000,
          image: "/poulet-dg-cameroun-plantain.jpg",
          description: "Poulet sauté avec plantain, légumes et épices camerounaises",
          categorie: "Plat principal",
          temps_preparation: 35,
        },
        {
          id: 3,
          name: "Riz sauté aux légumes",
          quantity: 1,
          price: 1800,
          image: "/riz-saut--l-gumes.jpg",
          description: "Riz sauté avec une variété de légumes frais et épices",
          categorie: "Plat principal",
          temps_preparation: 25,
        },
        {
          id: 5,
          name: "Jus d'orange frais",
          quantity: 1,
          price: 600,
          image: "/jus-orange-frais.jpg",
          description: "Jus d'orange pressé fraîchement, riche en vitamine C",
          categorie: "Boisson",
          temps_preparation: 5,
        },
      ],
      total: 5400,
      clientName: "Marie Kamga",
      clientPhone: "+237 6 YY YY YY YY",
      restaurantAddress: "Restaurant Universitaire Saint Jean, Campus Principal, Yaoundé",
    },
    {
      id: "CMD-003",
      date: "2024-10-20 13:45",
      status: "livree",
      items: [
        {
          id: 8,
          name: "Banane plantain grillée",
          quantity: 3,
          price: 800,
          image: "/banane-plantain-grill-e.jpg",
          description: "Bananes plantains grillées, servies chaudes",
          categorie: "Accompagnement",
          temps_preparation: 15,
        },
        {
          id: 6,
          name: "Eau minérale",
          quantity: 2,
          price: 300,
          image: "/bouteille-eau-min-rale.jpg",
          description: "Eau minérale naturelle",
          categorie: "Boisson",
          temps_preparation: 0,
        },
      ],
      total: 3000,
      clientName: "Paul Nkomo",
      clientPhone: "+237 6 ZZ ZZ ZZ ZZ",
      restaurantAddress: "Restaurant Universitaire Saint Jean, Campus Principal, Yaoundé",
    },
    {
      id: "CMD-004",
      date: "2024-10-19 12:00",
      status: "en_cours",
      items: [
        {
          id: 7,
          name: "Beignets haricots",
          quantity: 2,
          price: 1000,
          image: "/beignets-haricots-cameroun-frits.jpg",
          description: "Beignets de haricots frits, croustillants et savoureux",
          categorie: "Snack",
          temps_preparation: 20,
        },
      ],
      total: 2000,
      clientName: "Sophie Mballa",
      clientPhone: "+237 6 AA AA AA AA",
      restaurantAddress: "Restaurant Universitaire Saint Jean, Campus Principal, Yaoundé",
    },
  ]

  // Fusionner les commandes par défaut avec celles chargées
  useEffect(() => {
    setOrders((prev) => {
      if (prev.length > 0) return prev
      return defaultOrders
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "en_cours":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1 px-3 py-1">
            <Clock className="h-3 w-3" />
            En cours
          </Badge>
        )
      case "livree":
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-1 px-3 py-1">
            <CheckCircle className="h-3 w-3" />
            Livrée
          </Badge>
        )
    }
  }

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()} className="hover:bg-orange-50">
                <ArrowLeft className="h-5 w-5 text-orange-600" />
              </Button>
              <Logo size="small" />
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-orange-600">Mes Commandes</h1>
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
                onClick={() => router.push("/favoris")}
                className="hover:bg-orange-50 text-gray-700"
              >
                <Heart className="h-4 w-4 mr-2" />
                Favoris
              </Button>

              <Button variant="ghost" size="sm" className="relative hover:bg-orange-50">
                <Bell className="h-5 w-5 text-gray-600" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-orange-500 text-white text-xs">
                  3
                </Badge>
              </Button>

              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8 cursor-pointer border-2 border-orange-200">
                  <AvatarImage src={user?.user_metadata?.avatar_url || "/student-avatar.png"} />
                  <AvatarFallback className="bg-orange-100 text-orange-600 font-semibold">
                    {user?.email?.charAt(0).toUpperCase() || "ET"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.user_metadata?.full_name || user?.email || "Étudiant"}
                  </p>
                  <p className="text-xs text-gray-500">Université Saint Jean</p>
                </div>
              </div>
            </div>

            <div className="flex md:hidden items-center space-x-2">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="hover:bg-orange-50">
                    <Menu className="h-5 w-5 text-orange-600" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                  <div className="flex flex-col space-y-6 mt-6">
                    <div className="flex items-center space-x-3 pb-4 border-b">
                      <Avatar className="h-12 w-12 border-2 border-orange-200">
                        <AvatarImage src={user?.user_metadata?.avatar_url || "/student-avatar.png"} />
                        <AvatarFallback className="bg-orange-100 text-orange-600 font-semibold">
                          {user?.email?.charAt(0).toUpperCase() || "ET"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-gray-900">
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
                        router.push("/favoris")
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      <Heart className="h-5 w-5 mr-2" />
                      Favoris
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
          <div className="bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-white/20 p-3 rounded-full">
                <ShoppingBag className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold">Historique de vos commandes</h2>
            </div>
            <p className="text-sm sm:text-base text-orange-50 ml-0 sm:ml-14">
              Consultez toutes vos commandes passées et suivez leur statut en temps réel
            </p>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.map((order, orderIndex) => (
            <Card
              key={order.id || `order-${orderIndex}`}
              className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-orange-200"
            >
              <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50 pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-500 p-2 rounded-lg">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base sm:text-lg font-bold text-gray-900">
                        Commande {order.id}
                      </CardTitle>
                      <CardDescription className="flex items-center space-x-1 text-xs sm:text-sm mt-1">
                        <Calendar className="h-3 w-3 text-orange-500" />
                        <span className="font-medium">{order.date}</span>
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-orange-500" />
                      Articles commandés:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((item, index) => (
                        <Badge 
                          key={item.id !== undefined ? `item-${order.id}-${item.id}` : `item-${order.id}-${index}`} 
                          variant="outline" 
                          className="bg-white border-orange-200 text-gray-700"
                        >
                          {item.name} (x{item.quantity})
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="flex items-center justify-between pt-3 border-t border-orange-100">
                    <div className="flex items-center space-x-2">
                      <div className="bg-orange-100 p-2 rounded-lg">
                        <CreditCard className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Montant total</p>
                        <p className="text-lg font-bold text-orange-600">{order.total} FCFA</p>
                      </div>
                    </div>
                    <Button
                      className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
                      onClick={() => openOrderDetail(order)}
                    >
                      Voir détails
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {orders.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-10 w-10 text-orange-500" />
            </div>
            <p className="text-gray-600 text-lg mb-2 font-semibold">Aucune commande pour le moment</p>
            <p className="text-gray-500 mb-6">Commencez à explorer notre délicieux menu</p>
            <Button
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-md"
              onClick={() => router.push("/menu")}
            >
              Découvrir le menu
            </Button>
          </div>
        )}
      </main>

      {/* Order Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="w-[95vw] max-w-3xl max-h-[85vh] sm:max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-orange-600 flex items-center gap-2">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Package className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              Détails de la commande {selectedOrder?.id}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2 text-sm sm:text-base text-gray-600">
              Toutes les informations relatives à votre commande
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border-2 border-orange-200">
                <span className="font-semibold text-gray-700 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  Statut de la commande:
                </span>
                {getStatusBadge(selectedOrder.status)}
              </div>

              {/* Date */}
              <div className="space-y-3">
                <h3 className="font-bold text-lg text-gray-900 border-b-2 border-orange-200 pb-2 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-500" />
                  Date de la commande
                </h3>
                <div className="flex items-center space-x-2 text-sm p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <span className="text-gray-600">Commandé le:</span>
                  <span className="font-semibold text-gray-900">{selectedOrder.date}</span>
                </div>
              </div>

              {/* Client Information */}
              <div className="space-y-3">
                <h3 className="font-bold text-lg text-gray-900 border-b-2 border-orange-200 pb-2 flex items-center gap-2">
                  <User className="h-5 w-5 text-orange-500" />
                  Informations client
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2 text-sm p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <User className="h-4 w-4 text-orange-500" />
                    <span className="text-gray-600">Nom:</span>
                    <span className="font-semibold">{selectedOrder.clientName}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <Phone className="h-4 w-4 text-orange-500" />
                    <span className="text-gray-600">Téléphone:</span>
                    <span className="font-semibold">{selectedOrder.clientPhone}</span>
                  </div>
                </div>
              </div>

              {/* Restaurant Address */}
              <div className="space-y-3">
                <h3 className="font-bold text-lg text-gray-900 border-b-2 border-orange-200 pb-2 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-orange-500" />
                  Adresse du restaurant
                </h3>
                <div className="flex items-start space-x-2 text-sm p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <MapPin className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">{selectedOrder.restaurantAddress}</span>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-3">
                <h3 className="font-bold text-lg text-gray-900 border-b-2 border-orange-200 pb-2 flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-orange-500" />
                  Éléments de la commande
                </h3>
                <div className="space-y-4">
                  {selectedOrder.items.map((item, index) => {
                    const itemPrice = typeof item.price === 'string' ? Number.parseInt(item.price.replace(/\D/g, '')) : Number(item.price) || 0
                    const totalPrice = itemPrice * item.quantity
                    
                    return (
                      <div
                        key={item.id !== undefined ? `detail-item-${selectedOrder.id}-${item.id}` : `detail-item-${selectedOrder.id}-${index}`}
                        className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          <div className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              fill
                              className="object-cover rounded-md border-2 border-orange-200"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1">
                                <h4 className="font-bold text-base sm:text-lg text-gray-900 mb-1">{item.name}</h4>
                                {item.categorie && (
                                  <Badge variant="outline" className="text-xs mb-2 border-orange-300 text-orange-700 bg-orange-100">
                                    {item.categorie}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="font-bold text-orange-600 text-lg">
                                  {totalPrice} FCFA
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {itemPrice} FCFA × {item.quantity}
                                </p>
                              </div>
                            </div>
                            {item.description && (
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {item.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              {item.temps_preparation && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>Préparation: {item.temps_preparation} min</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Order Total */}
              <div className="border-t-2 border-orange-200 pt-4 space-y-3 bg-orange-50 p-4 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">Sous-total</span>
                  <span className="font-semibold text-gray-900">{selectedOrder.total} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">Frais de service</span>
                  <span className="font-semibold text-gray-900">0 FCFA</span>
                </div>
                <div className="flex justify-between text-lg sm:text-xl font-bold border-t-2 border-orange-300 pt-3">
                  <span className="text-gray-900">Montant total</span>
                  <span className="text-orange-600">{selectedOrder.total} FCFA</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4">
                <Button
                  className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                  onClick={() => setIsDetailOpen(false)}
                >
                  Fermer
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