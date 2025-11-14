import { QRCodeService, type QRCodeData } from './qrcode'

export type { QRCodeData }

export type StoredQRCode = {
  orderId: string
  qrCodeDataUrl: string
  data: QRCodeData
  createdAt: string
  updatedAt: string
}

/**
 * Service de persistance des QR codes
 * Workflow: Frontend -> localStorage -> API/BD
 */
export class QRCodePersistenceService {
  private static readonly STORAGE_KEY = 'tchopmate-qrcodes'

  /**
   * Génère et sauvegarde un QR code
   * Workflow: Génère -> localStorage -> API
   * @param orderId - ID de la commande
   * @param qrData - Données pour générer le QR code
   * @returns Promise<StoredQRCode> - Le QR code généré et sauvegardé
   */
  static async generateAndSaveQRCode(orderId: string, qrData: QRCodeData): Promise<StoredQRCode> {
    try {
      // 1. Générer le QR code
      console.log('Génération du QR code pour commande:', orderId)
      const qrCodeDataUrl = await QRCodeService.generateQRCode(qrData)

      // 2. Créer l'objet QR code à stocker
      const storedQRCode: StoredQRCode = {
        orderId,
        qrCodeDataUrl,
        data: qrData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // 3. Sauvegarder dans localStorage
      this.saveToLocalStorage(storedQRCode)
      console.log('QR code sauvegardé dans localStorage:', orderId)

      // 4. Sauvegarder dans la BD via API (asynchrone, non-bloquant)
      this.saveToAPI(storedQRCode).catch(error => {
        console.warn('Erreur sauvegarde QR code en BD:', error)
        // Ne pas bloquer si l'API échoue
      })

      return storedQRCode
    } catch (error) {
      console.error('Erreur génération QR code:', error)
      throw error
    }
  }

  /**
   * Récupère un QR code depuis le localStorage
   * @param orderId - ID de la commande
   * @returns StoredQRCode | null
   */
  static getFromLocalStorage(orderId: string): StoredQRCode | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      if (!data) return null

      const qrcodes: StoredQRCode[] = JSON.parse(data)
      return qrcodes.find(qr => qr.orderId === orderId) || null
    } catch (error) {
      console.warn('Erreur lecture localStorage QR codes:', error)
      return null
    }
  }

  /**
   * Récupère tous les QR codes depuis le localStorage
   * @returns StoredQRCode[]
   */
  static getAllFromLocalStorage(): StoredQRCode[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      if (!data) return []

      return JSON.parse(data)
    } catch (error) {
      console.warn('Erreur lecture localStorage QR codes:', error)
      return []
    }
  }

  /**
   * Sauvegarde un QR code dans le localStorage
   * @param qrCode - Le QR code à sauvegarder
   */
  private static saveToLocalStorage(qrCode: StoredQRCode): void {
    try {
      const existing = this.getAllFromLocalStorage()
      
      // Supprimer l'ancien si existe
      const filtered = existing.filter(qr => qr.orderId !== qrCode.orderId)
      
      // Ajouter le nouveau
      filtered.unshift(qrCode)
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered))
    } catch (error) {
      console.warn('Erreur sauvegarde localStorage QR codes:', error)
    }
  }

  /**
   * Sauvegarde un QR code dans la BD via API
   * @param qrCode - Le QR code à sauvegarder
   */
  private static async saveToAPI(qrCode: StoredQRCode): Promise<void> {
    try {
      // Récupérer le token
      const { supabase } = await import('@/lib/supabaseClient')
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      if (!token) {
        console.warn('Pas de token pour sauvegarder le QR code en BD')
        return
      }

      // Appeler l'API
      const res = await fetch('/api/qrcodes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: qrCode.orderId,
          qrCodeDataUrl: qrCode.qrCodeDataUrl,
          data: qrCode.data,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        console.warn('Erreur API sauvegarde QR code:', data?.error)
        return
      }

      console.log('QR code sauvegardé en BD')
    } catch (error) {
      console.warn('Erreur API QR code:', error)
    }
  }

  /**
   * Récupère les QR codes depuis la BD via API et synchronise localStorage
   * Workflow: BD -> localStorage
   * @returns Promise<StoredQRCode[]>
   */
  static async syncFromAPI(): Promise<StoredQRCode[]> {
    try {
      const { supabase } = await import('@/lib/supabaseClient')
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      if (!token) {
        console.log('Pas de token pour récupérer les QR codes')
        return this.getAllFromLocalStorage()
      }

      const res = await fetch('/api/qrcodes', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await res.json()

      if (!res.ok) {
        console.warn('Erreur API récupération QR codes:', data?.error)
        return this.getAllFromLocalStorage()
      }

      const qrcodes = data.qrcodes || []

      // Synchroniser avec localStorage
      if (qrcodes.length > 0) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(qrcodes))
        console.log('QR codes synchronisés depuis API vers localStorage')
      }

      return qrcodes
    } catch (error) {
      console.warn('Erreur synchronisation API QR codes:', error)
      return this.getAllFromLocalStorage()
    }
  }

  /**
   * Supprime un QR code
   * @param orderId - ID de la commande
   */
  static async deleteQRCode(orderId: string): Promise<void> {
    try {
      // 1. Supprimer du localStorage
      const existing = this.getAllFromLocalStorage()
      const filtered = existing.filter(qr => qr.orderId !== orderId)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered))

      // 2. Supprimer de l'API
      const { supabase } = await import('@/lib/supabaseClient')
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      if (token) {
        await fetch(`/api/qrcodes/${orderId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }).catch(error => console.warn('Erreur suppression API QR code:', error))
      }
    } catch (error) {
      console.warn('Erreur suppression QR code:', error)
    }
  }
}
