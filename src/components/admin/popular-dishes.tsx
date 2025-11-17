"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabaseClient"
import { ChefHat } from "lucide-react"

interface PopularDishesProps {
  restaurantId: string
}

export function PopularDishes({ restaurantId }: PopularDishesProps) {
  const [dishes, setDishes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPopularDishes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId])

  const loadPopularDishes = async () => {
    try {
      setLoading(true)

      // Récupérer les commandes des 7 derniers jours
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data: lignesCommande, error } = await supabase
        .from('ligne_commande')
        .select(`
          plat_id,
          quantite,
          prix_unitaire,
          plat (
            nom,
            image_url
          ),
          commande!inner (
            restaurant_id,
            created_at
          )
        `)
        .eq('commande.restaurant_id', restaurantId)
        .gte('commande.created_at', sevenDaysAgo.toISOString())

      if (error) throw error

      // Grouper par plat
      const dishStats: Record<string, { name: string; orders: number; revenue: number; image: string }> = {}

      lignesCommande?.forEach((ligne: any) => {
        const platId = ligne.plat_id
        if (!dishStats[platId]) {
          dishStats[platId] = {
            name: ligne.plat?.nom || 'Plat inconnu',
            orders: 0,
            revenue: 0,
            image: ligne.plat?.image_url || '',
          }
        }
        dishStats[platId].orders += ligne.quantite
        dishStats[platId].revenue += ligne.quantite * ligne.prix_unitaire
      })

      // Trier par nombre de commandes et prendre le top 3
      const topDishes = Object.values(dishStats)
        .sort((a, b) => b.orders - a.orders)
        .slice(0, 3)

      setDishes(topDishes)
    } catch (error) {
      console.error('Error loading popular dishes:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-white border-orange-100">
      <CardHeader className="border-b border-orange-100">
        <CardTitle className="text-lg text-gray-900">Plats populaires</CardTitle>
        <p className="text-sm text-gray-500">Top 3 des 7 derniers jours</p>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : dishes.length > 0 ? (
          dishes.map((dish, index) => (
            <div
              key={index}
              className="flex items-center justify-between pb-3 border-b border-orange-50 last:border-0 last:pb-0"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-orange-100 flex items-center justify-center">
                  {dish.image ? (
                    <img 
                      src={dish.image} 
                      alt={dish.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.parentElement!.innerHTML = '<div class="flex items-center justify-center w-full h-full"><svg class="h-6 w-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg></div>'
                      }}
                    />
                  ) : (
                    <ChefHat className="h-6 w-6 text-orange-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate">{dish.name}</p>
                  <p className="text-sm text-gray-500">{dish.orders} commandes</p>
                </div>
              </div>
              <Badge className="bg-orange-100 text-orange-700 whitespace-nowrap ml-2 flex-shrink-0">
                {dish.revenue.toLocaleString()} FCFA
              </Badge>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <ChefHat className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>Aucune donnée disponible</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
