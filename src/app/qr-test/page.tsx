/**
 * Page de test simple pour la génération de QR code
 */

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QRCodeGeneratorService } from '@/lib/services/QRCodeGeneratorService';

export default function QRTestPage() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateTestQRCode = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Données de test pour le QR code
      const testOrderData = {
        orderId: 123,
        restaurantId: 'restaurant-test-123',
        studentId: 456,
        totalPrice: 5400,
        status: 'en_attente',
        timestamp: new Date().toISOString(),
        items: [
          { name: 'Ndolé aux crevettes', quantity: 2, price: 2500 },
          { name: 'Jus de bissap', quantity: 1, price: 400 }
        ]
      };

      const qrCodeGenerator = new QRCodeGeneratorService();
      const qrCodeDataUrl = await qrCodeGenerator.generate(JSON.stringify(testOrderData));
      
      setQrCode(qrCodeDataUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Test Génération QR Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                Erreur: {error}
              </div>
            )}

            <div className="text-center">
              <Button
                onClick={generateTestQRCode}
                disabled={isGenerating}
                size="lg"
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Génération en cours...
                  </>
                ) : (
                  'Générer QR Code de Test'
                )}
              </Button>
            </div>

            {qrCode && (
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold text-green-800">
                  ✅ QR Code généré avec succès !
                </h3>
                
                <div className="bg-white p-6 rounded-lg border-2 border-gray-200 shadow-lg">
                  <Image
                    src={qrCode}
                    alt="QR Code de test"
                    width={200}
                    height={200}
                    className="mx-auto border rounded-lg"
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg text-left">
                  <h4 className="font-semibold mb-2">Données encodées dans le QR:</h4>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto">
                    {JSON.stringify({
                      orderId: 123,
                      restaurantId: 'restaurant-test-123',
                      studentId: 456,
                      totalPrice: 5400,
                      status: 'en_attente',
                      timestamp: 'timestamp_actuel',
                      items: [
                        { name: 'Ndolé aux crevettes', quantity: 2, price: 2500 },
                        { name: 'Jus de bissap', quantity: 1, price: 400 }
                      ]
                    }, null, 2)}
                  </pre>
                </div>

                <div className="text-sm text-gray-600">
                  <p>• Ce QR code peut être scanné avec n&apos;importe quel lecteur QR</p>
                  <p>• Il contient toutes les informations de la commande</p>
                  <p>• Le restaurant peut l&apos;utiliser pour vérifier et traiter la commande</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}