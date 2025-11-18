"use client"

import React from "react"

// Ce composant était l'ancien affichage du QR code (répertoire `components/qr`).
// Il est désormais déprécié : utilisez `components/qrcode/*` (nouvelle implémentation).

export default function DeprecatedQRCode() {
  React.useEffect(() => {
    console.warn('components/qr/qrcode.tsx is deprecated. Use components/qrcode/* instead.')
  }, [])

  return (
    <div className="p-6 text-center">
      <h2 className="font-bold">Composant QR Code (déprécié)</h2>
      <p className="text-sm text-gray-600">Ce composant est conservé pour compatibilité mais n'est plus utilisé. Voir <code>components/qrcode</code>.</p>
    </div>
  )
}