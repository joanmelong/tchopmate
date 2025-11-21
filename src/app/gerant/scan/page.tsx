'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

export default function GerantScanPage() {
  const [qrText, setQrText] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/orders/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrData: qrText })
      })

      const data = await res.json()
      if (!res.ok) {
        setMessage(data?.error || 'Erreur lors de la validation')
      } else {
        setMessage(`Commande ${data.orderId} validée avec succès`)
        // Optionnel: rediriger vers la liste des commandes
        // router.push('/resto/admin/commandes')
      }
    } catch (err: any) {
      setMessage(err?.message ?? 'Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Scanner un QR - Interface Gérant</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">Collez ici le contenu du QR scanné (JSON) ou la chaîne encodée :</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input as="textarea" value={qrText} onChange={(e: any) => setQrText(e.target.value)} className="h-40" />
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>{loading ? 'Validation...' : 'Valider la commande'}</Button>
                <Button variant="ghost" onClick={() => { setQrText(''); setMessage(null) }}>Effacer</Button>
              </div>
            </form>

            {message && (
              <div className="mt-4 p-3 bg-white border rounded">{message}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
