"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Clock, Plus, Trash2, Edit, Users, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Logo } from "@/components/logo"
import { useProtectedRoute } from "@/hooks/use-protected-route"
import { useRestaurantByGerant } from "@/hooks/use-restaurant"
import { UserRole } from "@/core/entities/User"

interface Creneau {
  id: string
  heure_debut: string
  heure_fin: string
  capacite_max: number
  actif: boolean
  jours_semaine: number[]
}

export default function CreneauxManagementPage() {
  const params = useParams()
  const router = useRouter()
  const gerantId = params.id as string

  // Protéger la route et récupérer le restaurant
  const { user, isLoading: authLoading } = useProtectedRoute({
    requiredRole: UserRole.STAFF,
    redirectTo: "/resto/login",
  })

  const { restaurant, isLoading: restaurantLoading, error: restaurantError } = useRestaurantByGerant(user)
  
  const isLoadingAuth = authLoading || restaurantLoading
  const restaurantId = restaurant?.id || null

  const [creneaux, setCreneaux] = useState<Creneau[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state
  const [heureDebut, setHeureDebut] = useState("12:00")
  const [heureFin, setHeureFin] = useState("12:30")
  const [capaciteMax, setCapaciteMax] = useState(10)
  const [actif, setActif] = useState(true)

  useEffect(() => {
    if (restaurantId) {
      loadCreneaux()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId])

  const loadCreneaux = async () => {
    if (!restaurantId) {
      console.error('Restaurant ID manquant')
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('creneaux')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('heure_debut')

    if (error) {
      console.error('Erreur chargement créneaux:', error)
      return
    }

    setCreneaux(data || [])
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Tous les jours de la semaine par défaut (1-7)
    const creneauData = {
      restaurant_id: restaurantId,
      heure_debut: heureDebut,
      heure_fin: heureFin,
      capacite_max: capaciteMax,
      actif,
      jours_semaine: [1, 2, 3, 4, 5, 6, 7] // Tous les jours
    }

    if (editingId) {
      const { error } = await supabase
        .from('creneaux')
        .update(creneauData)
        .eq('id', editingId)

      if (error) {
        console.error('Erreur mise à jour:', error)
        return
      }
    } else {
      const { error } = await supabase
        .from('creneaux')
        .insert(creneauData)

      if (error) {
        console.error('Erreur création:', error)
        return
      }
    }

    resetForm()
    loadCreneaux()
  }

  const handleEdit = (creneau: Creneau) => {
    setEditingId(creneau.id)
    setHeureDebut(creneau.heure_debut)
    setHeureFin(creneau.heure_fin)
    setCapaciteMax(creneau.capacite_max)
    setActif(creneau.actif)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce créneau ?')) return

    const { error } = await supabase
      .from('creneaux')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erreur suppression:', error)
      return
    }

    loadCreneaux()
  }

  const resetForm = () => {
    setEditingId(null)
    setHeureDebut("12:00")
    setHeureFin("12:30")
    setCapaciteMax(10)
    setActif(true)
    setShowForm(false)
  }

  // Vérifier l'accès
  if (user && user.id.toString() !== gerantId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès non autorisé</h2>
          <p className="text-muted-foreground">
            Vous n&apos;avez pas accès à ce restaurant
          </p>
        </div>
      </div>
    )
  }

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (restaurantError || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Erreur: {restaurantError || "Restaurant non trouvé"}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push(`/resto/${gerantId}/orders`)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Logo size="small" />
              <h1 className="text-xl font-semibold text-orange-600">Gestion des créneaux</h1>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="bg-orange-500 hover:bg-orange-600">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau créneau
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Form */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingId ? 'Modifier' : 'Nouveau'} créneau</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="heure_debut">Heure de début</Label>
                    <Input
                      id="heure_debut"
                      type="time"
                      value={heureDebut}
                      onChange={(e) => setHeureDebut(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="heure_fin">Heure de fin</Label>
                    <Input
                      id="heure_fin"
                      type="time"
                      value={heureFin}
                      onChange={(e) => setHeureFin(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="capacite">Capacité maximale</Label>
                  <Input
                    id="capacite"
                    type="number"
                    min="1"
                    value={capaciteMax}
                    onChange={(e) => {
                      const val = parseInt(e.target.value)
                      setCapaciteMax(isNaN(val) ? 1 : val)
                    }}
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="actif"
                    checked={actif}
                    onCheckedChange={setActif}
                  />
                  <Label htmlFor="actif">Créneau actif</Label>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                    {editingId ? 'Mettre à jour' : 'Créer'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Annuler
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Liste des créneaux */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : creneaux.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Clock className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun créneau</h3>
              <p className="text-gray-500 mb-4">Créez votre premier créneau horaire</p>
              <Button onClick={() => setShowForm(true)} className="bg-orange-500 hover:bg-orange-600">
                <Plus className="h-4 w-4 mr-2" />
                Créer un créneau
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {creneaux.map((creneau) => (
              <Card key={creneau.id} className={!creneau.actif ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-orange-500" />
                      <span className="font-semibold text-lg">
                        {creneau.heure_debut.substring(0, 5)} - {creneau.heure_fin.substring(0, 5)}
                      </span>
                    </div>
                    <Badge variant={creneau.actif ? "default" : "secondary"}>
                      {creneau.actif ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Users className="h-4 w-4" />
                    <span>{creneau.capacite_max} commandes max</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(creneau)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(creneau.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
