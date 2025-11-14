"use client"

import React from "react"
import { useQRCode } from "@/hooks/use-qrcode"
import type { StoredQRCode } from "@/services/qrcode-persistence"

interface QRCodeDisplayProps {
  orderId: string | null
  onBack?: () => void
  children?: (state: ReturnType<typeof useQRCode>) => React.ReactNode
}

/**
 * Composant métier pour afficher un QR code
 * Encapsule la logique de récupération et gère l'affichage
 * 
 * Utilisation:
 * <QRCodeDisplay orderId={id}>
 *   {({ qrCode, isLoading, error }) => (
 *     // Afficher le QR code
 *   )}
 * </QRCodeDisplay>
 */
export function QRCodeDisplay({ orderId, onBack, children }: QRCodeDisplayProps) {
  const qrCodeState = useQRCode(orderId)

  return (
    <>
      {children ? (
        children(qrCodeState)
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50 flex flex-col items-center justify-center p-4">
          <p className="text-gray-600">Aucun composant enfant fourni</p>
        </div>
      )}
    </>
  )
}

export type QRCodeState = ReturnType<typeof useQRCode>
export type { StoredQRCode }
