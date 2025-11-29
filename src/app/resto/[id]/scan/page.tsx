"use client"

import React, { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Eye, CheckCircle } from 'lucide-react'
import { Scanner } from '@/components/qrcode/scanner'
import { CommandeScannerService } from '@/services/CommandeScanner'
import { Order as DomainOrder, OrderStatus } from '@/core/entities/Order'
import Image from 'next/image'

export default function ScanPage() {
  const router = useRouter()
  const params = useParams()
  const gerantId = params.id as string

  const [scannedOrder, setScannedOrder] = useState<DomainOrder | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const onScan = async (decodedText: string) => {
    setProcessing(true)
    setError(null)
    try {
      const domainOrder = await CommandeScannerService.processScannedQRCode(decodedText)
      if (!domainOrder) {
        setError('Commande non trouvée ou erreur lors du traitement')
        return
      }
      setScannedOrder(domainOrder)
    } catch (e: any) {
      setError(String(e?.message || e))
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" /> Retour
            </Button>
            <h1 className="text-xl font-bold">Scanner QR - Validation commande</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={() => router.push(`/resto/${gerantId}/orders`)} variant="outline" size="sm">
              Retour aux commandes
            </Button>
          </div>
        </div>

        {!scannedOrder ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h2 className="font-semibold mb-2">Scanner le code</h2>
              <p className="text-sm text-gray-600 mb-4">Présentez le QR code au scanner ci-dessous</p>
              <div className="bg-gray-100 p-4 rounded">
                <Scanner onScan={onScan} onCancel={() => router.push(`/resto/${gerantId}/orders`)} />
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h2 className="font-semibold mb-2">Info</h2>
              <p className="text-sm text-gray-600">Après un scan réussi, la commande sera automatiquement marquée comme livrée et ses détails s'afficheront ici.</p>
              {processing && <p className="mt-2 text-sm text-orange-600">Traitement en cours...</p>}
              {error && <p className="mt-2 text-sm text-red-600">Erreur: {error}</p>}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold">Commande scannée: #{scannedOrder.id}</h2>
                <p className="text-sm text-gray-500">Statut: {scannedOrder.status}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Button variant={scannedOrder.status === OrderStatus.RETIREE ? 'ghost' : 'default'} size="sm" className="bg-green-500 text-white">Livrée</Button>
                <Button onClick={() => router.push(`/resto/${gerantId}/orders`)} variant="outline">Retour aux commandes</Button>
                <Button onClick={() => setScannedOrder(null)} variant="ghost">Scanner une autre</Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-2">
                {scannedOrder.items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center text-sm">
                        {it.platNom?.charAt(0) ?? 'P'}
                      </div>
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
                  <div className="text-lg font-bold text-orange-600">{scannedOrder.totalPrice} FCFA</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
