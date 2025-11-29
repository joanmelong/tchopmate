"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

  useEffect(() => {
    loadCreneaux()
  }, [restaurantId])

  const loadCreneaux = async () => {
    try {
      setLoading(true)
      
      // Vérifier que le restaurantId est valide
      if (!restaurantId || restaurantId === "default-restaurant-id") {
        console.warn('Restaurant ID invalide:', restaurantId)
        setCreneaux([])
        setLoading(false)
        return
      }
      
      console.log('Chargement créneaux pour restaurant:', restaurantId)
      
      // Récupérer les créneaux du restaurant
      const { data: creneauxData, error } = await supabase
        .from('creneaux')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('actif', true)
        .order('heure_debut')

      if (error) {
        console.error('Erreur chargement créneaux:', error)
        setLoading(false)
        return
      }
      
      console.log('Créneaux récupérés de la BD:', creneauxData)

      // Vérifier le jour de la semaine (1=Lundi, 7=Dimanche) - toujours aujourd'hui
      const today = new Date()
      const dayOfWeek = today.getDay() || 7 // Dimanche = 0 -> 7

      // Filtrer les créneaux disponibles pour ce jour
      const creneauxDuJour = creneauxData?.filter(c => 
        c.jours_semaine?.includes(dayOfWeek)
      ) || []
      
      console.log('Jour de la semaine:', dayOfWeek, 'Créneaux du jour:', creneauxDuJour)

      // Pour chaque créneau, compter les commandes existantes
      const creneauxAvecCount = await Promise.all(
        creneauxDuJour.map(async (creneau) => {
          // Créer la date/heure du créneau pour aujourd'hui
          const creneauDateTime = new Date(today)
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

      console.log('Créneaux finaux avec comptage:', creneauxAvecCount)
      setCreneaux(creneauxAvecCount)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }



  const handleSelectCreneau = (creneau: Creneau) => {
    const today = new Date()
    const creneauDateTime = new Date(today)
    const [heure, minute] = creneau.heure_debut.split(':')
    creneauDateTime.setHours(parseInt(heure), parseInt(minute), 0, 0)
    
    onSelectCreneau(creneau.id, creneauDateTime)
  }

  const isCreneauPassed = (creneau: Creneau) => {
    const now = new Date()
    const today = new Date()
    const creneauEndDateTime = new Date(today)
    const [heureFin, minuteFin] = creneau.heure_fin.split(':')
    creneauEndDateTime.setHours(parseInt(heureFin), parseInt(minuteFin), 0, 0)
    
    // Le créneau est passé seulement après l'heure de fin
    return creneauEndDateTime < now
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
          Sélectionnez l&apos;heure à laquelle vous souhaitez récupérer votre commande aujourd&apos;hui
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Affichage du jour (aujourd'hui seulement) */}
        <div>
          <label className="text-sm font-medium mb-2 block">Jour de retrait</label>
          <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <Calendar className="h-5 w-5 text-orange-600" />
            <span className="font-semibold text-orange-700">
              {new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>

        {/* Sélection du créneau */}
        <div>
          <label className="text-sm font-medium mb-2 block">Créneau horaire disponible</label>
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
