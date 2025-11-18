"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Logo } from "@/components/logo"
import Link from "next/link"
import type { GeneratedQRCode } from "@/services/qrcode-persistence"

interface QRCodeViewProps {
  qrCode: GeneratedQRCode | null
  isLoading: boolean
  error: string | null
  orderId: string
  onBack: () => void
}

/**
 * Composant de présentation pour l'affichage du QR code
 * Le QR code est généré à la demande, pas de persistance
 * Ne contient que de l'UI, la logique est externalisée
 */
export function QRCodeView({
  qrCode,
  isLoading,
  error,
  orderId,
  onBack,
}: QRCodeViewProps) {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Génération du QR code...</p>
        </div>
      </div>
    )
  }

  if (error || !qrCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50 flex flex-col items-center justify-center p-4">
        <div className="absolute top-6 left-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-orange-600 hover:bg-orange-100"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour
          </Button>
        </div>

        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h2>
          <p className="text-gray-600 mb-6">{error || "Impossible de générer le QR code"}</p>
          <Button onClick={onBack} className="bg-orange-500 hover:bg-orange-600 text-white">
            Retour aux commandes
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50 flex flex-col items-center justify-center p-4">
      {/* Header avec retour */}
      <div className="absolute top-6 left-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-orange-600 hover:bg-orange-100"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Retour
        </Button>
      </div>

      {/* Logo */}
      <div className="mb-8 mt-4">
        <Link href="/">
          <Logo size="default" />
        </Link>
      </div>

      {/* Carte principale */}
      <div className="relative bg-white rounded-[20px] shadow-2xl w-full max-w-[480px] px-8 py-10 text-center animate-in fade-in slide-in-from-bottom-2 duration-600">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Mon QR Code</h1>
        <p className="text-gray-600 mb-8">
          Commande: <span className="font-semibold text-orange-600">{qrCode.orderId}</span>
        </p>

        {/* Infos de la commande */}
        <div className="bg-gray-50 rounded-lg p-4 mb-8 text-left">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 font-medium">Client</p>
              <p className="text-gray-900 font-semibold">{qrCode.data.clientName}</p>
            </div>
            <div>
              <p className="text-gray-600 font-medium">Téléphone</p>
              <p className="text-gray-900 font-semibold">{qrCode.data.clientPhone}</p>
            </div>
            <div>
              <p className="text-gray-600 font-medium">Total</p>
              <p className="text-orange-600 font-bold">{qrCode.data.totalPrice} FCFA</p>
            </div>
            <div>
              <p className="text-gray-600 font-medium">Articles</p>
              <p className="text-gray-900 font-semibold">{qrCode.data.items.length}</p>
            </div>
          </div>
        </div>

        {/* Section QR Code avec gradient */}
        <div className="relative bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-4 border-orange-500 rounded-[20px] p-8 overflow-hidden mb-8">
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              background:
                "radial-gradient(circle at center, rgba(255,107,53,0.15) 0%, transparent 70%)",
              animationDuration: "3s",
            }}
          />

          {/* Box du QR Code */}
          <div className="relative z-10 bg-white rounded-[15px] p-6 shadow-[0_5px_15px_rgba(0,0,0,0.1)] max-w-[300px] mx-auto">
            <img
              src={qrCode.qrCodeDataUrl}
              alt={`QR Code pour ${qrCode.orderId}`}
              className="w-full h-auto block rounded-[10px]"
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-8 text-left">
          <p className="text-sm text-blue-900">
            <strong>Comment utiliser:</strong> Présentez ce QR code au restaurant pour valider votre
            commande. Le commerçant scannera ce code pour confirmer le retrait.
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={onBack}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg"
          >
            Retour aux commandes
          </Button>
        </div>
      </div>
    </div>
  )
}
