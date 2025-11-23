import { IQRCodeRepository } from '@/core/interfaces/IQRCodeRepository';
import { QRCodeDTO } from '@/core/entities/QRCode';

export class GenerateQRCode {
  constructor(private qrCodeRepository: IQRCodeRepository) {}

  async execute(orderId: string): Promise<QRCodeDTO> {
    if (!orderId || orderId.trim() === '') {
      throw new Error('Order ID is required');
    }

    // Générer le QR code
    const qrCode = await this.qrCodeRepository.generate(orderId);

    return qrCode;
  }
}