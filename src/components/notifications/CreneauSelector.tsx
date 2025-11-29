"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Clock, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

import { Label } from "@/components/ui/label"

interface Creneau {
  id: string
  heure_debut: string
  heure_fin: string
  capacite_max: number
  commandes_count?: number
}

interface CreneauSelectorProps {
  restaurantId: string
  selectedCreneau: string | null
  onSelect: (creneauId: string, heureDebut: string, heureFin: string) => void
}

export function CreneauSelector({ restaurantId, selectedCreneau, onSelect }: CreneauSelectorProps) {
  const [creneaux, setCreneaux] = useState<Creneau[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCreneaux()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId])

  const loadCreneaux = async () => {
    try {
      const now = new Date()
      const today = now.toISOString().split('T')[0]
      const currentTime = now.toTimeString().substring(0, 5) // "HH:MM"
      const currentDayOfWeek = now.getDay() === 0 ? 7 : now.getDay() // 1=Lundi, 7=Dimanche

      // Récupérer les créneaux actifs pour ce restaurant et ce jour de la semaine
      const { data: creneauxData, error: creneauxError } = await supabase
        .from('creneaux')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('actif', true)
        .contains('jours_semaine', [currentDayOfWeek])
        .order('heure_debut')

      if (creneauxError) throw creneauxError

      // Filtrer les créneaux déjà passés et compter les commandes
      const creneauxWithCount = await Promise.all(
        (creneauxData || [])
          .filter(creneau => {
            // Ne garder que les créneaux futurs (au moins 15 min d'avance)
            const creneauTime = creneau.heure_debut.substring(0, 5)
            const [creneauH, creneauM] = creneauTime.split(':').map(Number)
            const [currentH, currentM] = currentTime.split(':').map(Number)
            const creneauMinutes = creneauH * 60 + creneauM
            const currentMinutes = currentH * 60 + currentM
            
            // Garder le créneau s'il reste au moins 15 minutes
            return creneauMinutes >= currentMinutes + 15
          })
          .map(async (creneau) => {
            const { count } = await supabase
              .from('commande')
              .select('*', { count: 'exact', head: true })
              .gte('creneau_retrait', `${today}T${creneau.heure_debut}`)
              .lt('creneau_retrait', `${today}T${creneau.heure_fin}`)
              .in('statut', ['EN_ATTENTE', 'EN_PREPARATION', 'PRETE'])

            return {
              ...creneau,
              commandes_count: count || 0
            }
          })
      )

      setCreneaux(creneauxWithCount)
    } catch (error) {
      console.error('Erreur chargement créneaux:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (time: string) => {
    return time.substring(0, 5) // "HH:MM"
  }

  const isCreneauFull = (creneau: Creneau) => {
    return (creneau.commandes_count || 0) >= creneau.capacite_max
  }

  const getAvailabilityColor = (creneau: Creneau) => {
    const ratio = (creneau.commandes_count || 0) / creneau.capacite_max
    if (ratio >= 1) return 'text-red-600'
    if (ratio >= 0.8) return 'text-orange-600'
    return 'text-green-600'
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (creneaux.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Clock className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-600 font-semibold mb-2">Aucun créneau disponible aujourd&apos;hui</p>
          <p className="text-sm text-gray-500">
            Tous les créneaux sont passés ou complets. Revenez demain ou contactez le restaurant.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold">Choisissez votre heure de retrait (Aujourd&apos;hui)</Label>
        <p className="text-sm text-gray-500 mt-1">
          Sélectionnez l&apos;heure à laquelle vous souhaitez retirer votre commande
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {creneaux.map((creneau) => {
          const isFull = isCreneauFull(creneau)
          const isSelected = selectedCreneau === creneau.id
          const placesRestantes = creneau.capacite_max - (creneau.commandes_count || 0)

          return (
            <button
              key={creneau.id}
              type="button"
              disabled={isFull}
              className={`
                relative p-4 rounded-lg border-2 transition-all text-left
                ${isSelected
                  ? 'border-orange-500 bg-orange-50 shadow-md'
                  : isFull
                  ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                  : 'border-gray-200 hover:border-orange-300 hover:shadow-sm cursor-pointer'
                }
              `}
              onClick={() => {
                if (!isFull) {
                  onSelect(creneau.id, creneau.heure_debut, creneau.heure_fin)
                }
              }}
            >
              {/* Badge sélectionné */}
              {isSelected && (
                <div className="absolute -top-2 -right-2">
                  <div className="bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    ✓
                  </div>
                </div>
              )}

              {/* Icône horloge */}
              <div className={`inline-flex p-2 rounded-lg mb-2 ${isSelected ? 'bg-orange-200' : 'bg-gray-100'}`}>
                <Clock className={`h-5 w-5 ${isSelected ? 'text-orange-600' : 'text-gray-600'}`} />
              </div>

              {/* Heure */}
              <div className="font-semibold text-gray-900 mb-2">
                {formatTime(creneau.heure_debut)} - {formatTime(creneau.heure_fin)}
              </div>

              {/* Disponibilité */}
              <div className="flex items-center gap-1">
                <Users className={`h-4 w-4 ${getAvailabilityColor(creneau)}`} />
                <span className={`text-sm font-medium ${getAvailabilityColor(creneau)}`}>
                  {isFull ? 'Complet' : `${placesRestantes} place${placesRestantes > 1 ? 's' : ''}`}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
