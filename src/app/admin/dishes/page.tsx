"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit2, Trash2 } from "lucide-react"
import { DishDialog } from "@/components/admin/dish-dialog"

export default function DishesPage() {
  const [showDialog, setShowDialog] = useState(false)
  const [selectedDish, setSelectedDish] = useState(null)

  const [dishes, setDishes] = useState([
    {
      id: 1,
      name: "Ndolé aux crevettes",
      description: "Plat traditionnel camerounais avec crevettes et crevettes",
      price: 2500,
      waitTime: 25,
      type: "spicy",
      image: "/ndole-aux-crevettes.jpg",
      available: true,
    },
    {
      id: 2,
      name: "Poulet DG",
      description: "Poulet sauté aux légumes et plantains, spécialité locale",
      price: 3000,
      waitTime: 30,
      type: "spicy",
      image: "/poulet-dg.jpg",
      available: true,
    },
    {
      id: 3,
      name: "Riz sauté aux légumes",
      description: "Riz parfumé sauté avec des légumes frais de saison",
      price: 1800,
      waitTime: 20,
      type: "vegetarian",
      image: "/riz-saute-legumes.jpg",
      available: true,
    },
    {
      id: 4,
      name: "Jus de bissap",
      description: "Boisson fraîchissante à base d'hibiscus",
      price: 500,
      waitTime: 5,
      type: "none",
      image: "/jus-bissap.jpg",
      available: true,
    },
  ])

  const getTypeLabel = (type) => {
    const labels = {
      spicy: "Épicé",
      vegetarian: "Végé",
      none: "Boisson",
    }
    return labels[type] || type
  }

  const getTypeColor = (type) => {
    const colors = {
      spicy: "bg-red-100 text-red-700",
      vegetarian: "bg-green-100 text-green-700",
      none: "bg-blue-100 text-blue-700",
    }
    return colors[type] || "bg-gray-100 text-gray-700"
  }

  const handleAddDish = (dishData) => {
    if (selectedDish) {
      setDishes(dishes.map((d) => (d.id === selectedDish.id ? { ...d, ...dishData } : d)))
    } else {
      setDishes([...dishes, { ...dishData, id: Math.max(...dishes.map((d) => d.id), 0) + 1 }])
    }
    setShowDialog(false)
    setSelectedDish(null)
  }

  const handleDeleteDish = (id) => {
    setDishes(dishes.filter((d) => d.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des plats</h1>
          <p className="text-gray-600 mt-1">Gérez tous vos plats disponibles</p>
        </div>
        <Button
          className="bg-orange-500 hover:bg-orange-600 text-white"
          onClick={() => {
            setSelectedDish(null)
            setShowDialog(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un plat
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dishes.map((dish) => (
          <Card key={dish.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48 bg-gray-200 overflow-hidden">
              <img src={dish.image || "/placeholder.svg"} alt={dish.name} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3">
                <Badge className={getTypeColor(dish.type)}>{getTypeLabel(dish.type)}</Badge>
              </div>
              <div className="absolute top-3 right-3">
                <Badge className={dish.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                  {dish.available ? "Disponible" : "Indisponible"}
                </Badge>
              </div>
            </div>

            <CardContent className="pt-4">
              <h3 className="font-bold text-lg text-gray-900 mb-1">{dish.name}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{dish.description}</p>

              <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-bold text-orange-600">{dish.price} FCFA</span>
                <span className="text-sm text-gray-600 flex items-center">⏱ {dish.waitTime} min</span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => {
                    setSelectedDish(dish)
                    setShowDialog(true)
                  }}
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Modifier
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-red-600 hover:text-red-700 bg-transparent"
                  onClick={() => handleDeleteDish(dish.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <DishDialog open={showDialog} onOpenChange={setShowDialog} dish={selectedDish} onSave={handleAddDish} />
    </div>
  )
}
