"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, TrendingUp, Users, Utensils } from "lucide-react"

export function DashboardStats() {
  const stats = [
    {
      title: "Commandes du jour",
      value: "24",
      change: "+12%",
      icon: ShoppingCart,
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Revenus",
      value: "156,000 FCFA",
      change: "+8%",
      icon: TrendingUp,
      color: "bg-yellow-100 text-yellow-700",
    },
    {
      title: "Clients",
      value: "342",
      change: "+5%",
      icon: Users,
      color: "bg-orange-50 text-orange-600",
    },
    {
      title: "Plats populaires",
      value: "12",
      change: "Top 3",
      icon: Utensils,
      color: "bg-yellow-50 text-yellow-700",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className="hover:shadow-md transition-shadow border-orange-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-orange-600 mt-1">{stat.change} depuis hier</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
