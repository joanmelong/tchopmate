import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next/Image: autoriser les images distantes depuis Supabase Storage et Unsplash
  images: {
    remotePatterns: [
      // Domaine Supabase spécifique de votre projet (URLs publiques Storage)
      {
        protocol: 'https',
        hostname: 'roykkxkzibsnrpwfwplw.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // Optionnel: motif générique pour d'autres projets Supabase (si besoin)
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // Exemple déjà présent (Unsplash)
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
