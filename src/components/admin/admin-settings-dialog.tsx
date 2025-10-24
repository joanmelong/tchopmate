"use client"

import { useState } from "react"
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
import { ImageUploadField } from "./image-upload-field"

interface AdminSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminSettingsDialog({ open, onOpenChange }: AdminSettingsDialogProps) {
  const [formData, setFormData] = useState({
    firstName: "Astrid",
    lastName: "Belinga",
    phone: "+237 6XX XXX XXX",
    password: "",
    confirmPassword: "",
    profileImage: null as File | null,
  })
  const [profileImagePreview, setProfileImagePreview] = useState<string>("")

  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  const handleSave = () => {
    setError("")

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("Le nom et le prénom sont obligatoires")
      return
    }

    if (!formData.phone.trim()) {
      setError("Le téléphone est obligatoire")
      return
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    // TODO: Save admin settings to backend
    console.log("Admin settings saved:", formData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le profil</DialogTitle>
          <DialogDescription>Modifiez vos informations personnelles</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <ImageUploadField
            label="Photo de profil"
            value={formData.profileImage?.name}
            onChange={(file) => setFormData({ ...formData, profileImage: file })}
            preview={profileImagePreview}
            onPreviewChange={setProfileImagePreview}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Prénom"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Nom"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+237 6XX XXX XXX"
            />
          </div>

          <div>
            <Label htmlFor="password">Nouveau mot de passe (optionnel)</Label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Laisser vide pour ne pas changer"
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Confirmer le mot de passe"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showPassword"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <Label htmlFor="showPassword" className="text-sm cursor-pointer">
              Afficher les mots de passe
            </Label>
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleSave}>
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
