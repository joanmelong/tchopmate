/**
 * Hook: useOrderQRCode
 * Couche: Présentation (Pont UI ↔ Métier)
 */

import { useState } from 'react';
import { Order } from '@/core/entities/Order';
import { GenerateOrderQRCodeUseCase } from '@/core/use-cases/qr-code/GenerateOrderQRCodeUseCase';
import { QRCodeGeneratorService } from '@/lib/services/QRCodeGeneratorService';

export function useOrderQRCode() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQRCode = async (order: Order) => {
    setIsGenerating(true);
    setError(null);

    try {
      // Injection de dépendances
      const qrCodeGenerator = new QRCodeGeneratorService();
      const useCase = new GenerateOrderQRCodeUseCase(qrCodeGenerator);

      // Exécution du use case
      const qrCodeDataUrl = await useCase.execute(order);
      setQrCode(qrCodeDataUrl);

      return qrCodeDataUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  const resetQRCode = () => {
    setQrCode(null);
    setError(null);
  };

  return {
    qrCode,
    isGenerating,
    error,
    generateQRCode,
    resetQRCode,
  };
}
