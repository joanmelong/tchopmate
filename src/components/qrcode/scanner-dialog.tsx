"use client"

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Scanner } from './scanner'

interface ScannerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onScanned: (decodedText: string) => void
}

export function ScannerDialog({ open, onOpenChange, onScanned }: ScannerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Scanner QR - Validation commande</DialogTitle>
        </DialogHeader>
        <Scanner
          onScan={(decodedText) => {
            onScanned(decodedText)
            onOpenChange(false)
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
