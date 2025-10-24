"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Search } from "lucide-react"

interface MenuDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  menu?: any
  onSave?: (menuData: any) => void
}

// Mock dishes data
const AVAILABLE_DISHES = [
  { id: 1, name: "Ndolé aux crevettes", price: 2500, category: "Plats" },
  { id: 2, name: "Poulet DG", price: 3000, category: "Plats" },
  { id: 3, name: "Riz sauté aux légumes", price: 1800, category: "Plats" },
  { id: 4, name: "Jus de bissap", price: 500, category: "Boissons" },
  { id: 5, name: "Attiéké", price: 1500, category: "Plats" },
  { id: 6, name: "Brochettes", price: 2000, category: "Plats" },
  { id: 7, name: "Jus d'orange", price: 400, category: "Boissons" },
]

const CATEGORIES = ["Tous", "Plats", "Boissons", "Desserts"]

export function MenuDialog({ open, onOpenChange, menu, onSave }: MenuDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    dishIds: [],
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Tous")

  useEffect(() => {
    if (menu) {
      setFormData({
        name: menu.name || "",
        date: menu.date || "",
        dishIds: menu.dishIds || [],
      })
    } else {
      setFormData({
        name: "",
        date: "",
        dishIds: [],
      })
    }
    setSearchQuery("")
    setSelectedCategory("Tous")
  }, [menu, open])

  const handleSave = () => {
    if (!formData.name) {
      alert("Veuillez entrer un nom pour le menu")
      return
    }
    if (formData.dishIds.length === 0) {
      alert("Veuillez sélectionner au moins un plat")
      return
    }
    onSave?.(formData)
  }

  const toggleDish = (dishId) => {
    setFormData({
      ...formData,
      dishIds: formData.dishIds.includes(dishId)
        ? formData.dishIds.filter((id) => id !== dishId)
        : [...formData.dishIds, dishId],
    })
  }

  const filteredDishes = AVAILABLE_DISHES.filter((dish) => {
    const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "Tous" || dish.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{menu ? "Modifier le menu" : "Créer un menu"}</DialogTitle>
          <DialogDescription>
            {menu ? "Modifiez les détails du menu" : "Créez un nouveau menu en sélectionnant des plats"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nom du menu *</Label>
            <Input
              id="name"
              placeholder="Ex: Menu du lundi"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={menu?.isDefault}
            />
          </div>

          <div>
            <Label htmlFor="date">Date (optionnel)</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              disabled={menu?.isDefault}
            />
          </div>

          <div>
            <Label>Sélectionnez les plats *</Label>

            <div className="mt-2 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un plat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="mt-3 flex gap-2 flex-wrap">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="space-y-2 mt-3 p-3 border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
              {filteredDishes.length > 0 ? (
                filteredDishes.map((dish) => (
                  <div key={dish.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`dish-${dish.id}`}
                      checked={formData.dishIds.includes(dish.id)}
                      onCheckedChange={() => toggleDish(dish.id)}
                    />
                    <Label htmlFor={`dish-${dish.id}`} className="cursor-pointer flex-1">
                      <span className="font-medium">{dish.name}</span>
                      <span className="text-gray-600 ml-2">{dish.price} FCFA</span>
                    </Label>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">Aucun plat trouvé</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleSave}>
            {menu ? "Modifier" : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}