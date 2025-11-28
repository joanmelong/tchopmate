"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, TrendingUp, Users, Utensils } from "lucide-react"
import { useDashboardStats } from "@/hooks/use-dashboard-stats"
import { User } from "@/core/entities/User"

interface DashboardStatsProps {
  user: User | null;
  restaurantId: string;
}

export function DashboardStats({ user, restaurantId }: DashboardStatsProps) {
  const { stats, isLoading, error } = useDashboardStats(user, restaurantId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow border-orange-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
              <div className="p-2 rounded-lg bg-gray-200 animate-pulse">
                <div className="h-4 w-4"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="col-span-full border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600 text-center">
              {error || "Erreur lors du chargement des statistiques"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statsData = [
    {
      title: "Commandes du jour",
      value: stats.todayOrders.toString(),
      change: stats.todayOrdersChange,
      icon: ShoppingCart,
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Revenus",
      value: `${stats.todayRevenue.toLocaleString()} FCFA`,
      change: stats.revenueChange,
      icon: TrendingUp,
      color: "bg-yellow-100 text-yellow-700",
    },
    {
      title: "Clients",
      value: stats.totalCustomers.toString(),
      change: stats.customersChange,
      icon: Users,
      color: "bg-orange-50 text-orange-600",
    },
    {
      title: "Plats populaires",
      value: stats.popularDishesCount.toString(),
      change: "Top 3",
      icon: Utensils,
      color: "bg-yellow-50 text-yellow-700",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat, index) => {
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
