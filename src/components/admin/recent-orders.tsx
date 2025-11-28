"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

import { useEffect, useState } from 'react'
import { CommandeGerantService } from '@/services/CommandeGerant'

// We'll keep a simplified Order shape for the UI component
type RecentOrder = {
  id: string
  customer: string
  items: string
  total: string
  status: string
  time: string
}

const ordersDefault: RecentOrder[] = []

export function RecentOrders() {
  const [orders, setOrders] = useState<RecentOrder[]>(ordersDefault)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        console.log('[RecentOrders] Chargement des commandes récentes')
        const fetched = await CommandeGerantService.fetchOrders()
        if (!mounted) return
        // Transform to table shape for UI (first 3)
        const transformed = (fetched || []).slice(0, 3).map((o: any) => ({
          id: o.id_commande,
          customer: o.client?.nom ? `${o.client.nom} ${o.client.prenom ?? ''}` : 'Client',
          items: (o.items || []).map((it: any) => it.nom).join(', '),
          total: `${o.montant_total ?? 0} FCFA`,
          status: o.statut ?? 'en cours',
          time: o.date_commande ? new Date(o.date_commande).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '-',
        }))
        setOrders(transformed)
      } catch (e) {
        console.error('[RecentOrders] Erreur fetch recent orders', e)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

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
