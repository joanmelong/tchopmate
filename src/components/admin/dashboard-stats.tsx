"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, TrendingUp, Users, Utensils } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

interface DashboardStatsProps {
  restaurantId: string
}

export function DashboardStats({ restaurantId }: DashboardStatsProps) {
  const [stats, setStats] = useState({
    ordersToday: 0,
    revenueToday: 0,
    totalClients: 0,
    popularDishesCount: 0,
    ordersYesterday: 0,
    revenueYesterday: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId])

  const loadStats = async () => {
    try {
      setLoading(true)

      // Dates pour aujourd'hui et hier
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      // Commandes d'aujourd'hui
      const { data: ordersToday, error: ordersTodayError } = await supabase
        .from('commande')
        .select('id, montant_total, etudiant_id')
        .eq('restaurant_id', restaurantId)
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString())

      if (ordersTodayError) throw ordersTodayError

      // Commandes d'hier
      const { data: ordersYesterday, error: ordersYesterdayError } = await supabase
        .from('commande')
        .select('id, montant_total')
        .eq('restaurant_id', restaurantId)
        .gte('created_at', yesterday.toISOString())
        .lt('created_at', today.toISOString())

      if (ordersYesterdayError) throw ordersYesterdayError

      // Clients uniques
      const uniqueClients = new Set(ordersToday?.map(o => o.etudiant_id) || [])

      // Plats populaires (top 3 des 7 derniers jours)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data: popularDishes, error: popularError } = await supabase
        .from('ligne_commande')
        .select(`
          plat_id,
          quantite,
          commande!inner(
            restaurant_id,
            created_at
          )
        `)
        .eq('commande.restaurant_id', restaurantId)
        .gte('commande.created_at', sevenDaysAgo.toISOString())

      if (popularError) throw popularError

      // Compter les plats
      const dishCount: Record<string, number> = {}
      popularDishes?.forEach((ligne: any) => {
        dishCount[ligne.plat_id] = (dishCount[ligne.plat_id] || 0) + ligne.quantite
      })

      const topDishes = Object.entries(dishCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)

      // Calculer les totaux
      const revToday = ordersToday?.reduce((sum, o) => sum + (o.montant_total || 0), 0) || 0
      const revYesterday = ordersYesterday?.reduce((sum, o) => sum + (o.montant_total || 0), 0) || 0

      setStats({
        ordersToday: ordersToday?.length || 0,
        revenueToday: revToday,
        totalClients: uniqueClients.size,
        popularDishesCount: topDishes.length,
        ordersYesterday: ordersYesterday?.length || 0,
        revenueYesterday: revYesterday,
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateChange = (today: number, yesterday: number) => {
    if (yesterday === 0) return today > 0 ? '+100%' : '0%'
    const change = ((today - yesterday) / yesterday) * 100
    return `${change > 0 ? '+' : ''}${Math.round(change)}%`
  }

  const statsData = [
    {
      title: "Commandes du jour",
      value: loading ? "..." : stats.ordersToday.toString(),
      change: loading ? "..." : calculateChange(stats.ordersToday, stats.ordersYesterday),
      icon: ShoppingCart,
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Revenus",
      value: loading ? "..." : `${stats.revenueToday.toLocaleString()} FCFA`,
      change: loading ? "..." : calculateChange(stats.revenueToday, stats.revenueYesterday),
      icon: TrendingUp,
      color: "bg-yellow-100 text-yellow-700",
    },
    {
      title: "Clients",
      value: loading ? "..." : stats.totalClients.toString(),
      change: "Aujourd'hui",
      icon: Users,
      color: "bg-orange-50 text-orange-600",
    },
    {
      title: "Plats populaires",
      value: loading ? "..." : stats.popularDishesCount.toString(),
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
