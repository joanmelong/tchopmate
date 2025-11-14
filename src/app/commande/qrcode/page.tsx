"use client"

import React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useQRCode } from "@/hooks/use-qrcode"
import { QRCodeView } from "@/components/qrcode/qrcode-view"

export default function QRCodePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  // Logique métier séparée
  const { qrCode, isLoading, error } = useQRCode(orderId)

  const handleBack = () => {
    router.push("/commandes")
  }

  // Affichage séparé (composant de présentation)
  return (
    <QRCodeView
      qrCode={qrCode}
      isLoading={isLoading}
      error={error}
      orderId={orderId || ""}
      onBack={handleBack}
    />
  )
}
