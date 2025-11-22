"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { AdminSidebar } from "@/components/ui/admin-sidebar"
import {
  UtensilsCrossed,
  Plus,
  Edit,
  Trash2,
  Search,
  LayoutDashboard,
  ShoppingBag,
  Users,
  BarChart3,
} from "lucide-react"

interface Dish {
  id: string
  name: string
  category: string
  price: number
  description: string
  image: string
  available: boolean
  preparationTime: string
  isVegetarian: boolean
  isSpicy: boolean
}

export default function GestionPlats() {
  // const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null)

  const [dishes, setDishes] = useState<Dish[]>([
    {
      id: "1",
      name: "Ndolé",
      category: "Plats",
      price: 1500,
      description: "Plat traditionnel camerounais aux feuilles de ndolé",
      image: "/ndole.jpg",
      available: true,
      preparationTime: "25 min",
      isVegetarian: false,
      isSpicy: true,
    },
    {
      id: "2",
      name: "Poulet DG",
      category: "Plats",
      price: 2000,
      description: "Poulet Directeur Général avec plantains et légumes",
      image: "/poulet.jpg",
      available: true,
      preparationTime: "30 min",
      isVegetarian: false,
      isSpicy: false,
    },
    {
      id: "3",
      name: "Riz sauté",
      category: "Plats",
      price: 1200,
      description: "Riz sauté aux légumes et épices",
      image: "/riz.jpg",
      available: true,
      preparationTime: "20 min",
      isVegetarian: true,
      isSpicy: false,
    },
  ])

  const [newDish, setNewDish] = useState<Partial<Dish>>({
    name: "",
    category: "Plats",
    price: 0,
    description: "",
    available: true,
    preparationTime: "",
    isVegetarian: false,
    isSpicy: false,
  })



  const filteredDishes = dishes.filter((dish) => {
    const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || dish.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleAddDish = () => {
    const dish: Dish = {
      id: Date.now().toString(),
      name: newDish.name || "",
      category: newDish.category || "Plats",
      price: newDish.price || 0,
      description: newDish.description || "",
      image: `/placeholder.svg?height=200&width=200&query=${newDish.name}`,
      available: newDish.available ?? true,
      preparationTime: newDish.preparationTime || "",
      isVegetarian: newDish.isVegetarian || false,
      isSpicy: newDish.isSpicy || false,
    }
    setDishes([...dishes, dish])
    setIsAddDialogOpen(false)
    setNewDish({
      name: "",
      category: "Plats",
      price: 0,
      description: "",
      available: true,
      preparationTime: "",
      isVegetarian: false,
      isSpicy: false,
    })
  }

  const handleEditDish = () => {
    if (selectedDish) {
      setDishes(dishes.map((d) => (d.id === selectedDish.id ? selectedDish : d)))
      setIsEditDialogOpen(false)
      setSelectedDish(null)
    }
  }

  const handleDeleteDish = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce plat ?")) {
      setDishes(dishes.filter((d) => d.id !== id))
    }
  }

  const toggleAvailability = (id: string) => {
    setDishes(dishes.map((d) => (d.id === id ? { ...d, available: !d.available } : d)))
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">Gestion des plats</h1>
              <p className="text-gray-600">Gérez votre menu et vos plats</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
                  <Plus className="h-4 w-4" />
                  Ajouter un plat
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Ajouter un nouveau plat</DialogTitle>
                  <DialogDescription>Remplissez les informations du plat</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nom du plat</Label>
                    <Input
                      id="name"
                      value={newDish.name}
                      onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
                      placeholder="Ex: Ndolé"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Catégorie</Label>
                    <Select
                      value={newDish.category}
                      onValueChange={(value) => setNewDish({ ...newDish, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Plats">Plats</SelectItem>
                        <SelectItem value="Boissons">Boissons</SelectItem>
                        <SelectItem value="Desserts">Desserts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="price">Prix (FCFA)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={newDish.price}
                      onChange={(e) => setNewDish({ ...newDish, price: Number.parseInt(e.target.value) })}
                      placeholder="1500"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="preparationTime">Temps de préparation</Label>
                    <Input
                      id="preparationTime"
                      value={newDish.preparationTime}
                      onChange={(e) => setNewDish({ ...newDish, preparationTime: e.target.value })}
                      placeholder="25 min"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newDish.description}
                      onChange={(e) => setNewDish({ ...newDish, description: e.target.value })}
                      placeholder="Description du plat..."
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="vegetarian">Végétarien</Label>
                    <Switch
                      id="vegetarian"
                      checked={newDish.isVegetarian}
                      onCheckedChange={(checked) => setNewDish({ ...newDish, isVegetarian: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="spicy">Épicé</Label>
                    <Switch
                      id="spicy"
                      checked={newDish.isSpicy}
                      onCheckedChange={(checked) => setNewDish({ ...newDish, isSpicy: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="available">Disponible</Label>
                    <Switch
                      id="available"
                      checked={newDish.available}
                      onCheckedChange={(checked) => setNewDish({ ...newDish, available: checked })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button
                    onClick={handleAddDish}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                  >
                    Ajouter
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <Card className="mb-6 border-orange-200 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Rechercher un plat..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    <SelectItem value="Plats">Plats</SelectItem>
                    <SelectItem value="Boissons">Boissons</SelectItem>
                    <SelectItem value="Desserts">Desserts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Dishes Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDishes.map((dish) => (
              <Card
                key={dish.id}
                className="overflow-hidden border-orange-200 shadow-lg transition-all hover:shadow-xl"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={dish.image || "/placeholder.svg"}
                    alt={dish.name}
                    fill
                    className="object-cover transition-transform hover:scale-110"
                  />
                  <div className="absolute right-2 top-2 flex gap-2">
                    {dish.isVegetarian && <Badge className="bg-green-500 text-white">Végétarien</Badge>}
                    {dish.isSpicy && <Badge className="bg-red-500 text-white">Épicé</Badge>}
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900">{dish.name}</h3>
                      <p className="text-sm text-gray-600">{dish.category}</p>
                    </div>
                    <Badge
                      variant={dish.available ? "default" : "secondary"}
                      className={dish.available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}
                    >
                      {dish.available ? "Disponible" : "Indisponible"}
                    </Badge>
                  </div>
                  <p className="mb-3 text-sm text-gray-600 line-clamp-2">{dish.description}</p>
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-xl font-bold text-orange-600">{dish.price} FCFA</p>
                    <p className="text-sm text-gray-600">{dish.preparationTime}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => toggleAvailability(dish.id)}
                    >
                      {dish.available ? "Marquer indisponible" : "Marquer disponible"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedDish(dish)
                        setIsEditDialogOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDish(dish.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDishes.length === 0 && (
            <Card className="border-orange-200 p-12 text-center">
              <UtensilsCrossed className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="text-gray-600">Aucun plat trouvé</p>
            </Card>
          )}
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier le plat</DialogTitle>
            <DialogDescription>Modifiez les informations du plat</DialogDescription>
          </DialogHeader>
          {selectedDish && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nom du plat</Label>
                <Input
                  id="edit-name"
                  value={selectedDish.name}
                  onChange={(e) => setSelectedDish({ ...selectedDish, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Catégorie</Label>
                <Select
                  value={selectedDish.category}
                  onValueChange={(value) => setSelectedDish({ ...selectedDish, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Plats">Plats</SelectItem>
                    <SelectItem value="Boissons">Boissons</SelectItem>
                    <SelectItem value="Desserts">Desserts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Prix (FCFA)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={selectedDish.price}
                  onChange={(e) => setSelectedDish({ ...selectedDish, price: Number.parseInt(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-preparationTime">Temps de préparation</Label>
                <Input
                  id="edit-preparationTime"
                  value={selectedDish.preparationTime}
                  onChange={(e) => setSelectedDish({ ...selectedDish, preparationTime: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={selectedDish.description}
                  onChange={(e) => setSelectedDish({ ...selectedDish, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-vegetarian">Végétarien</Label>
                <Switch
                  id="edit-vegetarian"
                  checked={selectedDish.isVegetarian}
                  onCheckedChange={(checked) => setSelectedDish({ ...selectedDish, isVegetarian: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-spicy">Épicé</Label>
                <Switch
                  id="edit-spicy"
                  checked={selectedDish.isSpicy}
                  onCheckedChange={(checked) => setSelectedDish({ ...selectedDish, isSpicy: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-available">Disponible</Label>
                <Switch
                  id="edit-available"
                  checked={selectedDish.available}
                  onCheckedChange={(checked) => setSelectedDish({ ...selectedDish, available: checked })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleEditDish}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
