import QRCode from 'qrcode'

export type QRCodeData = {
  orderId: string
  orderNumber: string
  totalPrice: number
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  date: string
  clientName: string
  clientPhone: string
}

/**
 * Service pour générer des QR codes contenant les données complètes de la commande
 */
export class QRCodeService {
  /**
   * Génère un QR code à partir des données de la commande
   * @param data - Les données de la commande
   * @returns Promise<string> - L'URL de l'image QR code en base64
   */
  static async generateQRCode(data: QRCodeData): Promise<string> {
    try {
      // Créer une chaîne JSON compressée avec les données essentielles
      const qrData = JSON.stringify({
        id: data.orderId,
        num: data.orderNumber,
        total: data.totalPrice,
        date: data.date,
        client: data.clientName,
        phone: data.clientPhone,
        items: data.items.map(item => ({
          n: item.name,
          q: item.quantity,
          p: item.price
        }))
      })

      // Générer le QR code en data URL
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })

      return qrCodeDataUrl
    } catch (error) {
      console.error('Erreur génération QR code:', error)
      throw new Error('Impossible de générer le QR code')
    }
  }

  /**
   * Décode les données d'un QR code
   * @param jsonString - Les données JSON du QR code
   * @returns QRCodeData - Les données décodées
   */
  static decodeQRCode(jsonString: string): QRCodeData {
    try {
      const data = JSON.parse(jsonString)
      return {
        orderId: data.id,
        orderNumber: data.num,
        totalPrice: data.total,
        date: data.date,
        clientName: data.client,
        clientPhone: data.phone,
        items: data.items.map((item: { n: string; q: number; p: number }) => ({
          name: item.n,
          quantity: item.q,
          price: item.p
        }))
      }
    } catch (error) {
      console.error('Erreur décodage QR code:', error)
      throw new Error('Impossible de décoder le QR code')
    }
  }

  /**
   * Valide les données du QR code
   * @param data - Les données à valider
   * @returns boolean - True si les données sont valides
   */
  static validateQRData(data: QRCodeData): boolean {
    return (
      !!data.orderId &&
      !!data.orderNumber &&
      data.totalPrice > 0 &&
      Array.isArray(data.items) &&
      data.items.length > 0 &&
      !!data.clientName
    )
  }
}
