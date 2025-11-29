"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"
import Image from "next/image"

interface MenuViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  menu: { id: string; nom: string; description?: string; prix: number; image_url?: string; disponible: boolean }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AVAILABLE_DISHES = [
  {
    id: 1,
    name: "Ndolé aux crevettes",
    description: "Plat traditionnel camerounais avec des légumes verts et crevettes",
    price: 2500,
    waitTime: 25,
    type: "spicy",
    image: "/ndole-aux-crevettes.jpg",
    rating: 4.8,
  },
  {
    id: 2,
    name: "Poulet DG",
    description: "Poulet sauté aux légumes et plantains, spécialité locale",
    price: 3000,
    waitTime: 30,
    type: "spicy",
    image: "/poulet-dg.jpg",
    rating: 4.9,
  },
  {
    id: 3,
    name: "Riz sauté aux légumes",
    description: "Riz parfumé sauté avec des légumes frais de saison",
    price: 1800,
    waitTime: 20,
    type: "vegetarian",
    image: "/riz-saute-legumes.jpg",
    rating: 4.5,
  },
  {
    id: 4,
    name: "Jus de bissap",
    description: "Boisson rafraîchissante à base d'hibiscus",
    price: 500,
    waitTime: 5,
    type: "none",
    image: "/jus-bissap.jpg",
    rating: 4.6,
  },
]

export function MenuViewDialog({ open, onOpenChange, menu }: MenuViewDialogProps) {
  const menuDishes: typeof AVAILABLE_DISHES = []

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      spicy: "Épicé",
      vegetarian: "Végé",
      none: "Boisson",
    }
    return labels[type] || type
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      spicy: "bg-red-100 text-red-700",
      vegetarian: "bg-green-100 text-green-700",
      none: "bg-blue-100 text-blue-700",
    }
    return colors[type] || "bg-gray-100 text-gray-700"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{menu?.nom}</DialogTitle>
          <DialogDescription>
            Menu par défaut
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {menuDishes.map((dish) => (
            <div
              key={dish.id}
              className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
            >
              {/* Image container */}
              <div className="relative h-48 bg-gray-200 overflow-hidden">
                <Image
                  src={dish.image || "/placeholder.svg"}
                  alt={dish.name}
                  fill
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    e.currentTarget.src = "/diverse-food-spread.png"
                  }}
                />
                {/* Type badge */}
                <div className="absolute top-3 left-3">
                  <Badge className={`${getTypeColor(dish.type)} font-semibold`}>{getTypeLabel(dish.type)}</Badge>
                </div>
                {/* Rating badge */}
                <div className="absolute top-3 right-3 bg-white rounded-full px-2 py-1 flex items-center gap-1 shadow-md">
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm font-semibold text-gray-800">{dish.rating}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{dish.name}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{dish.description}</p>
                </div>

                {/* Price and wait time */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-lg font-bold text-orange-600">{dish.price} FCFA</span>
                  <div className="flex items-center gap-1 text-gray-600 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>{dish.waitTime} min</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {menuDishes.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">Aucun plat dans ce menu</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
