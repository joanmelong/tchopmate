"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, CheckCircle, AlertCircle, Loader2, RefreshCw } from "lucide-react"
import { OrderDetailDialog } from "@/components/admin/order-detail-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabaseClient"
import { useParams } from "next/navigation"

type OrderItem = {
  name: string
  qty: number
  price: string
}

type Order = {
  id: string
  customer: string
  items: OrderItem[]
  total: string
  status: string
  time: string
  address?: string
}

export default function OrdersPage() {
  const params = useParams()
  const restaurantId = params.id as string
  
  const [showDetail, setShowDetail] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | undefined>(undefined)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadOrders()
  }, [restaurantId])

  const loadOrders = async () => {
    try {
      setLoading(true)
      
      // Utiliser l'API qui contourne RLS
      const response = await fetch(`/api/resto/${restaurantId}/orders`)
      const data = await response.json()

      if (!response.ok) {
        console.error("Erreur API:", data.error)
        return
      }

      console.log("Données de l'API:", data)
      console.log("Debug info:", data.debug)

      const commandes = data.commandes || []

      // Transformer les données
      const transformedOrders: Order[] = commandes.map((cmd: { id_commande: number; statut: string; created_at: string; montant_total: number; client?: { prenom?: string; nom?: string }; items?: Array<{ name: string; qty: number; price: number }> }) => {
        let customerName = "Client inconnu"
        
        if (cmd.client?.prenom && cmd.client?.nom) {
          customerName = `${cmd.client.prenom} ${cmd.client.nom}`
        } else if (cmd.client?.prenom) {
          customerName = cmd.client.prenom
        } else if (cmd.client?.nom) {
          customerName = cmd.client.nom
        } else if (cmd.client?.id) {
          customerName = `Client #${cmd.client.id}`
        }
        
        console.log("Client pour commande:", cmd.id_commande, customerName, cmd.client)
        
        const items: OrderItem[] = cmd.items?.length > 0 
          ? cmd.items.map((item: { name: string; qty: number; price: number }) => ({
              name: item.name,
              qty: item.qty,
              price: `${item.price} FCFA`,
            }))
          : [{
              name: "⚠️ Aucun plat",
              qty: 1,
              price: "0 FCFA"
            }]

        const time = cmd.date_commande 
          ? new Date(cmd.date_commande).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
          : new Date(cmd.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

        return {
          id: cmd.id_commande,
          customer: customerName,
          items,
          total: `${cmd.montant_total || 0} FCFA`,
          status: cmd.statut?.toLowerCase() || "en_attente",
          time,
          address: cmd.client?.numero_tel || "",
        }
      })

      console.log("Commandes transformées:", transformedOrders)
      setOrders(transformedOrders)
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const refreshOrders = async () => {
    setRefreshing(true)
    await loadOrders()
    setRefreshing(false)
  }

  const pendingOrders = orders.filter((o) => o.status === "en_attente" || o.status === "aucun")
  const readyOrders = orders.filter((o) => o.status === "en_preparation" || o.status === "en préparation")
  const deliveredOrders = orders.filter((o) => o.status === "livree" || o.status === "livrée")

  const markAsDelivered = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from("commande")
        .update({ statut: "LIVREE" })
        .eq("id_commande", orderId)

      if (error) throw error

      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: "livree" } : o)))
      await loadOrders() // Recharger pour avoir les données à jour
    } catch (error) {
      console.error("Erreur mise à jour statut:", error)
    }
  }

  const markAsReady = async (orderId: string) => {
    try {
      // Essayer EN_PREPARATION qui semble être une valeur valide
      const { error } = await supabase
        .from("commande")
        .update({ statut: "EN_PREPARATION" })
        .eq("id_commande", orderId)

      if (error) {
        console.error("Erreur mise à jour statut:", error)
        throw error
      }

      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: "en_preparation" } : o)))
      await loadOrders() // Recharger pour avoir les données à jour
    } catch (error) {
      console.error("Erreur mise à jour statut:", error)
    }
  }

  const OrderRow = ({ order }: { order: { id: string; customer: string; items: Array<{ name: string; qty: number; price: string }>; total: string; status: string; time: string } }) => (
    <div className="border border-orange-100 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-semibold text-gray-900">{order.id}</p>
          <p className="text-sm text-gray-600">{order.customer}</p>
        </div>
        <Badge
          className={
            order.status === "livrée" || order.status === "livree"
              ? "bg-green-100 text-green-700"
              : order.status === "en_preparation" || order.status === "en préparation"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700"
          }
        >
          {order.status === "livrée" || order.status === "livree" ? (
            <>
              <CheckCircle className="h-3 w-3 mr-1" />
              Livrée
            </>
          ) : order.status === "en_preparation" || order.status === "en préparation" ? (
            <>
              <CheckCircle className="h-3 w-3 mr-1" />
              Prêt
            </>
          ) : (
            <>
              <AlertCircle className="h-3 w-3 mr-1" />
              En attente
            </>
          )}
        </Badge>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-lg font-bold text-orange-600">{order.total}</p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="bg-orange-500 hover:bg-orange-600 text-white"
            onClick={() => {
              setSelectedOrder(order)
              setShowDetail(true)
            }}
          >
            <Eye className="h-4 w-4 mr-1" />
            Détails
          </Button>
          {(order.status === "en_attente" || order.status === "aucun") && (
            <Button
              size="sm"
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50 bg-transparent"
              onClick={() => markAsReady(order.id)}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Marquer prêt
            </Button>
          )}
          {(order.status === "en_preparation" || order.status === "en préparation") && (
            <Button
              size="sm"
              variant="outline"
              className="border-green-500 text-green-600 hover:bg-green-50 bg-transparent"
              onClick={() => markAsDelivered(order.id)}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Livrée
            </Button>
          )}
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des commandes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des commandes</h1>
          <p className="text-gray-600 mt-1">Gérez les commandes en temps réel</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshOrders}
          disabled={refreshing}
          className="border-orange-500 text-orange-600 hover:bg-orange-50"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Actualiser
        </Button>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-orange-50">
          <TabsTrigger value="pending" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            En attente ({pendingOrders.length})
          </TabsTrigger>
          <TabsTrigger value="ready" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            Prêtes ({readyOrders.length})
          </TabsTrigger>
          <TabsTrigger value="delivered" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            Livrées ({deliveredOrders.length})
          </TabsTrigger>
        </TabsList>

        {/* En attente */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Commandes en attente</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucune commande en attente</p>
              ) : (
                <div className="space-y-4">
                  {pendingOrders.map((order) => (
                    <OrderRow key={order.id} order={order} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prêtes */}
        <TabsContent value="ready">
          <Card>
            <CardHeader>
              <CardTitle>Commandes prêtes</CardTitle>
            </CardHeader>
            <CardContent>
              {readyOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucune commande prête</p>
              ) : (
                <div className="space-y-4">
                  {readyOrders.map((order) => (
                    <OrderRow key={order.id} order={order} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Livrées */}
        <TabsContent value="delivered">
          <Card>
            <CardHeader>
              <CardTitle>Commandes livrées</CardTitle>
            </CardHeader>
            <CardContent>
              {deliveredOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucune commande livrée</p>
              ) : (
                <div className="space-y-4">
                  {deliveredOrders.map((order) => (
                    <OrderRow key={order.id} order={order} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <OrderDetailDialog
        open={showDetail}
        onOpenChange={setShowDetail}
        order={selectedOrder}
        onMarkAsInProgress={markAsReady}
        onMarkAsDelivered={markAsDelivered}
      />
    </div>
  )
}
