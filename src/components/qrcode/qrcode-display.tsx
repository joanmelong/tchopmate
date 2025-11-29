"use client"

import React from "react"
import { useQRCode } from "@/hooks/use-qrcode"
import type { GeneratedQRCode, QRCodeData } from "@/services/qrcode-persistence"

interface QRCodeDisplayProps {
  orderId: string | null
  qrData: QRCodeData | null
  onBack?: () => void
  children?: (state: ReturnType<typeof useQRCode>) => React.ReactNode
}

/**
 * Composant métier pour afficher un QR code
 * Encapsule la logique de génération et gère l'affichage
 * Le QR code est généré à la demande, pas de persistance
 * 
 * Utilisation:
 * <QRCodeDisplay orderId={id} qrData={data}>
 *   {({ qrCode, isLoading, error }) => (
 *     // Afficher le QR code
 *   )}
 * </QRCodeDisplay>
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function QRCodeDisplay({ orderId, qrData, onBack: _onBack, children }: QRCodeDisplayProps) {
  const qrCodeState = useQRCode(orderId, qrData)

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
export type { GeneratedQRCode, QRCodeData }
