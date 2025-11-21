/**
 * Hook simplifié pour la génération de QR code
 * Version compatible avec la page commandes existante
 */

import { useState } from 'react';
import { Order as OrderEntity } from '@/core/entities/Order';
import { QRCodeGeneratorService } from '@/lib/services/QRCodeGeneratorService';

export function useOrderQRCodeSimple() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQRCode = async (order: OrderEntity) => {
    setIsGenerating(true);
    setError(null);

    try {
      // Créer les données du QR code
      const qrData = JSON.stringify({
        orderId: order.id,
        restaurantId: order.restaurantId,
        studentId: order.studentId,
        totalPrice: order.totalPrice,
        status: order.status,
        timestamp: order.createdAt.toISOString(),
      });

      // Générer le QR code directement
      const qrCodeGenerator = new QRCodeGeneratorService();
      const qrCodeDataUrl = await qrCodeGenerator.generate(qrData);
      
      setQrCode(qrCodeDataUrl);
      return qrCodeDataUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur lors de la génération du QR code:', err);
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