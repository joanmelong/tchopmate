"use client"

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
import { Mail, Phone, User } from "lucide-react"

interface ProfileViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: () => void
}

export function ProfileViewDialog({ open, onOpenChange, onEdit }: ProfileViewDialogProps) {
  const adminProfile = {
    firstName: "Astrid",
    lastName: "Belinga",
    email: "astrid.belinga@university.edu",
    phone: "+237 6XX XXX XXX",
    profileImage: "/admin-avatar.png",
    role: "Administrateur",
    joinDate: "15 Janvier 2024",
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Mon Profil</DialogTitle>
          <DialogDescription>Informations de votre compte administrateur</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Avatar */}
          <div className="flex flex-col items-center space-y-3">
            <Avatar className="h-24 w-24">
              <AvatarImage src={adminProfile.profileImage || "/placeholder.svg"} />
              <AvatarFallback className="bg-orange-100 text-orange-600 text-xl">
                {adminProfile.firstName.charAt(0)}
                {adminProfile.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {adminProfile.firstName} {adminProfile.lastName}
              </h3>
              <p className="text-sm text-gray-500">{adminProfile.role}</p>
            </div>
          </div>

          {/* Profile Information */}
          <div className="space-y-4 border-t border-gray-200 pt-4">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-xs text-gray-500">Nom complet</p>
                <p className="text-sm font-medium text-gray-900">
                  {adminProfile.firstName} {adminProfile.lastName}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">{adminProfile.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-xs text-gray-500">Téléphone</p>
                <p className="text-sm font-medium text-gray-900">{adminProfile.phone}</p>
              </div>
            </div>

            <div className="text-xs text-gray-500 pt-2">Membre depuis le {adminProfile.joinDate}</div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={onEdit}>
            Modifier le profil
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
