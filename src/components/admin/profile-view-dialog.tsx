"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, User, Loader2, Shield, Calendar } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

interface ProfileViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: () => void
}

type GerantProfile = {
  firstName: string
  lastName: string
  email: string
  phone: string
  profileImage?: string
  role: string
  joinDate: string
}

export function ProfileViewDialog({ open, onOpenChange, onEdit }: ProfileViewDialogProps) {
  const [loading, setLoading] = useState(true)
  const [adminProfile, setAdminProfile] = useState<GerantProfile>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profileImage: "/admin-avatar.png",
    role: "Gérant",
    joinDate: "",
  })

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

      // Charger les données du gérant depuis la table compte
      const { data: compte, error } = await supabase
        .from("compte")
        .select("nom, prenom, email, numero_tel, created_at")
        .eq("user_id", user.id)
        .maybeSingle()

      if (error) {
        console.error("Erreur chargement profil gérant:", error)
        return
      }

      if (compte) {
        setAdminProfile({
          firstName: compte.prenom || "",
          lastName: compte.nom || "",
          email: compte.email || user.email || "",
          phone: compte.numero_tel || "",
          profileImage: user.user_metadata?.avatar_url || "/admin-avatar.png",
          role: "Gérant de Restaurant",
          joinDate: compte.created_at 
            ? new Date(compte.created_at).toLocaleDateString('fr-FR', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })
            : "",
        })
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">Mon Profil</DialogTitle>
          <DialogDescription>Informations de votre compte gérant</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header with gradient */}
          <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10 flex flex-col items-center space-y-3">
              <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
                <AvatarImage src={adminProfile.profileImage || "/placeholder.svg"} />
                <AvatarFallback className="bg-white text-orange-600 text-2xl font-bold">
                  {adminProfile.firstName?.charAt(0) || ""}
                  {adminProfile.lastName?.charAt(0) || ""}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="text-2xl font-bold">
                  {adminProfile.firstName} {adminProfile.lastName}
                </h3>
                <Badge className="mt-2 bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <Shield className="h-3 w-3 mr-1" />
                  {adminProfile.role}
                </Badge>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-4 bg-orange-50 rounded-lg border border-orange-100">
              <div className="bg-orange-500 p-2 rounded-lg">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nom complet</p>
                <p className="text-base font-semibold text-gray-900 mt-1">
                  {adminProfile.firstName} {adminProfile.lastName}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-orange-50 rounded-lg border border-orange-100">
              <div className="bg-orange-500 p-2 rounded-lg">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</p>
                <p className="text-base font-semibold text-gray-900 mt-1">{adminProfile.email}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-orange-50 rounded-lg border border-orange-100">
              <div className="bg-orange-500 p-2 rounded-lg">
                <Phone className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Téléphone</p>
                <p className="text-base font-semibold text-gray-900 mt-1">
                  {adminProfile.phone || "Non renseigné"}
                </p>
              </div>
            </div>

            {adminProfile.joinDate && (
              <div className="flex items-center space-x-2 text-sm text-gray-500 pt-2 border-t">
                <Calendar className="h-4 w-4" />
                <span>Membre depuis le {adminProfile.joinDate}</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          <Button 
            className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-md" 
            onClick={onEdit}
          >
            Modifier le profil
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
