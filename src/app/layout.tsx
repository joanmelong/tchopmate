import type { Metadata } from "next";
import "./globals.css";

// Utilisation de polices système pour éviter les problèmes de connectivité
const fontVariables = {
  "--font-geist-sans": "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
  "--font-geist-mono": "ui-monospace, SFMono-Regular, 'SF Mono', Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
};

export const metadata: Metadata = {
  title: "TchopMate",
  description: "Votre partenaire en réservation de restaurant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
        style={fontVariables as React.CSSProperties}
      >
        {children}
      </body>
    </html>
  );
}
