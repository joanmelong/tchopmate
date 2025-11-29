"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { CheckCircle } from "lucide-react"
import { Logo } from "@/components/logo"
import Link from "next/link"

export default function SuccessPage() {
  const router = useRouter()
  const [orderId, setOrderId] = useState<string>("")

  useEffect(() => {
    // Récupérer l'ID de la commande depuis les params ou le state
    const params = new URLSearchParams(window.location.search)
    const id = params.get("orderId")
    if (id) {
      setOrderId(id)
    }
  }, [])

  const handleViewOrders = () => {
    router.push("/commandes")
  }

  const handleGoToMenu = () => {
    router.push("/menu")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8">
        <Link href="/">
          <Logo size="default" />
        </Link>
      </div>

      {/* Carte de succès */}
      <div className="relative bg-white rounded-[20px] shadow-2xl w-full max-w-[480px] px-8 py-10 text-center animate-in fade-in slide-in-from-bottom-2 duration-600">
        {/* Icône de succès */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse" style={{ animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}></div>
            <CheckCircle className="h-20 w-20 text-green-500 relative z-10" />
          </div>
        </div>

        {/* Titre */}
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Commande Confirmée!</h1>
        <p className="text-gray-600 mb-6">
          Votre commande a été créée avec succès.
        </p>

        {/* Numéro de commande */}
        {orderId && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg mb-8 text-left">
            <p className="text-sm text-gray-600 font-medium">Numéro de commande</p>
            <p className="text-lg font-bold text-green-700 font-mono">{orderId}</p>
          </div>
        )}

        {/* Message informatif */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-8 text-left">
          <p className="text-sm text-blue-900">
            <strong>Prochaines étapes:</strong> Allez à la page &quot;Mes Commandes&quot; pour voir les détails de votre commande et afficher votre QR code. Présentez ce QR code au restaurant pour valider votre commande.
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleViewOrders}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-all"
          >
            Voir mes commandes
          </Button>
          
          <Button
            onClick={handleGoToMenu}
            variant="outline"
            className="w-full border-orange-300 text-orange-600 hover:bg-orange-50 font-semibold py-3 rounded-lg transition-all"
          >
            Retour au menu
          </Button>
        </div>

        {/* Détails supplémentaires */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Date: {new Date().toLocaleString("fr-FR")}
          </p>
        </div>
      </div>
    </div>
  )
}
