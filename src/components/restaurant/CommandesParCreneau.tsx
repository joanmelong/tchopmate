"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Clock, Package, Users, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface Commande {
  id_commande: string
  numero_commande: string
  statut: string
  montant_total: number
  creneau_retrait: string
  created_at: string
  client?: {
    nom?: string
    prenom?: string
  }
}

interface CreneauGroup {
  creneau: string
  heureDebut: string
  heureFin: string
  commandes: Commande[]
  total: number
}

interface CommandesParCreneauProps {
  restaurantId: string
  date?: string // Format: YYYY-MM-DD
}

export function CommandesParCreneau({ restaurantId, date }: CommandesParCreneauProps) {
  const [groupes, setGroupes] = useState<CreneauGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [openCreneaux, setOpenCreneaux] = useState<Set<string>>(new Set())

  const selectedDate = date || new Date().toISOString().split('T')[0]

  useEffect(() => {
    loadCommandes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, selectedDate])

  const loadCommandes = async () => {
    try {
      // Récupérer toutes les commandes du jour avec créneau
      const { data: commandes, error } = await supabase
        .from('commande')
        .select(`
          id_commande,
          numero_commande,
          statut,
          montant_total,
          creneau_retrait,
          created_at,
          client:compte!commande_client_id_fkey (
            nom,
            prenom
          )
        `)
        .eq('restaurant_id', restaurantId)
        .gte('creneau_retrait', `${selectedDate}T00:00:00`)
        .lt('creneau_retrait', `${selectedDate}T23:59:59`)
        .not('creneau_retrait', 'is', null)
        .order('creneau_retrait')

      if (error) throw error

      // Grouper par créneau
      const grouped = groupByCreneaux(commandes || [])
      setGroupes(grouped)
    } catch (error) {
      console.error('Erreur chargement commandes:', error)
    } finally {
      setLoading(false)
    }
  }

  const groupByCreneaux = (commandes: Array<{ creneau_retrait: string; id_commande: number; numero_commande?: string; statut: string; montant_total: number; created_at?: string; client?: { nom?: string; prenom?: string } | Array<{ nom?: string; prenom?: string }>; items?: Array<{ name: string; qty: number; price: number }> }>): CreneauGroup[] => {
    const map = new Map<string, Commande[]>()

    commandes.forEach((cmd) => {
      const date = new Date(cmd.creneau_retrait)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _heureDebut = date.toTimeString().substring(0, 5)
      
      // Arrondir à la demi-heure pour grouper
      const minutes = date.getMinutes()
      const heureRounded = minutes < 30 ? `${date.getHours()}:00` : `${date.getHours()}:30`
      
      if (!map.has(heureRounded)) {
        map.set(heureRounded, [])
      }
      map.get(heureRounded)!.push({
        id_commande: String(cmd.id_commande),
        numero_commande: cmd.numero_commande || '',
        statut: cmd.statut,
        montant_total: cmd.montant_total,
        creneau_retrait: cmd.creneau_retrait,
        created_at: cmd.created_at || '',
        client: Array.isArray(cmd.client) ? cmd.client[0] : cmd.client
      })
    })

    // Convertir en tableau et trier
    return Array.from(map.entries())
      .map(([heure, commandes]) => {
        const [h, m] = heure.split(':').map(Number)
        const heureDebut = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
        const heureFin = m === 0 
          ? `${h.toString().padStart(2, '0')}:30`
          : `${(h + 1).toString().padStart(2, '0')}:00`

        return {
          creneau: heure,
          heureDebut,
          heureFin,
          commandes,
          total: commandes.reduce((sum, cmd) => sum + cmd.montant_total, 0)
        }
      })
      .sort((a, b) => a.creneau.localeCompare(b.creneau))
  }

  const toggleCreneau = (creneau: string) => {
    setOpenCreneaux(prev => {
      const newSet = new Set(prev)
      if (newSet.has(creneau)) {
        newSet.delete(creneau)
      } else {
        newSet.add(creneau)
      }
      return newSet
    })
  }

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'EN_ATTENTE':
        return 'bg-yellow-100 text-yellow-700'
      case 'EN_PREPARATION':
        return 'bg-blue-100 text-blue-700'
      case 'PRETE':
        return 'bg-green-100 text-green-700'
      case 'RETIREE':
        return 'bg-gray-100 text-gray-700'
      case 'ANNULEE':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatutLabel = (statut: string) => {
    const labels: Record<string, string> = {
      'EN_ATTENTE': 'En attente',
      'EN_PREPARATION': 'En préparation',
      'PRETE': 'Prête',
      'RETIREE': 'Retirée',
      'ANNULEE': 'Annulée'
    }
    return labels[statut] || statut
  }

  const handleChangeStatut = async (commandeId: string, newStatut: string) => {
    const { error } = await supabase
      .from('commande')
      .update({ statut: newStatut })
      .eq('id_commande', commandeId)

    if (!error) {
      loadCommandes()
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (groupes.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Clock className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune commande</h3>
          <p className="text-gray-500">Aucune commande avec créneau pour cette date</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Commandes par créneau
        </h2>
        <Badge variant="outline" className="text-sm">
          {groupes.reduce((sum, g) => sum + g.commandes.length, 0)} commandes
        </Badge>
      </div>

      {groupes.map((groupe) => {
        const isOpen = openCreneaux.has(groupe.creneau)
        const commandesEnAttente = groupe.commandes.filter(c => c.statut === 'EN_ATTENTE').length
        const commandesPrete = groupe.commandes.filter(c => c.statut === 'PRETE').length

        return (
          <Card key={groupe.creneau} className="overflow-hidden">
            <Collapsible open={isOpen} onOpenChange={() => toggleCreneau(groupe.creneau)}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-orange-100 p-3 rounded-lg">
                        <Clock className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {groupe.heureDebut} - {groupe.heureFin}
                        </CardTitle>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Package className="h-4 w-4" />
                            <span>{groupe.commandes.length} commande{groupe.commandes.length > 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Users className="h-4 w-4" />
                            <span>{groupe.total.toFixed(2)} €</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {commandesEnAttente > 0 && (
                        <Badge className="bg-yellow-100 text-yellow-700">
                          {commandesEnAttente} en attente
                        </Badge>
                      )}
                      {commandesPrete > 0 && (
                        <Badge className="bg-green-100 text-green-700">
                          {commandesPrete} prête{commandesPrete > 1 ? 's' : ''}
                        </Badge>
                      )}
                      {isOpen ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {groupe.commandes.map((commande) => (
                      <div
                        key={commande.id_commande}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">
                              #{commande.numero_commande}
                            </span>
                            <Badge className={getStatutColor(commande.statut)}>
                              {getStatutLabel(commande.statut)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {commande.client?.prenom} {commande.client?.nom}
                          </p>
                          <p className="text-sm font-semibold text-gray-900 mt-1">
                            {commande.montant_total.toFixed(2)} €
                          </p>
                        </div>

                        <div className="flex gap-2">
                          {commande.statut === 'EN_ATTENTE' && (
                            <Button
                              size="sm"
                              onClick={() => handleChangeStatut(commande.id_commande, 'EN_PREPARATION')}
                              className="bg-blue-500 hover:bg-blue-600"
                            >
                              Préparer
                            </Button>
                          )}
                          {commande.statut === 'EN_PREPARATION' && (
                            <Button
                              size="sm"
                              onClick={() => handleChangeStatut(commande.id_commande, 'PRETE')}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              Prête
                            </Button>
                          )}
                          {commande.statut === 'PRETE' && (
                            <Button
                              size="sm"
                              onClick={() => handleChangeStatut(commande.id_commande, 'RETIREE')}
                              className="bg-gray-500 hover:bg-gray-600"
                            >
                              Retirée
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        )
      })}
    </div>
  )
}
