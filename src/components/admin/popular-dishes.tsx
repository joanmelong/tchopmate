"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const dishes = [
  {
    name: "Poulet DG",
    orders: 45,
    revenue: "135,000 FCFA",
    image: "/poulet-dg.jpg",
  },
  {
    name: "Ndolé aux crevettes",
    orders: 38,
    revenue: "95,000 FCFA",
    image: "/ndole-aux-crevettes.jpg",
  },
  {
    name: "Riz sauté",
    orders: 32,
    revenue: "57,600 FCFA",
    image: "/riz-saute-legumes.jpg",
  },
]

export function PopularDishes() {
  return (
    <Card className="bg-white border-orange-100">
      <CardHeader className="border-b border-orange-100">
        <CardTitle className="text-lg text-gray-900">Plats populaires</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {dishes.map((dish, index) => (
          <div
            key={index}
            className="flex items-center justify-between pb-3 border-b border-orange-50 last:border-0 last:pb-0"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-orange-100">
                <img src={dish.image || "/placeholder.svg"} alt={dish.name} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 truncate">{dish.name}</p>
                <p className="text-sm text-gray-500">{dish.orders} commandes</p>
              </div>
            </div>
            <Badge className="bg-orange-100 text-orange-700 whitespace-nowrap ml-2 flex-shrink-0 truncate max-w-xs">
              {dish.revenue}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
