/**
 * Composant: QRCodeButton
 * Couche: UI
 * Description: Bouton pour afficher le QR code d'une commande
 */

"use client";

import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QRCodeButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function QRCodeButton({
  onClick,
  isLoading = false,
  disabled = false,
  variant = "default",
  size = "default",
  className,
}: QRCodeButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || isLoading}
      variant={variant}
      size={size}
      className={cn(
        "bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-md hover:shadow-lg transition-all duration-200",
        className
      )}
    >
      <QrCode className="h-4 w-4 mr-2" />
      {isLoading ? "Génération..." : "QR Code"}
    </Button>
  );
}
