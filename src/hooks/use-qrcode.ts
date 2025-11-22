import { useEffect, useState } from "react"
import { QRCodePersistenceService, type QRCodeData, type GeneratedQRCode } from "@/services/qrcode-persistence"

export interface UseQRCodeState {
  qrCode: GeneratedQRCode | null
  isLoading: boolean
  error: string | null
  orderId: string
}

/**
 * Hook pour générer et afficher les QR codes à la demande
 * Le QR code est généré à chaque appel du composant (pas de cache)
 * Pas de persistance en BD ou localStorage
 */
export function useQRCode(orderId: string | null, qrData: QRCodeData | null): UseQRCodeState {
  const [qrCode, setQrCode] = useState<GeneratedQRCode | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId || !qrData) {
      setError("ID de commande ou données manquants")
      setIsLoading(false)
      return
    }

    const generateQRCode = async () => {
      try {
        console.log("Génération du QR code pour commande:", orderId)
        
        // Générer le QR code à la demande (pas de cache)
        const generatedQRCode = await QRCodePersistenceService.generateQRCode(orderId, qrData)

        console.log("QR code généré avec succès pour commande:", orderId)
        setQrCode(generatedQRCode)
        setError(null)
      } catch (e) {
        console.error("Erreur lors de la génération du QR code:", e)
        setError("Impossible de générer le QR code")
        setQrCode(null)
      } finally {
        setIsLoading(false)
      }
    }

    generateQRCode()
  }, [orderId, qrData])

  return {
    qrCode,
    isLoading,
    error,
    orderId: orderId || "",
  }
}
