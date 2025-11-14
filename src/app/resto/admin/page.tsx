"use client"

import React, { useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UtensilsCrossed, ShoppingBag, TrendingUp, TrendingDown, Clock, DollarSign, Users } from "lucide-react"
import { AdminSidebar } from "@/components/ui/admin-sidebar"

export default function AdminDashboard() {
  // const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const stats = [
    {
      title: "Commandes du jour",
      value: "24",
      change: "+12%",
      trend: "up",
      icon: ShoppingBag,
      color: "from-orange-500 to-amber-500",
    },
    {
      title: "Revenus du jour",
      value: "48,500 FCFA",
      change: "+8%",
      trend: "up",
      icon: DollarSign,
      color: "from-amber-500 to-yellow-500",
    },
    {
      title: "Plats disponibles",
      value: "32",
      change: "-2",
      trend: "down",
      icon: UtensilsCrossed,
      color: "from-orange-400 to-amber-400",
    },
    {
      title: "Clients actifs",
      value: "156",
      change: "+23",
      trend: "up",
      icon: Users,
      color: "from-yellow-500 to-orange-500",
    },
  ]

  const recentOrders = [
    {
      id: "#CMD001",
      client: "Jean Dupont",
      items: 3,
      total: "4,500 FCFA",
      status: "en cours",
      time: "Il y a 5 min",
    },
    {
      id: "#CMD002",
      client: "Marie Kouam",
      items: 2,
      total: "3,200 FCFA",
      status: "en cours",
      time: "Il y a 12 min",
    },
    {
      id: "#CMD003",
      client: "Paul Nkeng",
      items: 4,
      total: "5,800 FCFA",
      status: "livrée",
      time: "Il y a 25 min",
    },
  ]

  const popularDishes = [
    { name: "Ndolé", orders: 45, revenue: "22,500 FCFA" },
    { name: "Poulet DG", orders: 38, revenue: "30,400 FCFA" },
    { name: "Riz sauté", orders: 32, revenue: "16,000 FCFA" },
  ]

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">Tableau de bord</h1>
            <p className="text-gray-600">Vue d&apos;ensemble de votre restaurant universitaire</p>
          </div>

          {/* Stats Grid */}
          <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card
                key={stat.title}
                className="overflow-hidden border-orange-200 shadow-lg transition-all hover:shadow-xl"
              >
                <CardHeader className={`bg-gradient-to-br ${stat.color} pb-2`}>
                  <div className="flex items-center justify-between">
                    <stat.icon className="h-8 w-8 text-white" />
                    <Badge
                      variant="secondary"
                      className={`${stat.trend === "up" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                    >
                      {stat.trend === "up" ? (
                        <TrendingUp className="mr-1 h-3 w-3" />
                      ) : (
                        <TrendingDown className="mr-1 h-3 w-3" />
                      )}
                      {stat.change}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Orders */}
            <Card className="border-orange-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500">
                <CardTitle className="flex items-center gap-2 text-white">
                  <ShoppingBag className="h-5 w-5" />
                  Commandes récentes
                </CardTitle>
                <CardDescription className="text-orange-100">Dernières commandes en temps réel</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-lg border border-orange-100 p-4 transition-all hover:bg-orange-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{order.id}</p>
                          <Badge
                            variant={order.status === "livrée" ? "secondary" : "default"}
                            className={
                              order.status === "livrée"
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                            }
                          >
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{order.client}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {order.time}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-orange-600">{order.total}</p>
                        <p className="text-sm text-gray-600">{order.items} articles</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/resto/admin/commandes">
                  <Button className="mt-4 w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
                    Voir toutes les commandes
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Popular Dishes */}
            <Card className="border-orange-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-amber-500 to-yellow-500">
                <CardTitle className="flex items-center gap-2 text-white">
                  <UtensilsCrossed className="h-5 w-5" />
                  Plats populaires
                </CardTitle>
                <CardDescription className="text-amber-100">Les plats les plus commandés aujourd&apos;hui</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {popularDishes.map((dish, index) => (
                    <div
                      key={dish.name}
                      className="flex items-center justify-between rounded-lg border border-orange-100 p-4 transition-all hover:bg-orange-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-lg font-bold text-white">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{dish.name}</p>
                          <p className="text-sm text-gray-600">{dish.orders} commandes</p>
                        </div>
                      </div>
                      <p className="font-bold text-orange-600">{dish.revenue}</p>
                    </div>
                  ))}
                </div>
                <Link href="/resto/admin/statistiques">
                  <Button className="mt-4 w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600">
                    Voir les statistiques complètes
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
