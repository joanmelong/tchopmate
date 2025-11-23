import { IQRCodeRepository } from '@/core/interfaces/IQRCodeRepository';

export interface QRCodeValidationResult {
  valid: boolean;
  order_id?: string;
  message?: string;
}

export class ValidateQRCode {
  constructor(private qrCodeRepository: IQRCodeRepository) {}

  async execute(code: string): Promise<QRCodeValidationResult> {
    if (!code || code.trim() === '') {
      throw new Error('QR code is required');
    }

    // Trouver le QR code
    const qrCode = await this.qrCodeRepository.findByCode(code);

    if (!qrCode) {
      throw new Error('Invalid QR code');
    }

    // Vérifier s'il est expiré
    if (new Date() > qrCode.expires_at) {
      throw new Error('QR code has expired');
    }

    // Vérifier s'il a déjà été utilisé
    if (qrCode.used) {
      throw new Error('QR code has already been used');
    }

    // Marquer comme utilisé
    await this.qrCodeRepository.markAsUsed(code);

    return {
      valid: true,
      order_id: qrCode.order_id,
      message: 'QR code validé avec succès'
    };
  }
}