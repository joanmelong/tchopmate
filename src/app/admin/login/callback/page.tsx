"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useRouter } from "next/navigation";

export default function AdminCallbackPage() {
  const { handleCallback, isLoading, error } = useAdminAuth();
  const [done, setDone] = useState(false);
  const router = useRouter();

  useEffect(() => {
    handleCallback().then(() => setDone(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (done && !error) {
      router.replace("/admin");
    }
  }, [done, error, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <div className="space-y-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto" />
        <p className="text-sm text-muted-foreground">Traitement de l'authentification...</p>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}
