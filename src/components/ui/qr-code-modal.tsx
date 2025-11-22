/**
 * Composant: QRCodeModal
 * Couche: UI
 * Description: Modal pour afficher le QR code d'une commande
 */

"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, QrCode, X } from "lucide-react";
import Image from "next/image";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCodeDataUrl: string | null;
  orderId: string;
  isLoading?: boolean;
}

export function QRCodeModal({ isOpen, onClose, qrCodeDataUrl, orderId, isLoading = false }: QRCodeModalProps) {
  const handleDownload = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement("a");
    link.href = qrCodeDataUrl;
    link.download = `qrcode-commande-${orderId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-orange-600 flex items-center gap-2">
            <div className="bg-orange-100 p-2 rounded-lg">
              <QrCode className="h-5 w-5" />
            </div>
            QR Code - Commande {orderId}
          </DialogTitle>
          <DialogDescription>
            Présentez ce QR code au restaurant pour retirer votre commande
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* QR Code Display */}
          <div className="flex justify-center items-center p-6 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg border-2 border-orange-200">
            {isLoading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
                <p className="text-sm text-gray-600">Génération du QR code...</p>
              </div>
            ) : qrCodeDataUrl ? (
              <div className="relative">
                <Image
                  src={qrCodeDataUrl}
                  alt={`QR Code pour la commande ${orderId}`}
                  width={300}
                  height={300}
                  className="rounded-lg shadow-lg"
                />
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <QrCode className="h-16 w-16 mx-auto mb-2 text-gray-400" />
                <p>Aucun QR code disponible</p>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2 text-sm">📱 Comment utiliser ce QR code ?</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Présentez ce QR code au comptoir du restaurant</li>
              <li>• Le personnel scannera le code pour valider votre commande</li>
              <li>• Vous pourrez ensuite récupérer vos plats</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleDownload}
              disabled={!qrCodeDataUrl || isLoading}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">
              <X className="h-4 w-4 mr-2" />
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
