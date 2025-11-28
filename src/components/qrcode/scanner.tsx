"use client"

import React, { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface ScannerProps {
  onScan: (decodedText: string) => void
  onCancel?: () => void
}

export function Scanner({ onScan, onCancel }: ScannerProps) {
  const [error, setError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const elRef = useRef<HTMLDivElement | null>(null)
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null)

  useEffect(() => {
    let mounted = true

    const startScanner = async () => {
      try {
        if (!elRef.current) return
        const elementId = elRef.current.id
        const cameras = await Html5Qrcode.getCameras()
        const cameraId = cameras && cameras.length > 0 ? cameras[0].id : undefined
        const html5QrCode = new Html5Qrcode(elementId)
        html5QrCodeRef.current = html5QrCode

        if (cameraId) {
          await html5QrCode.start(
            cameraId,
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              disableFlip: false,
            },
            (decodedText) => {
              // Trigger callback on first successful scan
              if (!mounted) return
              setScanning(false)
              onScan(decodedText)
            },
            (errorMessage) => {
              // ignore/error logging
              // console.debug('[Scanner] scan error', errorMessage)
            }
          )
        } else {
          await html5QrCode.start(
            { facingMode: 'environment' },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              disableFlip: false,
            },
            (decodedText) => {
              if (!mounted) return
              setScanning(false)
              onScan(decodedText)
            },
            (errorMessage) => {
              // no-op
            }
          )
        }

        setScanning(true)
      } catch (e: any) {
        console.error('[Scanner] init error', e)
        setError(String(e?.message || e))
      }
    }

    startScanner()

    return () => {
      mounted = false
      const stop = async () => {
        try {
          await html5QrCodeRef.current?.stop()
          html5QrCodeRef.current?.clear()
        } catch (e) {
          console.warn('[Scanner] stop error', e)
        }
      }
      stop()
    }
  }, [onScan])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Scanner QRCode</h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">Erreur: {error}</div>
      )}

      <div className="w-full bg-gray-100 rounded p-4">
        {/* container for video scanner */}
        <div id="html5qr-scanner" ref={elRef as any} className="w-full h-[320px]" />
      </div>

      {scanning ? (
        <p className="text-sm text-gray-500">Scannage en cours... Présentez le QR au scanner</p>
      ) : (
        <p className="text-sm text-gray-500">Initialisation du scanner...</p>
      )}
    </div>
  )
}
