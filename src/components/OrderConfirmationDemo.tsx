/**
 * Version démo du composant OrderConfirmation
 * Sans authentification Supabase pour les tests
 */

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ShoppingCart, 
  QrCode, 
  CheckCircle, 
  Clock, 
  CreditCard,
  MapPin,
  User
} from 'lucide-react';
import { QRCodeGeneratorService } from '@/lib/services/QRCodeGeneratorService';

interface OrderItem {
  platId: number;
  platNom: string;
  quantite: number;
  prixUnitaire: number;
  image?: string;
}

interface OrderConfirmationDemoProps {
  orderItems: OrderItem[];
  restaurantName: string;
  studentName: string;
  onOrderConfirmed?: (qrCode: string) => void;
}

export function OrderConfirmationDemo({
  orderItems,
  restaurantName,
  studentName,
  onOrderConfirmed
}: OrderConfirmationDemoProps) {
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPrice = orderItems.reduce((total, item) => 
    total + (item.quantite * item.prixUnitaire), 0
  );

  const handleConfirmOrder = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simuler la création d'une commande
      const mockOrder = {
        orderId: Math.floor(Math.random() * 1000) + 1,
        restaurantId: 'restaurant-demo-123',
        studentId: 456,
        studentName,
        restaurantName,
        items: orderItems,
        totalPrice,
        status: 'en_attente',
        timestamp: new Date().toISOString(),
      };

      // Générer le QR code
      const qrCodeGenerator = new QRCodeGeneratorService();
      const generatedQrCode = await qrCodeGenerator.generate(JSON.stringify(mockOrder));
      
      setQrCode(generatedQrCode);
      setIsQRModalOpen(true);

      if (onOrderConfirmed) {
        onOrderConfirmed(generatedQrCode);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur lors de la confirmation de la commande:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Confirmation de commande
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Restaurant Info */}
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-orange-600" />
              <span className="font-medium">{restaurantName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{studentName}</span>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Articles commandés</h3>
            {orderItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {item.image && (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.platNom}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{item.platNom}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantite} × {item.prixUnitaire.toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {(item.quantite * item.prixUnitaire).toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-600" />
                <span>{totalPrice.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <Button
            onClick={handleConfirmOrder}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Confirmation en cours...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirmer la commande
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* QR Code Modal */}
      <Dialog open={isQRModalOpen} onOpenChange={setIsQRModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Commande confirmée !
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center space-y-3">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">
                    Commande confirmée
                  </span>
                </div>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  <Clock className="w-3 h-3 mr-1" />
                  En attente
                </Badge>
              </div>

              {qrCode && (
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">
                    QR Code pour le retrait :
                  </p>
                  <div className="flex justify-center">
                    <Image
                      src={qrCode}
                      alt="QR Code de la commande"
                      width={200}
                      height={200}
                      className="border rounded-lg"
                    />
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-600 space-y-1">
                <p>• Présentez ce QR code au restaurant</p>
                <p>• Vous serez notifié quand votre commande sera prête</p>
                <p>• Temps d&apos;attente estimé : 15-20 minutes</p>
              </div>
            </div>

            <Button
              onClick={() => setIsQRModalOpen(false)}
              className="w-full"
            >
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}