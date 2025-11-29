"use client"

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { CommandeScannerService } from '@/services/CommandeScanner'
import { Order as DomainOrder } from '@/core/entities/Order'

export default function ScanCallbackPage() {
  const router = useRouter()
  const params = useSearchParams()
  const routeParams = useParams()
  const [order, setOrder] = useState<DomainOrder | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        // scanapp may return the scanned data under 'scanResult' or 'data' or 'payload'
        const s = params.get('scanResult') || params.get('data') || params.get('payload') || params.get('result') || params.get('q') || ''
        if (!s) {
          setError('Pas de résultat de scan fourni')
          return
        }

        // Decode URI component
        const decoded = decodeURIComponent(s)

        // If it's JSON object or string, ensure we send a string to processScan
        let scanJsonString: string
        if (typeof decoded === 'string') scanJsonString = decoded
        else scanJsonString = JSON.stringify(decoded)

        // Appel au webhook serveur (recommandé) pour traitement et vérification côté serveur
        try {
          const res = await fetch('/api/scan-callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scanResult: scanJsonString, gerantId: routeParams.id }),
          })
          const data = await res.json()
          if (!res.ok || !data.ok) {
            setError(data.error || 'Erreur serveur lors du traitement du scan')
            return
          }
          // Le serveur renvoie l'ordre sous forme d'objet désérialisé
          setOrder({ ...data.order } as any)
        } catch (e: any) {
          setError(String(e?.message || e))
        }
      } catch (e: any) {
        setError(String(e?.message || e))
      } finally {
        setLoading(false)
      }
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" /> Retour
            </Button>
            <h1 className="text-xl font-bold">Résultat du scan</h1>
          </div>
          <div>
            <Button onClick={() => router.push(`/resto/${routeParams.id || ''}/orders?updatedOrderId=${order?.id || ''}`)} variant="outline" size="sm">Retour aux commandes</Button>
          </div>
        </div>

        {loading && <div className="bg-white rounded-lg p-6 shadow-sm">Chargement…</div>}

        {error && <div className="bg-white rounded-lg p-6 shadow-sm text-red-600">Erreur: {error}</div>}

        {order && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold">Commande scannée: #{order.id}</h2>
                <p className="text-sm text-gray-500">Statut: {order.status}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-2">
                {order.items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center text-sm">{it.platNom?.charAt(0) ?? 'P'}</div>
                      <div>
                        <div className="font-semibold">{it.platNom}</div>
                        <div className="text-xs text-gray-500">x{it.quantite} — {it.prixUnitaire} FCFA</div>
                      </div>
                    </div>
                    <div className="font-semibold text-gray-900">{it.calculateSubtotal()} FCFA</div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">Total</div>
                  <div className="text-lg font-bold text-orange-600">{order.totalPrice} FCFA</div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <Button variant="outline" onClick={() => router.push(`/resto/${routeParams.id || ''}/orders?updatedOrderId=${order?.id || ''}`)}>
                Retour aux commandes
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
