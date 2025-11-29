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
import { ImageUploadField } from "./image-upload-field"
import { Loader2, User, Phone, Save } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { useToast } from "@/hooks/use-toast"

interface AdminSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminSettingsDialog({ open, onOpenChange }: AdminSettingsDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    profileImage: null as File | null,
  })
  const [profileImagePreview, setProfileImagePreview] = useState<string>("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (open) {
      loadProfile()
    }
  }, [open])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      // Charger les données du gérant
      const { data: compte, error } = await supabase
        .from("compte")
        .select("nom, prenom, email, numero_tel")
        .eq("user_id", user.id)
        .maybeSingle()

      if (error) {
        console.error("Erreur chargement profil:", error)
        return
      }

      if (compte) {
        setFormData({
          firstName: compte.prenom || "",
          lastName: compte.nom || "",
          phone: compte.numero_tel || "",
          email: compte.email || user.email || "",
          password: "",
          confirmPassword: "",
          profileImage: null,
        })
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setError("")

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("Le nom et le prénom sont obligatoires")
      return
    }

    if (formData.phone && !/^\+?[0-9\s-]{8,}$/.test(formData.phone)) {
      setError("Numéro de téléphone invalide")
      return
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Mettre à jour le profil dans la table compte
      const { error: updateError } = await supabase
        .from("compte")
        .update({
          nom: formData.lastName.trim(),
          prenom: formData.firstName.trim(),
          numero_tel: formData.phone.trim() || null,
        })
        .eq("user_id", user.id)

      if (updateError) throw updateError

      toast({
        title: "Succès",
        description: "Votre profil a été mis à jour",
      })

      onOpenChange(false)
    } catch (error: unknown) {
      console.error("Erreur sauvegarde:", error)
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la sauvegarde"
      setError(errorMessage)
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chargement...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <div className="bg-orange-500 p-2 rounded-lg">
              <User className="h-5 w-5 text-white" />
            </div>
            Modifier le profil
          </DialogTitle>
          <DialogDescription>Mettez à jour vos informations personnelles</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <ImageUploadField
            label="Photo de profil"
            value={formData.profileImage?.name}
            onChange={(file) => setFormData({ ...formData, profileImage: file })}
            preview={profileImagePreview}
            onPreviewChange={setProfileImagePreview}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 group">
              <Label htmlFor="firstName" className="flex items-center gap-2 text-sm font-semibold">
                <div className="bg-orange-100 p-1 rounded group-hover:bg-orange-200 transition-colors">
                  <User className="h-3 w-3 text-orange-600" />
                </div>
                Prénom *
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Votre prénom"
                className="border-2 border-orange-200 focus:border-orange-500 h-11"
              />
            </div>
            <div className="space-y-2 group">
              <Label htmlFor="lastName" className="flex items-center gap-2 text-sm font-semibold">
                <div className="bg-orange-100 p-1 rounded group-hover:bg-orange-200 transition-colors">
                  <User className="h-3 w-3 text-orange-600" />
                </div>
                Nom *
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Votre nom"
                className="border-2 border-orange-200 focus:border-orange-500 h-11"
              />
            </div>
          </div>

          <div className="space-y-2 group">
            <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-semibold">
              <div className="bg-orange-100 p-1 rounded group-hover:bg-orange-200 transition-colors">
                <Phone className="h-3 w-3 text-orange-600" />
              </div>
              Téléphone
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+237 6XX XXX XXX"
              className="border-2 border-orange-200 focus:border-orange-500 h-11"
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold text-sm text-gray-700 mb-3">Changer le mot de passe (optionnel)</h4>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="password" className="text-sm">Nouveau mot de passe</Label>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Laisser vide pour ne pas changer"
                  className="border-2 border-gray-200 focus:border-orange-500 h-11"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-sm">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirmer le mot de passe"
                  className="border-2 border-gray-200 focus:border-orange-500 h-11"
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
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Annuler
          </Button>
          <Button 
            className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-md" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
