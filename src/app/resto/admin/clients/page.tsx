"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  UtensilsCrossed,
  Search,
  Eye,
  Phone,
  Mail,
  ShoppingBag,
  LayoutDashboard,
  Users,
  BarChart3,
  Calendar,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AdminSidebar } from "@/components/ui/admin-sidebar"
interface ClientOrder {
  id: string
  date: string
  total: number
  status: "en cours" | "livrée"
}

interface Client {
  id: string
  name: string
  email: string
  phone: string
  totalOrders: number
  totalSpent: number
  lastOrder: string
  orders: ClientOrder[]
}

export default function GestionClients() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  const clients: Client[] = [
    {
      id: "1",
      name: "Jean Dupont",
      email: "jean.dupont@univ.cm",
      phone: "+237 6 XX XX XX XX",
      totalOrders: 12,
      totalSpent: 45000,
      lastOrder: "15 Jan 2025",
      orders: [
        { id: "#CMD001", date: "15 Jan 2025", total: 3500, status: "en cours" },
        { id: "#CMD015", date: "14 Jan 2025", total: 4200, status: "livrée" },
        { id: "#CMD008", date: "13 Jan 2025", total: 2800, status: "livrée" },
      ],
    },
    {
      id: "2",
      name: "Marie Kouam",
      email: "marie.kouam@univ.cm",
      phone: "+237 6 YY YY YY YY",
      totalOrders: 8,
      totalSpent: 28000,
      lastOrder: "15 Jan 2025",
      orders: [
        { id: "#CMD002", date: "15 Jan 2025", total: 2500, status: "en cours" },
        { id: "#CMD012", date: "12 Jan 2025", total: 3800, status: "livrée" },
      ],
    },
    {
      id: "3",
      name: "Paul Nkeng",
      email: "paul.nkeng@univ.cm",
      phone: "+237 6 ZZ ZZ ZZ ZZ",
      totalOrders: 15,
      totalSpent: 62000,
      lastOrder: "15 Jan 2025",
      orders: [
        { id: "#CMD003", date: "15 Jan 2025", total: 3600, status: "livrée" },
        { id: "#CMD018", date: "14 Jan 2025", total: 5200, status: "livrée" },
      ],
    },
    {
      id: "4",
      name: "Sophie Mbarga",
      email: "sophie.mbarga@univ.cm",
      phone: "+237 6 AA AA AA AA",
      totalOrders: 6,
      totalSpent: 18500,
      lastOrder: "14 Jan 2025",
      orders: [{ id: "#CMD020", date: "14 Jan 2025", total: 2900, status: "livrée" }],
    },
  ]

  const navigationLinks = [
    { href: "/resto/admin", label: "Tableau de bord", icon: LayoutDashboard },
    { href: "/resto/admin/plats", label: "Gestion des plats", icon: UtensilsCrossed },
    { href: "/resto/admin/commandes", label: "Gestion des commandes", icon: ShoppingBag },
    { href: "/resto/admin/clients", label: "Gestion des clients", icon: Users },
    { href: "/resto/admin/statistiques", label: "Statistiques", icon: BarChart3 },
  ]

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery),
  )

  const handleViewDetails = (client: Client) => {
    setSelectedClient(client)
    setIsDetailDialogOpen(true)
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">Gestion des clients</h1>
            <p className="text-gray-600">Liste de tous vos clients et leur historique</p>
          </div>

          {/* Stats */}
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <Card className="border-orange-200 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total clients</p>
                    <p className="text-2xl font-bold text-orange-600">{clients.length}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-orange-200 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Commandes totales</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {clients.reduce((sum, c) => sum + c.totalOrders, 0)}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-yellow-500">
                    <ShoppingBag className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-orange-200 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Revenus totaux</p>
                    <p className="text-2xl font-bold text-green-600">
                      {clients.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()} FCFA
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-500">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card className="mb-6 border-orange-200 shadow-lg">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Rechercher par nom, email ou téléphone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Clients Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredClients.map((client) => (
              <Card
                key={client.id}
                className="overflow-hidden border-orange-200 shadow-lg transition-all hover:shadow-xl"
              >
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-white">
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback className="bg-white text-orange-600">
                        {client.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-white">
                      <h3 className="font-bold">{client.name}</h3>
                      <p className="text-sm opacity-90">Client #{client.id}</p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="mb-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{client.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Dernière commande: {client.lastOrder}</span>
                    </div>
                  </div>
                  <div className="mb-4 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-orange-50 p-3 text-center">
                      <p className="text-xs text-gray-600">Commandes</p>
                      <p className="text-lg font-bold text-orange-600">{client.totalOrders}</p>
                    </div>
                    <div className="rounded-lg bg-amber-50 p-3 text-center">
                      <p className="text-xs text-gray-600">Dépenses</p>
                      <p className="text-lg font-bold text-amber-600">{(client.totalSpent / 1000).toFixed(0)}k</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full bg-transparent" onClick={() => handleViewDetails(client)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Voir détails
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredClients.length === 0 && (
            <Card className="border-orange-200 p-12 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="text-gray-600">Aucun client trouvé</p>
            </Card>
          )}
        </div>
      </main>

      {/* Client Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Détails du client</DialogTitle>
            <DialogDescription>Informations complètes et historique des commandes</DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-6 py-4">
              {/* Client Info */}
              <div className="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white">
                <div className="mb-4 flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-white">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback className="bg-white text-2xl text-orange-600">
                      {selectedClient.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-2xl font-bold">{selectedClient.name}</h3>
                    <p className="opacity-90">Client #{selectedClient.id}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm opacity-75">Total commandes</p>
                    <p className="text-2xl font-bold">{selectedClient.totalOrders}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-75">Total dépensé</p>
                    <p className="text-2xl font-bold">{selectedClient.totalSpent.toLocaleString()} FCFA</p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="mb-3 font-semibold text-gray-900">Informations de contact</h4>
                <div className="space-y-2 rounded-lg border border-orange-200 bg-orange-50 p-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">{selectedClient.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">{selectedClient.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">Dernière commande: {selectedClient.lastOrder}</span>
                  </div>
                </div>
              </div>

              {/* Order History */}
              <div>
                <h4 className="mb-3 font-semibold text-gray-900">Historique des commandes</h4>
                <div className="space-y-3">
                  {selectedClient.orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-lg border border-orange-200 bg-white p-4"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{order.id}</p>
                        <p className="text-sm text-gray-600">{order.date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={order.status === "livrée" ? "secondary" : "default"}
                          className={
                            order.status === "livrée" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                          }
                        >
                          {order.status}
                        </Badge>
                        <p className="font-bold text-orange-600">{order.total} FCFA</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
