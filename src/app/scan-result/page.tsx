"use client"

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function ScanResultPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [order, setOrder] = useState<any | null>(null)
  const [marking, setMarking] = useState(false)
  const [watching, setWatching] = useState(false)
  const [watchMessage, setWatchMessage] = useState<string | null>(null)
  const watchAbortRef = React.useRef<AbortController | null>(null)
  const dirHandleRef = React.useRef<any | null>(null)
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const run = async () => {
      const text = searchParams.get('text') || searchParams.get('scanResult') || searchParams.get('data') || searchParams.get('payload') || ''
      const id = searchParams.get('id') || ''
      if (!text) return

      setLoading(true)
      setError(null)
      try {
        // send to server for processing
        const res = await fetch('/api/scan-callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scanResult: text, gerantId: id }),
        })
        const data = await res.json()
        if (!res.ok || !data.ok) {
          setError(data.error || 'Erreur serveur')
          return
        }

        setOrder(data.order)

        // après 1.5s rediriger vers la page des commandes du gérant si id fourni
        // store in session storage so the orders page can display the scanned order without hitting the DB
        try {
          sessionStorage.setItem('lastScannedOrder', JSON.stringify(data.order))
        } catch (e) {
          // ignore
        }
        // Ne pas rediriger automatiquement : l'utilisateur peut interagir avec la commande scannée
      } catch (e: any) {
        setError(String(e?.message || e))
      } finally {
        setLoading(false)
      }
    }

    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Marque la commande scannée comme livrée via CommandeGerantService
  const handleMarkAsDelivered = async () => {
    if (!order || !order.id) return
    setMarking(true)
    setError(null)
    try {
      const mod = await import('@/services/CommandeGerant')
      const ok = await mod.CommandeGerantService.updateOrderStatus(String(order.id), 'livree')
      if (!ok) throw new Error('Impossible de marquer la commande comme livrée')
      // Update local UI
      const updated = { ...order, status: 'livrée' }
      setOrder(updated)
      try { sessionStorage.setItem('lastScannedOrder', JSON.stringify(updated)) } catch (e) { }
      // Redirect back to orders page if we have an id param
      const id = searchParams.get('id')
      if (id) {
        router.push(`/resto/${id}/orders?updatedOrderId=${encodeURIComponent(String(order.id))}`)
      }
    } catch (e: any) {
      setError(String(e?.message || e))
    } finally {
      setMarking(false)
    }
  }

  // Gère l'input fichier (fallback si File System Access API non disponible)
  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    setLoading(true)
    setError(null)
    try {
      const text = await f.text()
      // Vérifier que le texte contient du JSON valide
      try {
        JSON.parse(text)
      } catch (err) {
        setError('Le fichier ne contient pas de JSON valide')
        return
      }
      const res = await fetch('/api/scan-callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanResult: text, gerantId: searchParams.get('id') || '' }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) { setError(data.error || 'Erreur serveur'); return }
      setOrder(data.order)
      try { sessionStorage.setItem('lastScannedOrder', JSON.stringify(data.order)) } catch (e) { }
    } catch (err: any) { setError(String(err?.message || err)) } finally { setLoading(false) }
  }

  // Ouvre un dialog picker de fichier (fallback si showDirectoryPicker pas dispo)
  const handleShowPicker = async () => {
    try {
      // si l'API showOpenFilePicker est dispo, l'utiliser (ne fonctionne pas partout)
      if ((window as any).showOpenFilePicker) {
        const handles: any[] = await (window as any).showOpenFilePicker({ multiple: false, types: [{ description: 'Text files', accept: { 'text/plain': ['.txt', '.text'] } }] })
        const handle = handles && handles.length > 0 ? handles[0] : null
        if (!handle) return
        const f = await handle.getFile()
        const text = await f.text()
        // Vérifier que le texte contient du JSON valide
        try {
          JSON.parse(text)
        } catch (err) {
          setError('Le fichier sélectionné ne contient pas de JSON valide')
          return
        }
        setLoading(true)
        const res = await fetch('/api/scan-callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scanResult: text, gerantId: searchParams.get('id') || '' }),
        })
        const data = await res.json()
        if (!res.ok || !data.ok) { setError(data.error || 'Erreur serveur'); return }
        setOrder(data.order)
        try { sessionStorage.setItem('lastScannedOrder', JSON.stringify(data.order)) } catch (e) { }
        return
      }

      // Fallback : cliquer sur l'input (ouvre le picker natif pour TOUS les navigateurs)
      if (inputRef.current) {
        inputRef.current.value = ''
        inputRef.current.click()
      }
    } catch (err: any) { setError(String(err?.message || err)) } finally { setLoading(false) }
  }

  // Surveille le dossier Téléchargements (si supported)
  const startWatchingDownloads = async () => {
    if (!(window as any).showDirectoryPicker) {
      setWatchMessage('Votre navigateur ne supporte pas la File System Access API. Utilisez le bouton "Choisir un fichier".')
      return
    }
    setWatching(true)
    setWatchMessage('Demande d’accès au dossier Téléchargements...')
    try {
      // Demande le dossier à l’utilisateur
      const dirHandle: any = await (window as any).showDirectoryPicker()
      dirHandleRef.current = dirHandle
      setWatchMessage('Accès accordé. Surveillance du dossier en cours...')

      // Lire le contenu du dossier et surveiller les nouveaux fichiers
      const seen = new Map<string, number>()
      ;(async () => {
        watchAbortRef.current = new AbortController()
        while (!watchAbortRef.current?.signal?.aborted) {
          for await (const [name, handle] of dirHandle.entries()) {
            if (handle.kind === 'file' && (name.endsWith('.txt') || name.endsWith('.json'))) {
              const file = await handle.getFile()
              const last = seen.get(name) || 0
              if (file.lastModified > last) {
                // Nouvel ou modifié — traiter
                seen.set(name, file.lastModified)
                const text = await file.text()
                // Verifier format JSON
                try {
                  JSON.parse(text)
                } catch (err) {
                  setError('Le fichier détecté ne contient pas de JSON valide')
                  setLoading(false)
                  continue
                }
                setWatchMessage(`Fichier détecté: ${name}, traitement...`)
                setLoading(true)
                try {
                  const res = await fetch('/api/scan-callback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ scanResult: text, gerantId: searchParams.get('id') || '' }),
                  })
                  const data = await res.json()
                  if (!res.ok || !data.ok) { setError(data.error || 'Erreur serveur'); setLoading(false); continue }
                  setOrder(data.order)
                  try { sessionStorage.setItem('lastScannedOrder', JSON.stringify(data.order)) } catch (e) { }
                  // Ne pas rediriger automatiquement après surveillance de dossier — reste sur la page pour permettre l'action
                } catch (err: any) { setError(String(err?.message || err)) } finally { setLoading(false) }
              }
            }
          }
          // Pause un court instant
          await new Promise((r) => setTimeout(r, 2000))
        }
      })()
    } catch (e: any) {
      setWatchMessage(String(e?.message || e))
      setWatching(false)
    }
  }

  const stopWatchingDownloads = () => {
    if (watchAbortRef.current) {
      watchAbortRef.current.abort()
      watchAbortRef.current = null
    }
    dirHandleRef.current = null
    setWatching(false)
    setWatchMessage('Surveillance arrêtée')
  }

  // Cleanup au démontage
  React.useEffect(() => {
    return () => {
      stopWatchingDownloads()
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" /> Retour
            </Button>
            <h1 className="text-xl font-bold">Résultat du scan</h1>
          </div>
        </div>

        {loading && (
          <div className="bg-white rounded-lg p-6 shadow-sm text-center">Traitement du scan…</div>
        )}

        {error && (
          <div className="bg-white rounded-lg p-6 shadow-sm text-red-600">Erreur : {error}</div>
        )}

        {order && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="font-semibold text-lg mb-3">Commande traitée : #{order.id}</div>
            <div className="text-sm text-gray-600 mb-4">Statut: {order.status}</div>

            <div className="grid gap-3">
              {order.items?.map((it: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center text-sm">{it.platNom?.charAt(0) ?? 'P'}</div>
                    <div>
                      <div className="font-semibold">{it.platNom}</div>
                      <div className="text-xs text-gray-500">x{it.quantite} — {it.prixUnitaire} FCFA</div>
                    </div>
                  </div>
                  <div className="font-semibold text-gray-900">{it.quantite * it.prixUnitaire} FCFA</div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t flex justify-between items-center">
              <div className="text-sm text-gray-500">Total</div>
              <div className="text-lg font-bold text-orange-600">{order.totalPrice} FCFA</div>
            </div>
            <div className="pt-3 flex gap-2">
              {order.status !== 'livrée' && (
                <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={handleMarkAsDelivered} disabled={marking || loading}>
                  {marking ? 'Traitement...' : 'Marquer livrée'}
                </Button>
              )}
            </div>
          </div>
        )}

        {!loading && !order && !error && (
          <div>
            <div className="bg-white rounded-lg p-6 shadow-sm text-center mb-4">Aucun QR scanné - Attente du résultat</div>

            {/* Charger un fichier téléchargé */}
            <div className="bg-white rounded-lg p-6 shadow-sm mb-4">
              <div className="mb-3 font-semibold">Charger le fichier téléchargé</div>
              <input ref={inputRef} id="file-input" type="file" accept=".txt,.json" className="mb-3 hidden" onChange={handleFileInput} />
              <div>
                <Button onClick={handleShowPicker} className="mr-2">Choisir un fichier</Button>
                {!watching ? (
                  <Button onClick={startWatchingDownloads} variant="outline" className="mr-2">Surveiller dossier Téléchargements</Button>
                ) : (
                  <Button onClick={stopWatchingDownloads} variant="destructive" className="mr-2">Arrêter surveillance</Button>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-2">Si ton navigateur supporte la File System Access API, tu peux autoriser l'accès au dossier Téléchargements et l'app détectera automatiquement le fichier exporté par scanApp.</div>
              {watchMessage && <div className="text-xs text-gray-500 mt-2">{watchMessage}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
