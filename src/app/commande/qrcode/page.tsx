"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useQRCode } from "@/hooks/use-qrcode"
import { QRCodeView } from "@/components/qrcode/qrcode-view"
import type { QRCodeData } from "@/services/qrcode-persistence"

export default function QRCodePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const [qrData, setQrData] = useState<QRCodeData | null>(null)

  // Récupérer les données de la commande depuis le localStorage des commandes
  useEffect(() => {
    if (!orderId) return

    try {
      // Récupérer toutes les commandes du localStorage
      const commandesJson = localStorage.getItem('tchopmate-orders')
      if (!commandesJson) {
        console.warn('Aucune commande trouvée en localStorage')
        return
      }

      const commandes = JSON.parse(commandesJson)
      const commande = commandes.find((cmd: { id: string }) => cmd.id === orderId)

      if (commande) {
        // Construire les données du QR code à partir de la commande
        const qrCodeData: QRCodeData = {
          orderId: commande.id,
          orderNumber: commande.id || 'N/A',
          clientName: commande.clientName || 'Inconnu',
          clientPhone: commande.clientPhone || 'N/A',
          totalPrice: commande.total || 0,
          date: commande.date || new Date().toISOString(),
          items: (commande.items || []).map((item: { name: string; quantity: number; price: number }) => ({
            name: item.name || 'Plat inconnu',
            quantity: item.quantity || 1,
            price: item.price || 0,
          })),
        }

        setQrData(qrCodeData)
      } else {
        console.warn('Commande non trouvée:', orderId)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données de commande:', error)
    }
  }, [orderId])

  // Logique métier séparée
  const { qrCode, isLoading, error } = useQRCode(orderId, qrData)

  const handleBack = () => {
    router.push("/commandes")
  }

  // Affichage séparé (composant de présentation)
  return (
    <QRCodeView
      qrCode={qrCode}
      isLoading={isLoading}
      error={error}
      orderId={orderId || ""}
      onBack={handleBack}
    />
  )
}
