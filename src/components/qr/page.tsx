"use client";

import React from "react";
import { Logo } from "@/components/logo";
import Link from "next/link";

export default function QRCodePage() {
  // Remplacez cette URL 
  const qrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://tchopmate.com";

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center overflow-hidden">
      <div className="mb-5">
        <Link href="/">
          <Logo size="default" />
        </Link>
      </div>

      {/* Carte principale */}
      <div className="relative bg-white rounded-[20px] shadow-[0_8px_20px_rgba(0,0,0,0.1)] w-full max-w-[460px] px-8 py-6 text-center animate-in fade-in slide-in-from-bottom-2 duration-600">
        <div className="absolute top-5 left-6">
          <Link href="/" className="text-primary font-semibold text-[0.95rem] hover:underline">
            ← Retour
          </Link>
        </div>

        <h1 className="text-[1.8rem] font-bold text-slate-900 mt-3 mb-6">
          Mon QR Code
        </h1>

        {/* Section QR Code */}
        <div className="relative bg-gradient-to-br from-primary/5 to-primary/10 border-4 border-primary rounded-[20px] p-6 overflow-hidden">
          <div 
            className="absolute inset-0 animate-pulse"
            style={{
              background: 'radial-gradient(circle at center, rgba(255,107,53,0.15) 0%, transparent 70%)',
              animationDuration: '3s'
            }}
          />

          {/* Box du QR Code */}
          <div className="relative z-10 bg-white rounded-[15px] p-4 shadow-[0_5px_15px_rgba(0,0,0,0.1)] max-w-[220px] mx-auto">
            <img
              src={qrCodeUrl}
              alt="QR Code Tchopmate"
              className="w-full h-auto block rounded-[10px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}