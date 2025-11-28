"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Users, Calendar } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

interface Creneau {
  id: string
  heure_debut: string
  heure_fin: string
  capacite_max: number
  commandes_count: number
}

interface CreneauSelectorProps {
  restaurantId: string
  selectedCreneau: string | null
  onSelectCreneau: (creneauId: string, dateTime: Date) => void
}

export function CreneauSelector({ restaurantId, selectedCreneau, onSelectCreneau }: CreneauSelectorProps) {
  const [creneaux, setCreneaux] = useState<Creneau[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  useEffect(() => {
    loadCreneaux()
  }, [restaurantId, selectedDate])

  const loadCreneaux = async () => {
    try {
      setLoading(true)
      
      // Récupérer les créneaux du restaurant
      const { data: creneauxData, error } = await supabase
        .from('creneaux')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('actif', true)
        .order('heure_debut')

      if (error) {
        console.error('Erreur chargement créneaux:', error)
        return
      }

      // Vérifier le jour de la semaine (1=Lundi, 7=Dimanche)
      const dayOfWeek = selectedDate.getDay() || 7 // Dimanche = 0 -> 7

      // Filtrer les créneaux disponibles pour ce jour
      const creneauxDuJour = creneauxData?.filter(c => 
        c.jours_semaine?.includes(dayOfWeek)
      ) || []

      // Pour chaque créneau, compter les commandes existantes
      const creneauxAvecCount = await Promise.all(
        creneauxDuJour.map(async (creneau) => {
          // Créer la date/heure du créneau
          const creneauDateTime = new Date(selectedDate)
          const [heureDebut, minuteDebut] = creneau.heure_debut.split(':')
          creneauDateTime.setHours(parseInt(heureDebut), parseInt(minuteDebut), 0, 0)

          // Compter les commandes pour ce créneau
          const { count } = await supabase
            .from('commande')
            .select('*', { count: 'exact', head: true })
            .gte('creneau_retrait', creneauDateTime.toISOString())
            .lt('creneau_retrait', new Date(creneauDateTime.getTime() + 30 * 60000).toISOString())
            .neq('statut', 'ANNULEE')

          return {
            ...creneau,
            commandes_count: count || 0
          }
        })
      )

      setCreneaux(creneauxAvecCount)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const getNextDays = (count: number) => {
    const days = []
    for (let i = 0; i < count; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      days.push(date)
    }
    return days
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Demain"
    } else {
      return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
    }
  }

  const handleSelectCreneau = (creneau: Creneau) => {
    const creneauDateTime = new Date(selectedDate)
    const [heure, minute] = creneau.heure_debut.split(':')
    creneauDateTime.setHours(parseInt(heure), parseInt(minute), 0, 0)
    
    onSelectCreneau(creneau.id, creneauDateTime)
  }

  const isCreneauPassed = (creneau: Creneau) => {
    const now = new Date()
    const creneauDateTime = new Date(selectedDate)
    const [heure, minute] = creneau.heure_debut.split(':')
    creneauDateTime.setHours(parseInt(heure), parseInt(minute), 0, 0)
    
    return creneauDateTime < now
  }

  const isCreneauFull = (creneau: Creneau) => {
    return creneau.commandes_count >= creneau.capacite_max
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-orange-500" />
          Choisissez votre créneau de retrait
        </CardTitle>
        <CardDescription>
          Sélectionnez le jour et l'heure à laquelle vous souhaitez récupérer votre commande
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sélection du jour */}
        <div>
          <label className="text-sm font-medium mb-2 block">Jour de retrait</label>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {getNextDays(7).map((date) => (
              <Button
                key={date.toISOString()}
                variant={selectedDate.toDateString() === date.toDateString() ? "default" : "outline"}
                className={`flex-shrink-0 ${
                  selectedDate.toDateString() === date.toDateString()
                    ? "bg-orange-500 hover:bg-orange-600"
                    : ""
                }`}
                onClick={() => setSelectedDate(date)}
              >
                <Calendar className="h-4 w-4 mr-2" />
                {formatDate(date)}
              </Button>
            ))}
          </div>
        </div>

        {/* Sélection du créneau */}
        <div>
          <label className="text-sm font-medium mb-2 block">Créneau horaire</label>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : creneaux.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Aucun créneau disponible pour ce jour
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {creneaux.map((creneau) => {
                const passed = isCreneauPassed(creneau)
                const full = isCreneauFull(creneau)
                const disabled = passed || full
                const isSelected = selectedCreneau === creneau.id

                return (
                  <button
                    key={creneau.id}
                    onClick={() => !disabled && handleSelectCreneau(creneau)}
                    disabled={disabled}
                    className={`
                      relative p-4 rounded-lg border-2 transition-all
                      ${isSelected 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-200 hover:border-orange-300'
                      }
                      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <div className="text-center">
                      <div className="font-semibold text-lg">
                        {creneau.heure_debut.slice(0, 5)} - {creneau.heure_fin.slice(0, 5)}
                      </div>
                      <div className="flex items-center justify-center gap-1 mt-2 text-sm text-gray-600">
                        <Users className="h-3 w-3" />
                        <span>{creneau.commandes_count}/{creneau.capacite_max}</span>
                      </div>
                      {full && (
                        <Badge className="mt-2 bg-red-500 text-white text-xs">
                          Complet
                        </Badge>
                      )}
                      {passed && !full && (
                        <Badge className="mt-2 bg-gray-500 text-white text-xs">
                          Passé
                        </Badge>
                      )}
                      {isSelected && (
                        <Badge className="mt-2 bg-orange-500 text-white text-xs">
                          Sélectionné
                        </Badge>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
