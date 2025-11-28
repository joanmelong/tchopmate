"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  UtensilsCrossed,
  Search,
  Eye,
  Clock,
  User,
  Phone,
  MapPin,
  LayoutDashboard,
  ShoppingBag,
  Users,
  BarChart3,
  Package,
} from "lucide-react"
import { AdminSidebar } from "@/components/ui/admin-sidebar"
import { CommandeGerantService, type GerantOrder } from '@/services/CommandeGerant'

// Debbuging: logs, mapping etc. will follow in code

// Interfaces types
interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  image: string
}

interface Order {
  id: string
  clientName: string
  clientPhone: string
  items: OrderItem[]
  total: number
  status: "en cours" | "livrée" | string
  date: string
  time: string
}

export default function GestionCommandes() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState<boolean>(false)

  // Fetch orders from the server for the current gerant's restaurant
  // loadOrders is used in useEffect + refresh button
  // loadOrders is used in useEffect + refresh button
  const loadOrders = async () => {
      try {
        console.log('[GestionCommandes] Chargement des commandes pour le restaurant')
        setLoadingOrders(true)
        const data: GerantOrder[] = await CommandeGerantService.fetchOrders()

        // Map GerantOrder => Order (UI format)
        const normalizedStatus = (s?: string) => {
          if (!s) return 'en cours'
          const v = String(s).toLowerCase()
          if (v === 'livree' || v === 'livrée' || v === 'livre') return 'livrée'
          if (v.includes('attente') || v.includes('en_attente') || v.includes('to_pay')) return 'en cours'
          return s
        }

        const mapped = (data || []).map((g) => ({
          id: g.id_commande,
          clientName: g.client?.nom ? `${g.client.nom} ${g.client.prenom ?? ''}`.trim() : 'Client',
          clientPhone: g.client?.numero_tel ?? g.client?.email ?? 'N/A',
          items: (g.items || []).map((it: any) => ({
            id: String(it.id || it.plat_id || Math.random()),
            name: it.nom ?? 'Plat',
            quantity: it.quantite ?? it.quantity ?? 1,
            price: it.prix ?? 0,
            image: it.image_url ?? '/placeholder.svg',
          })),
          total: g.montant_total ?? 0,
          status: normalizedStatus(g.statut),
          date: g.date_commande ? new Date(g.date_commande).toLocaleDateString('fr-FR') : '',
          time: g.date_commande ? new Date(g.date_commande).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '',
        }))

        setOrders(mapped)
        console.log('[GestionCommandes] Commandes chargées', mapped.length)
      } catch (e) {
        console.error('[GestionCommandes] Erreur chargement commandes:', e)
      } finally {
        setLoadingOrders(false)
      }
  }

  useEffect(() => {
    let isMounted = true
    loadOrders()
    return () => {
      isMounted = false
    }
  }, [])

  const navigationLinks = [
    { href: "/resto/admin", label: "Tableau de bord", icon: LayoutDashboard },
    { href: "/resto/admin/plats", label: "Gestion des plats", icon: UtensilsCrossed },
    { href: "/resto/admin/commandes", label: "Gestion des commandes", icon: ShoppingBag },
    { href: "/resto/admin/clients", label: "Gestion des clients", icon: Users },
    { href: "/resto/admin/statistiques", label: "Statistiques", icon: BarChart3 },
  ]

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.clientName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    console.log('[GestionCommandes] handleStatusChange', orderId, newStatus)
    // Normaliser le statut pour le serveur (supprimer accents et mettre en minuscule)
    const statusForServer = String(newStatus).normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
    // Update server
    const ok = await CommandeGerantService.updateOrderStatus(orderId, statusForServer)
    if (!ok) {
      console.warn('[GestionCommandes] Échec update statut serveur pour', orderId)
      return
    }
    // Update local state
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
  }

  const handleViewDetails = async (order: Order) => {
    try {
      console.log('[GestionCommandes] handleViewDetails', order.id)
      const full = await CommandeGerantService.getOrder(order.id)
      if (!full) {
        console.warn('[GestionCommandes] Détails commande introuvables côté serveur pour', order.id)
        setSelectedOrder(order)
        setIsDetailDialogOpen(true)
        return
      }
      const mapped: Order = {
        id: full.id_commande,
        clientName: full.client?.nom ? `${full.client.nom} ${full.client.prenom ?? ''}`.trim() : 'Client',
        clientPhone: full.client?.numero_tel ?? full.client?.email ?? 'N/A',
        items: (full.items || []).map((it: any) => ({ id: String(it.id || it.plat_id || Math.random()), name: it.nom ?? 'Plat', quantity: it.quantite ?? 1, price: it.prix ?? 0, image: it.image_url ?? '/placeholder.svg' })),
        total: full.montant_total ?? 0,
        status: full.statut ?? 'en cours',
        date: full.date_commande ? new Date(full.date_commande).toLocaleDateString('fr-FR') : '',
        time: full.date_commande ? new Date(full.date_commande).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '',
      };
      setSelectedOrder(mapped)
      setIsDetailDialogOpen(true)
    } catch (e) {
      console.error('[GestionCommandes] Exception handleViewDetails:', e)
      setSelectedOrder(order)
      setIsDetailDialogOpen(true)
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">Gestion des commandes</h1>
              <p className="text-gray-600">Suivez et gérez toutes les commandes en temps réel</p>
            </div>
            <div>
              <Button variant="outline" onClick={() => loadOrders()} className="bg-white">
                Rafraîchir
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <Card className="border-orange-200 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Commandes en cours</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {orders.filter((o) => o.status === "en cours").length}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-orange-200 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Commandes livrées</p>
                    <p className="text-2xl font-bold text-green-600">
                      {orders.filter((o) => o.status === "livrée").length}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-500">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-orange-200 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total commandes</p>
                    <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-yellow-500">
                    <ShoppingBag className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6 border-orange-200 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Rechercher par numéro ou nom de client..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="en cours">En cours</SelectItem>
                    <SelectItem value="livrée">Livrée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          {loadingOrders ? (
            <Card className="border-orange-200 p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4" />
              <p className="text-gray-600">Chargement des commandes…</p>
            </Card>
          ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card
                key={order.id}
                className="overflow-hidden border-orange-200 shadow-lg transition-all hover:shadow-xl"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-bold text-gray-900">{order.id}</h3>
                        <Badge
                          variant={order.status === "livrée" ? "secondary" : "default"}
                          className={
                            order.status === "livrée" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{order.clientName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{order.clientPhone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            {order.date} à {order.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          <span>{order.items.length} article(s)</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                      <div className="text-center lg:text-right">
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="text-2xl font-bold text-orange-600">{order.total} FCFA</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent"
                          onClick={() => handleViewDetails(order)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Détails
                        </Button>
                        {order.status === "en cours" && (
                          <Button
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                            onClick={() => handleStatusChange(order.id, "livrée")}
                          >
                            Marquer livrée
                          </Button>
                        )}
                        {order.status !== 'livrée' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-2 border-red-300 text-red-600 hover:bg-red-50"
                            onClick={async () => {
                              const ok = await CommandeGerantService.cancelOrder(order.id)
                              if (ok) {
                                setOrders((prev) => prev.filter((o) => o.id !== order.id))
                              }
                            }}
                          >
                            Annuler
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}

          {filteredOrders.length === 0 && (
            <Card className="border-orange-200 p-12 text-center">
              <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="text-gray-600">Aucune commande trouvée</p>
            </Card>
          )}
        </div>
      </main>

      {/* Order Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Détails de la commande</DialogTitle>
            <DialogDescription>Informations complètes de la commande</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6 py-4">
              {/* Order Info */}
              <div className="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 p-4 text-white">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-xl font-bold">{selectedOrder.id}</h3>
                  <Badge
                    variant="secondary"
                    className={
                      selectedOrder.status === "livrée"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }
                  >
                    {selectedOrder.status}
                  </Badge>
                </div>
                <p className="text-sm opacity-90">
                  {selectedOrder.date} à {selectedOrder.time}
                </p>
              </div>

              {/* Client Info */}
              <div>
                <h4 className="mb-3 font-semibold text-gray-900">Informations client</h4>
                <div className="space-y-2 rounded-lg border border-orange-200 bg-orange-50 p-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">{selectedOrder.clientName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">{selectedOrder.clientPhone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">Restaurant Universitaire - Campus Principal</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="mb-3 font-semibold text-gray-900">Articles commandés</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 rounded-lg border border-orange-200 bg-white p-3"
                    >
                      <div className="relative h-16 w-16 overflow-hidden rounded-lg">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          {item.price} FCFA × {item.quantity}
                        </p>
                      </div>
                      <p className="font-bold text-orange-600">{item.price * item.quantity} FCFA</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="rounded-lg border-2 border-orange-300 bg-orange-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-orange-600">{selectedOrder.total} FCFA</span>
                </div>
              </div>

              {/* Actions */}
              {selectedOrder.status === "en cours" && (
                <div className="space-y-2">
                  <Button
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    onClick={() => {
                      handleStatusChange(selectedOrder.id, "livrée")
                      setIsDetailDialogOpen(false)
                    }}
                  >
                    Marquer comme livrée
                  </Button>
                  <Button
                    className="w-full border-2 border-red-300 text-red-600 hover:bg-red-50"
                    onClick={async () => {
                      const ok = await CommandeGerantService.cancelOrder(selectedOrder.id)
                      if (ok) {
                        setOrders((prev) => prev.filter((o) => o.id !== selectedOrder.id))
                        setIsDetailDialogOpen(false)
                      }
                    }}
                  >
                    Annuler la commande
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
