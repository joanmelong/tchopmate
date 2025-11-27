"use client";

import { useRouter, usePathname } from "next/navigation";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useState } from "react";

export function GlobalLogoutButton() {
  const { user } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  if (!user) return null; // Pas connecté -> pas de bouton

  const handleLogout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      // Retour à la page principale
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
    >
      <LogOut className="h-4 w-4" />
      <span>{loading ? "Déconnexion..." : "Déconnexion"}</span>
    </Button>
  );
}
