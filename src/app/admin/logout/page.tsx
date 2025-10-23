"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      try {
        console.log("[logout] Signing out from Supabase...");
        await supabase.auth.signOut();
      } catch (e) {
        console.warn("[logout] signOut error (ignored):", e);
      }

      try {
        console.log("[logout] Clearing server session cookie...");
        await fetch("/api/admin/session", { method: "DELETE", credentials: "include" });
      } catch (e) {
        console.warn("[logout] cookie clear error (ignored):", e);
      }

      console.log("[logout] Redirecting to /admin/login");
      router.replace("/admin/login");
    };

    run();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Déconnexion en cours…</p>
      </div>
    </div>
  );
}
