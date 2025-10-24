"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

const orders = [
  {
    id: "#CMD001",
    customer: "Jean Dupont",
    items: "Poulet DG, Jus d'orange",
    total: "3,600 FCFA",
    status: "Livrée",
    time: "14:30",
  },
  {
    id: "#CMD002",
    customer: "Marie Nkomo",
    items: "Ndolé, Eau minérale",
    total: "2,800 FCFA",
    status: "En cours",
    time: "14:45",
  },
  {
    id: "#CMD003",
    customer: "Pierre Kamga",
    items: "Riz sauté, Bissap",
    total: "2,300 FCFA",
    status: "En cours",
    time: "15:00",
  },
]

export function RecentOrders() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Livrée":
        return "bg-green-100 text-green-700"
      case "En cours":
        return "bg-yellow-100 text-yellow-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Commandes récentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Commande</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Client</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Articles</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Statut</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Heure</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{order.id}</td>
                  <td className="py-3 px-4 text-gray-700">{order.customer}</td>
                  <td className="py-3 px-4 text-gray-600 text-xs">{order.items}</td>
                  <td className="py-3 px-4 font-semibold text-orange-600">{order.total}</td>
                  <td className="py-3 px-4">
                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{order.time}</td>
                  <td className="py-3 px-4">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 text-gray-600" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
