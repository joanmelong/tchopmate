"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { useAnalyticsData } from "@/hooks/use-analytics-data"
import { User } from "@/core/entities/User"

interface PopularDishesProps {
  user: User | null;
  restaurantId: string;
}

export function PopularDishes({ user, restaurantId }: PopularDishesProps) {
  const { data, isLoading, error } = useAnalyticsData(user, restaurantId, 7);
  if (isLoading) {
    return (
      <Card className="bg-white border-orange-100">
        <CardHeader className="border-b border-orange-100">
          <CardTitle className="text-lg text-gray-900">Plats populaires</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-center justify-between pb-3 border-b border-orange-50 last:border-0 last:pb-0">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse flex-shrink-0"></div>
                <div className="min-w-0 flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-1 w-24"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>
              </div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="bg-white border-orange-100">
        <CardHeader className="border-b border-orange-100">
          <CardTitle className="text-lg text-gray-900">Plats populaires</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-red-600 text-center">
            {error || "Erreur lors du chargement des plats populaires"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const dishes = data.popularDishes.slice(0, 3); // Top 3

  return (
    <Card className="bg-white border-orange-100">
      <CardHeader className="border-b border-orange-100">
        <CardTitle className="text-lg text-gray-900">Plats populaires</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {dishes.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Aucun plat populaire pour le moment</p>
        ) : (
          dishes.map((dish, index) => (
            <div
              key={index}
              className="flex items-center justify-between pb-3 border-b border-orange-50 last:border-0 last:pb-0"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-orange-100">
                  <Image 
                    src={dish.image || "/placeholder.svg"} 
                    alt={dish.name} 
                    className="w-full h-full object-cover" 
                    width={48} 
                    height={48} 
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate">{dish.name}</p>
                  <p className="text-sm text-gray-500">{dish.orders} commandes</p>
                </div>
              </div>
              <Badge className="bg-orange-100 text-orange-700 whitespace-nowrap ml-2 flex-shrink-0 truncate max-w-xs">
                {dish.revenue.toLocaleString()} FCFA
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
