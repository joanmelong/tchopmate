"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { OrderDetailDialog } from "@/components/admin/order-detail-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function OrdersPage() {
  const [showDetail, setShowDetail] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [orders, setOrders] = useState([
    {
      id: "#CMD001",
      customer: "Jean Dupont",
      items: [
        { name: "Poulet DG", qty: 1, price: "3,000 FCFA" },
        { name: "Jus d'orange", qty: 1, price: "600 FCFA" },
      ],
      total: "3,600 FCFA",
      status: "livrée",
      time: "14:30",
      address: "Université Saint Jean, Bloc A",
    },
    {
      id: "#CMD002",
      customer: "Marie Nkomo",
      items: [
        { name: "Ndolé aux crevettes", qty: 2, price: "2,500 FCFA" },
        { name: "Eau minérale", qty: 2, price: "300 FCFA" },
      ],
      total: "5,600 FCFA",
      status: "en cours",
      time: "14:45",
      address: "Université Saint Jean, Bloc B",
    },
    {
      id: "#CMD003",
      customer: "Pierre Kamga",
      items: [{ name: "Riz sauté aux légumes", qty: 1, price: "1,800 FCFA" }],
      total: "1,800 FCFA",
      status: "aucun",
      time: "15:00",
      address: "Université Saint Jean, Bloc C",
    },
  ])

  const pendingOrders = orders.filter((o) => o.status === "aucun")
  const inProgressOrders = orders.filter((o) => o.status === "en cours")
  const deliveredOrders = orders.filter((o) => o.status === "livrée")

  const markAsDelivered = (orderId: string) => {
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: "livrée" } : o)))
  }

  const markAsInProgress = (orderId: string) => {
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: "en cours" } : o)))
  }

  const OrderRow = ({ order }: { order: any }) => (
    <div className="border border-orange-100 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-semibold text-gray-900">{order.id}</p>
          <p className="text-sm text-gray-600">{order.customer}</p>
        </div>
        <Badge
          className={
            order.status === "livrée"
              ? "bg-green-100 text-green-700"
              : order.status === "en cours"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-100 text-gray-700"
          }
        >
          {order.status === "livrée" ? (
            <>
              <CheckCircle className="h-3 w-3 mr-1" />
              Livrée
            </>
          ) : order.status === "en cours" ? (
            <>
              <Clock className="h-3 w-3 mr-1" />
              En cours
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
          {order.status === "en cours" && (
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestion des commandes</h1>
        <p className="text-gray-600 mt-1">Gérez les commandes en temps réel</p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-orange-50">
          <TabsTrigger value="pending" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            En attente ({pendingOrders.length})
          </TabsTrigger>
          <TabsTrigger value="progress" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            En cours ({inProgressOrders.length})
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

        {/* En cours */}
        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>Commandes en cours</CardTitle>
            </CardHeader>
            <CardContent>
              {inProgressOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucune commande en cours</p>
              ) : (
                <div className="space-y-4">
                  {inProgressOrders.map((order) => (
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
        onMarkAsInProgress={markAsInProgress}
        onMarkAsDelivered={markAsDelivered}
      />
    </div>
  )
}
