"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Logo } from "@/components/logo";

import {
  Bell,
  Home,
  ShoppingCart,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  LogOut,
  DollarSign,
  Star,
  Clock,
  MapPin,
  Phone,
  Plus,
  FileText,
  ChevronRight,
  Menu,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { DashboardStats } from "@/components/admin/dashboard-stats";
import { DailySalesChart } from "@/components/admin/daily-sales-chart";
import { PopularDishes } from "@/components/admin/popular-dishes";

interface GerantInfo {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  numero_tel?: string;
}

interface RestaurantInfo {
  id_restaurant: string;
  nom: string;
  localisation?: string;
  photo?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const params = useParams();
  const gerantId = params.id as string;
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [gerantInfo, setGerantInfo] = useState<GerantInfo | null>(null);
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Vérifier l'authentification et charger les données
  useEffect(() => {
    const loadData = async () => {
      try {
        // Vérifier la session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          router.push("/resto/login");
          return;
        }

        // Vérifier que l'utilisateur est bien le gérant de ce restaurant
        const { data: compteData, error: compteError } = await supabase
          .from("compte")
          .select("id, nom, prenom, email, numero_tel, role")
          .eq("user_id", session.user.id)
          .eq("role", "Gerant")
          .single();

        if (compteError || !compteData) {
          router.push("/resto/login");
          return;
        }

        // Vérifier que l'ID correspond
        if (compteData.id.toString() !== gerantId) {
          router.push("/resto/login");
          return;
        }

        setGerantInfo(compteData);

        // Charger les informations du restaurant
        const { data: restaurantData, error: restaurantError } = await supabase
          .from("restaurant")
          .select("id_restaurant, nom, localisation, photo")
          .eq("gerant_id", compteData.id)
          .single();

        if (restaurantError) {
          console.error("Erreur chargement restaurant:", restaurantError);
          setError("Erreur lors du chargement des informations du restaurant");
          return;
        }

        setRestaurantInfo(restaurantData);
      } catch (error) {
        console.error("Erreur inattendue:", error);
        setError("Une erreur inattendue s'est produite");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router, gerantId]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/resto/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <LogOut className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => router.push("/resto/login")}>
            Retour à la connexion
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600 mt-1">Bienvenue dans votre espace gérant TchopMate</p>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DailySalesChart />
        </div>
        <div>
          <PopularDishes />
        </div>
      </div>
      {/* Overlay Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
