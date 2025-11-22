/**
 * Service: Générateur de QR Code
 * Couche: Infrastructure
 */

import QRCode from 'qrcode';
import { IQRCodeGenerator } from '@/core/use-cases/qr-code/GenerateOrderQRCodeUseCase';

export class QRCodeGeneratorService implements IQRCodeGenerator {
  async generate(data: string): Promise<string> {
    try {
      // Génère un QR code en format Data URL (base64)
      const qrCodeDataUrl = await QRCode.toDataURL(data, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      return qrCodeDataUrl;
    } catch (error) {
      throw new Error(`Erreur lors de la génération du QR code: ${error}`);
    }
  }
}
