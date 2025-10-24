"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, Bell, Settings } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AdminSettingsDialog } from "./admin-settings-dialog"
import { ProfileViewDialog } from "./profile-view-dialog"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const [profileViewOpen, setProfileViewOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <Button variant="ghost" size="sm" onClick={onMenuClick} className="lg:hidden">
          <Menu className="h-5 w-5 text-gray-600" />
        </Button>

        <div className="flex-1" />

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            <Bell className="h-5 w-5 text-gray-600" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="h-5 w-5 text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setProfileViewOpen(true)}>Afficher le profil</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSettingsOpen(true)}>Modifier le profil</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarImage src="/admin-avatar.png" />
            <AvatarFallback className="bg-primary/20 text-primary">AD</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <ProfileViewDialog
        open={profileViewOpen}
        onOpenChange={setProfileViewOpen}
        onEdit={() => {
          setProfileViewOpen(false)
          setSettingsOpen(true)
        }}
      />
      <AdminSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  )
}
