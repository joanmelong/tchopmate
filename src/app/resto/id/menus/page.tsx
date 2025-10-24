"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit2, Trash2, Eye } from "lucide-react"
import { MenuDialog } from "@/components/admin/menu-dialog"
import { MenuViewDialog } from "@/components/admin/menu-view-dialog"

export default function MenusPage() {
  const [showDialog, setShowDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedMenu, setSelectedMenu] = useState(null)

  const [menus, setMenus] = useState([
    {
      id: 1,
      name: "Menu par défaut",
      date: null,
      isDefault: true,
      dishIds: [1, 2, 3, 4],
      createdAt: new Date(),
    },
    {
      id: 2,
      name: "Menu du lundi",
      date: "2025-10-27",
      isDefault: false,
      dishIds: [1, 2, 4],
      createdAt: new Date(),
    },
    {
      id: 3,
      name: "Menu du mardi",
      date: "2025-10-28",
      isDefault: false,
      dishIds: [2, 3, 4],
      createdAt: new Date(),
    },
  ])

  const handleAddMenu = (menuData) => {
    if (selectedMenu) {
      setMenus(menus.map((m) => (m.id === selectedMenu.id ? { ...m, ...menuData } : m)))
    } else {
      setMenus([
        ...menus,
        {
          ...menuData,
          id: Math.max(...menus.map((m) => m.id), 0) + 1,
          createdAt: new Date(),
        },
      ])
    }
    setShowDialog(false)
    setSelectedMenu(null)
  }

  const handleDeleteMenu = (id) => {
    const menu = menus.find((m) => m.id === id)
    if (menu?.isDefault) {
      alert("Vous ne pouvez pas supprimer le menu par défaut")
      return
    }
    setMenus(menus.filter((m) => m.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des menus</h1>
          <p className="text-gray-600 mt-1">Créez et gérez vos menus permanents et journaliers</p>
        </div>
        <Button
          className="bg-orange-500 hover:bg-orange-600 text-white"
          onClick={() => {
            setSelectedMenu(null)
            setShowDialog(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Créer un menu
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tous les menus</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Nom</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Nombre de plats</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {menus.map((menu) => (
                  <tr key={menu.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{menu.name}</td>
                    <td className="py-3 px-4 text-gray-700">
                      {menu.date ? new Date(menu.date).toLocaleDateString("fr-FR") : "—"}
                    </td>
                    <td className="py-3 px-4 text-gray-700">{menu.dishIds.length} plats</td>
                    <td className="py-3 px-4">
                      {menu.isDefault ? (
                        <Badge className="bg-blue-100 text-blue-700">Par défaut</Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-700">Journalier</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedMenu(menu)
                          setShowViewDialog(true)
                        }}
                      >
                        <Eye className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedMenu(menu)
                          setShowDialog(true)
                        }}
                      >
                        <Edit2 className="h-4 w-4 text-blue-600" />
                      </Button>
                      {!menu.isDefault && (
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteMenu(menu.id)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <MenuDialog open={showDialog} onOpenChange={setShowDialog} menu={selectedMenu} onSave={handleAddMenu} />

      <MenuViewDialog open={showViewDialog} onOpenChange={setShowViewDialog} menu={selectedMenu} />
    </div>
  )
}
