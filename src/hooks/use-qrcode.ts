import { useEffect, useState } from "react"
import { QRCodePersistenceService, type StoredQRCode } from "@/services/qrcode-persistence"

export interface UseQRCodeState {
  qrCode: StoredQRCode | null
  isLoading: boolean
  error: string | null
  orderId: string
}

/**
 * Hook pour gérer la récupération et l'affichage des QR codes
 * Sépare complètement la logique métier de la vue
 */
export function useQRCode(orderId: string | null): UseQRCodeState {
  const [qrCode, setQrCode] = useState<StoredQRCode | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId) {
      setError("ID de commande manquant")
      setIsLoading(false)
      return
    }

    const fetchQRCode = async () => {
      try {
        console.log("Recherche du QR code pour commande:", orderId)
        
        // 1. Chercher dans le localStorage d'abord (cache local)
        let storedQR = QRCodePersistenceService.getFromLocalStorage(orderId)

        if (storedQR) {
          console.log("QR code trouvé dans localStorage")
          setQrCode(storedQR)
          setIsLoading(false)
          return
        }

        // 2. Si pas en cache, synchroniser depuis l'API/BD
        console.log("QR code non trouvé en cache, synchronisation depuis API...")
        const qrcodes = await QRCodePersistenceService.syncFromAPI()
        const found = qrcodes.find(qr => qr.orderId === orderId)

        if (found) {
          console.log("QR code récupéré de l'API et mis en cache")
          setQrCode(found)
        } else {
          console.warn("QR code non trouvé pour cette commande")
          setError("QR code non trouvé pour cette commande")
        }
      } catch (e) {
        console.error("Erreur lors de la récupération du QR code:", e)
        setError("Impossible de charger le QR code")
      } finally {
        setIsLoading(false)
      }
    }

    fetchQRCode()
  }, [orderId])

  return {
    qrCode,
    isLoading,
    error,
    orderId: orderId || "",
  }
}
