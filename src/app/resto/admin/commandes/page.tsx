"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Eye,
  Clock,
  User,
  Phone,
  MapPin,
  ShoppingBag,
  Package,
} from "lucide-react"
import { AdminSidebar } from "@/components/ui/admin-sidebar"

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
  status: "en cours" | "livrée"
  date: string
  time: string
}

export default function GestionCommandes() {
  // const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  const [orders, setOrders] = useState<Order[]>([
    {
      id: "#CMD001",
      clientName: "Jean Dupont",
      clientPhone: "+237 6 XX XX XX XX",
      items: [
        {
          id: "1",
          name: "Ndolé",
          quantity: 2,
          price: 1500,
          image: "/ndole.jpg",
        },
        {
          id: "2",
          name: "Jus de bissap",
          quantity: 1,
          price: 500,
          image: "/jus.jpg",
        },
      ],
      total: 3500,
      status: "en cours",
      date: "15 Jan 2025",
      time: "12:30",
    },
    {
      id: "#CMD002",
      clientName: "Marie Kouam",
      clientPhone: "+237 6 YY YY YY YY",
      items: [
        {
          id: "3",
          name: "Poulet DG",
          quantity: 1,
          price: 2000,
          image: "/poulet.jpg",
        },
        {
          id: "4",
          name: "Plantain frit",
          quantity: 1,
          price: 500,
          image: "/plantain.jpg",
        },
      ],
      total: 2500,
      status: "en cours",
      date: "15 Jan 2025",
      time: "12:45",
    },
    {
      id: "#CMD003",
      clientName: "Paul Nkeng",
      clientPhone: "+237 6 ZZ ZZ ZZ ZZ",
      items: [
        {
          id: "5",
          name: "Riz sauté",
          quantity: 3,
          price: 1200,
          image: "/riz.jpg",
        },
      ],
      total: 3600,
      status: "livrée",
      date: "15 Jan 2025",
      time: "11:20",
    },
  ])



  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.clientName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const handleStatusChange = (orderId: string, newStatus: "en cours" | "livrée") => {
    setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
  }

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailDialogOpen(true)
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">Gestion des commandes</h1>
            <p className="text-gray-600">Suivez et gérez toutes les commandes en temps réel</p>
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
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

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
                <Button
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  onClick={() => {
                    handleStatusChange(selectedOrder.id, "livrée")
                    setIsDetailDialogOpen(false)
                  }}
                >
                  Marquer comme livrée
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
