"use client"

import React from "react"

export default function DeprecatedQRCodePage() {
  React.useEffect(() => {
    console.warn('components/qr/page.tsx is deprecated. Use components/qrcode/* instead.')
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Page QR Code (dépréciée)</h1>
        <p className="text-sm text-gray-600 mt-2">Cette page est conservée pour compatibilité. Voir <code>components/qrcode</code> pour la nouvelle implémentation.</p>
      </div>
    </div>
  )
}