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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageUploadField } from "./image-upload-field"

interface DishDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dish?: any
  onSave?: (dishData: any) => void
}

export function DishDialog({ open, onOpenChange, dish, onSave }: DishDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    waitTime: "",
    type: "none",
    image: null as File | null,
    available: true,
  })
  const [imagePreview, setImagePreview] = useState<string>("")

  useEffect(() => {
    if (dish) {
      setFormData({
        name: dish.name || "",
        description: dish.description || "",
        price: dish.price || "",
        waitTime: dish.waitTime || "",
        type: dish.type || "none",
        image: null,
        available: dish.available !== false,
      })
      setImagePreview(dish.image || "")
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        waitTime: "",
        type: "none",
        image: null,
        available: true,
      })
      setImagePreview("")
    }
  }, [dish, open])

  const handleSave = () => {
    if (!formData.name || !formData.price || !formData.waitTime) {
      alert("Veuillez remplir tous les champs obligatoires")
      return
    }
    onSave?.(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dish ? "Modifier le plat" : "Ajouter un plat"}</DialogTitle>
          <DialogDescription>
            {dish ? "Modifiez les détails du plat" : "Remplissez les informations du nouveau plat"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nom du plat *</Label>
              <Input
                id="name"
                placeholder="Ex: Poulet DG"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="price">Prix (FCFA) *</Label>
              <Input
                id="price"
                type="number"
                placeholder="Ex: 3000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="waitTime">Temps d&apos;attente (min) *</Label>
              <Input
                id="waitTime"
                type="number"
                placeholder="Ex: 30"
                value={formData.waitTime}
                onChange={(e) => setFormData({ ...formData, waitTime: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun</SelectItem>
                  <SelectItem value="spicy">Épicé</SelectItem>
                  <SelectItem value="vegetarian">Végétarien</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Décrivez le plat..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <ImageUploadField
            label="Image du plat"
            value={formData.image?.name}
            onChange={(file) => setFormData({ ...formData, image: file })}
            preview={imagePreview}
            onPreviewChange={setImagePreview}
          />

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="available"
              checked={formData.available}
              onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
              className="rounded border-gray-300"
            />
            <Label htmlFor="available" className="cursor-pointer">
              Disponible
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleSave}>
            {dish ? "Modifier" : "Ajouter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
