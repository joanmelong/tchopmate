// ============================================
// TEST 3 : QRCode Use Cases
// ============================================
// File: tests/unit/use-cases/qrcode/QRCodeUseCases.test.ts

import { GenerateQRCode } from '@/core/use-cases/qr-code/GenerateQRCode'
import { ValidateQRCode } from '@/core/use-cases/qr-code/ValidateQRCode'
import { IQRCodeRepository } from '@/core/interfaces/IQRCodeRepository'
import { QRCodeDTO } from '@/core/entities/QRCode'

// Mock QRCode Repository
class MockQRCodeRepo implements IQRCodeRepository {
  public qrCodes: QRCodeDTO[] = []

  async generate(orderId: string): Promise<QRCodeDTO> {
    // Vérifier si un QR code existe déjà
    if (this.qrCodes.some(qr => qr.order_id === orderId)) {
      throw new Error('QR code already exists for this order')
    }

    const code = `QR-${Math.random().toString(36).substring(7).toUpperCase()}`
    
    const qrCode: QRCodeDTO = {
      id: `qr-${Math.random()}`,
      order_id: orderId,
      code: code,
      expires_at: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      used: false,
      created_at: new Date()
    }

    this.qrCodes.push(qrCode)
    return qrCode
  }

  async findByCode(code: string): Promise<QRCodeDTO | null> {
    return this.qrCodes.find(qr => qr.code === code) || null
  }

  async markAsUsed(code: string): Promise<void> {
    const qr = this.qrCodes.find(qr => qr.code === code)
    if (qr) {
      qr.used = true
      qr.used_at = new Date()
    }
  }
}

describe('QRCode Use Cases', () => {
  let repo: MockQRCodeRepo

  beforeEach(() => {
    repo = new MockQRCodeRepo()
  })

  // ========== GenerateQRCode Tests ==========
  
  describe('GenerateQRCode', () => {
    test('should generate QR code for order', async () => {
      const useCase = new GenerateQRCode(repo)
      
      const result = await useCase.execute('order1')

      expect(result).toBeDefined()
      expect(result.order_id).toBe('order1')
      expect(result.code).toMatch(/^QR-/)
      expect(result.used).toBe(false)
      expect(result.expires_at).toBeInstanceOf(Date)
    })

    test('should set expiration to 30 minutes', async () => {
      const useCase = new GenerateQRCode(repo)
      
      const before = Date.now()
      const result = await useCase.execute('order1')
      const after = Date.now()

      const expectedExpiry = before + 30 * 60 * 1000
      const actualExpiry = result.expires_at.getTime()

      expect(actualExpiry).toBeGreaterThanOrEqual(expectedExpiry - 1000)
      expect(actualExpiry).toBeLessThanOrEqual(after + 30 * 60 * 1000 + 1000)
    })

    test('should reject duplicate QR code generation', async () => {
      const useCase = new GenerateQRCode(repo)
      
      await useCase.execute('order1')
      
      await expect(useCase.execute('order1'))
        .rejects.toThrow('QR code already exists')
    })

    test('should generate unique codes for different orders', async () => {
      const useCase = new GenerateQRCode(repo)
      
      const qr1 = await useCase.execute('order1')
      const qr2 = await useCase.execute('order2')

      expect(qr1.code).not.toBe(qr2.code)
    })
  })

  // ========== ValidateQRCode Tests ==========
  
  describe('ValidateQRCode', () => {
    test('should validate valid QR code', async () => {
      const generateUseCase = new GenerateQRCode(repo)
      const validateUseCase = new ValidateQRCode(repo)
      
      const generated = await generateUseCase.execute('order1')
      
      const result = await validateUseCase.execute(generated.code)

      expect(result.valid).toBe(true)
      expect(result.order_id).toBe('order1')
    })

    test('should reject expired QR code', async () => {
      const validateUseCase = new ValidateQRCode(repo)
      
      // Créer un QR code expiré
      const expiredQR: QRCodeDTO = {
        id: 'qr1',
        order_id: 'order1',
        code: 'QR-EXPIRED',
        expires_at: new Date(Date.now() - 1000), // Expiré il y a 1 seconde
        used: false,
        created_at: new Date()
      }
      repo.qrCodes.push(expiredQR)

      await expect(validateUseCase.execute('QR-EXPIRED'))
        .rejects.toThrow('QR code has expired')
    })

    test('should reject already used QR code', async () => {
      const validateUseCase = new ValidateQRCode(repo)
      
      // Créer un QR code déjà utilisé
      const usedQR: QRCodeDTO = {
        id: 'qr1',
        order_id: 'order1',
        code: 'QR-USED',
        expires_at: new Date(Date.now() + 30 * 60 * 1000),
        used: true,
        used_at: new Date(),
        created_at: new Date()
      }
      repo.qrCodes.push(usedQR)

      await expect(validateUseCase.execute('QR-USED'))
        .rejects.toThrow('QR code has already been used')
    })

    test('should reject invalid QR code', async () => {
      const validateUseCase = new ValidateQRCode(repo)
      
      await expect(validateUseCase.execute('INVALID-CODE'))
        .rejects.toThrow('Invalid QR code')
    })

    test('should mark QR code as used after validation', async () => {
      const generateUseCase = new GenerateQRCode(repo)
      const validateUseCase = new ValidateQRCode(repo)
      
      const generated = await generateUseCase.execute('order1')
      
      await validateUseCase.execute(generated.code)

      const qr = await repo.findByCode(generated.code)
      expect(qr?.used).toBe(true)
      expect(qr?.used_at).toBeInstanceOf(Date)
    })
  })
})