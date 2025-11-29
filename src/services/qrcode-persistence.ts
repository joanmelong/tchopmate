import { QRCodeService, type QRCodeData } from './qrcode'

export type { QRCodeData }

export type GeneratedQRCode = {
  orderId: string
  qrCodeDataUrl: string
  data: QRCodeData
}

/**
 * Service de génération de QR codes
 * Le QR code est un moyen de présentation des données d'une commande
 * Aucune persistance en BD ou localStorage
 * Génération à la demande uniquement
 */
export class QRCodePersistenceService {
  /**
   * Génère un QR code pour une commande
   * Le QR code est généré à chaque appel (pas de cache)
   * 
   * @param orderId - ID de la commande
   * @param qrData - Données à encoder dans le QR code
   * @returns Promise<GeneratedQRCode> - Le QR code généré
   */
  static async generateQRCode(orderId: string, qrData: QRCodeData): Promise<GeneratedQRCode> {
    try {
      console.log('Génération du QR code pour commande:', orderId)
      
      // Générer le QR code via le service
      const qrCodeDataUrl = await QRCodeService.generateQRCode(qrData)

      // Retourner le QR code généré
      const generatedQRCode: GeneratedQRCode = {
        orderId,
        qrCodeDataUrl,
        data: qrData,
      }

      console.log('QR code généré avec succès pour commande:', orderId)
      return generatedQRCode
    } catch (error) {
      console.error('Erreur génération QR code:', error)
      throw error
    }
  }

  /**
   * Regénère un QR code à chaque affichage (pas de cache)
   * Utile pour afficher le QR code à la demande
   * 
   * @param orderId - ID de la commande
   * @param qrData - Données à encoder dans le QR code
   * @returns Promise<GeneratedQRCode>
   */
  static async refreshQRCode(orderId: string, qrData: QRCodeData): Promise<GeneratedQRCode> {
    // Même implémentation que generateQRCode
    // Mais nommé différemment pour clarifier l'intention
    return this.generateQRCode(orderId, qrData)
  }
}
