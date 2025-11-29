"use client"

import type React from "react"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import Image from "next/image"

interface ImageUploadFieldProps {
  label: string
  value?: string
  onChange: (file: File | null) => void
  preview?: string
  onPreviewChange?: (preview: string) => void
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ImageUploadField({ label, value: _value, onChange, preview, onPreviewChange }: ImageUploadFieldProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith("image/")) {
      onChange(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        onPreviewChange?.(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      alert("Veuillez sélectionner une image valide")
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          isDragging ? "border-orange-500 bg-orange-50" : "border-gray-300 hover:border-orange-400"
        }`}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
          id={`image-upload-${label}`}
        />
        <label htmlFor={`image-upload-${label}`} className="cursor-pointer block">
          {preview ? (
            <div className="space-y-2">
              <Image src={preview || "/placeholder.svg"} alt="Preview" className="w-full h-32 object-cover rounded" width={600} height={128} />
              <p className="text-sm text-gray-600">Cliquez pour changer l&apos;image</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Glissez-déposez une image ici</p>
              <p className="text-xs text-gray-500">ou cliquez pour sélectionner</p>
            </div>
          )}
        </label>
      </div>
      {preview && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            onChange(null)
            onPreviewChange?.("")
          }}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <X className="w-4 h-4 mr-1" />
          Supprimer l&apos;image
        </Button>
      )}
    </div>
  )
}
