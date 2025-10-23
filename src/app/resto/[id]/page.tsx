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

export default function RestaurantDashboard() {
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

  const stats = [
    {
      title: "Commandes aujourd'hui",
      value: "47",
      change: "+12%",
      changeType: "positive",
      icon: ShoppingCart,
      detail: "5 en attente",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Revenus du jour",
      value: "125 450 FCFA",
      change: "+8%",
      changeType: "positive",
      icon: DollarSign,
      detail: "Objectif: 150 000 FCFA",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Clients actifs",
      value: "1 248",
      change: "342",
      changeType: "info",
      icon: Users,
      detail: "23 nouveaux cette semaine",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Note moyenne",
      value: "4.8/5",
      change: "4.8",
      changeType: "warning",
      icon: Star,
      detail: "185 avis",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
  ];

  const recentOrders = [
    {
      id: "#CMD-2847",
      customer: "Marie Kouam",
      items: "2x Ndolé, 1x Jus de Bissap",
      amount: "3 500 FCFA",
      status: "En préparation",
      statusColor: "bg-yellow-100 text-yellow-800",
      time: "Il y a 5 min",
    },
    {
      id: "#CMD-2846",
      customer: "Paul Ndjodo",
      items: "1x Poulet DG, 1x Plantain",
      amount: "4 200 FCFA",
      status: "Prête",
      statusColor: "bg-green-100 text-green-800",
      time: "Il y a 12 min",
    },
    {
      id: "#CMD-2845",
      customer: "Sophie Mbarga",
      items: "3x Poisson Braisé, 2x Bière",
      amount: "8 750 FCFA",
      status: "Livrée",
      statusColor: "bg-gray-100 text-gray-800",
      time: "Il y a 28 min",
    },
    {
      id: "#CMD-2844",
      customer: "Jean Ateba",
      items: "1x Koki, 1x Miondo",
      amount: "2 800 FCFA",
      status: "En attente",
      statusColor: "bg-red-100 text-red-800",
      time: "Il y a 35 min",
    },
  ];

  const menuItems = [
    { name: "Tableau de bord", icon: Home, active: true, badge: null },
    { name: "Commandes", icon: ShoppingCart, active: false, badge: "5" },
    { name: "Menu", icon: BookOpen, active: false, badge: null },
    { name: "Clients", icon: Users, active: false, badge: null },
    { name: "Statistiques", icon: BarChart3, active: false, badge: null },
    { name: "Paramètres", icon: Settings, active: false, badge: null },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r shadow-lg transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo Section */}
        <div className="p-6 bg-gradient-to-r from-orange-500 to-orange-600">
          <Logo />
        </div>

        {/* Restaurant Info */}
        <div className="p-4">
          <Card className="bg-orange-50 border-orange-100">
            <CardContent className="p-3">
              <div className="flex items-center space-x-3">
                <Image
                  src={restaurantInfo?.photo || "/placeholder-logo.png"}
                  alt={restaurantInfo?.nom || "Restaurant"}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {restaurantInfo?.nom || "Restaurant"}
                  </h3>
                  <p className="text-xs text-gray-600 truncate">
                    {restaurantInfo?.localisation || "Localisation"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <nav className="px-4 space-y-1">
          {menuItems.map((item) => (
            <Button
              key={item.name}
              variant={item.active ? "secondary" : "ghost"}
              className={`w-full justify-start ${
                item.active
                  ? "bg-orange-50 border-l-4 border-orange-500 text-orange-700"
                  : "hover:bg-gray-50"
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              <span className="flex-1 text-left">{item.name}</span>
              {item.badge && (
                <Badge variant="destructive" className="ml-2">
                  {item.badge}
                </Badge>
              )}
            </Button>
          ))}
        </nav>

        {/* Profile Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback className="bg-orange-500 text-white">
                {gerantInfo ? `${gerantInfo.prenom[0]}${gerantInfo.nom[0]}` : "G"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm truncate">
                {gerantInfo ? `${gerantInfo.prenom} ${gerantInfo.nom}` : "Gérant"}
              </p>
              <p className="text-xs text-gray-500">Gérant</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-red-50 hover:text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Header */}
        <header className="bg-white border-b shadow-sm sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <Menu className="h-6 w-6" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Tableau de bord
                  </h1>
                  <p className="text-sm text-gray-500">
                    Vue d'ensemble de votre restaurant
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-6 w-6" />
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                </Button>
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">
                    Aujourd'hui
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date().toLocaleDateString("fr-FR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <Card key={stat.title} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bgColor}`}
                    >
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <Badge
                      variant={
                        stat.changeType === "positive"
                          ? "default"
                          : stat.changeType === "warning"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {stat.change}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm font-medium text-gray-500 mt-4">
                    {stat.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">{stat.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Actions et Commandes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Actions rapides */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                  <Plus className="mr-2 h-5 w-5" />
                  Nouvelle commande
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-orange-200 hover:bg-orange-50 bg-transparent"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Ajouter un plat
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-orange-200 hover:bg-orange-50 bg-transparent"
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Voir les rapports
                </Button>

                <div className="pt-6 border-t mt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Infos restaurant
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{restaurantInfo?.localisation || "Localisation non définie"}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Ouvert : 10h - 22h</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>{gerantInfo?.numero_tel || "Téléphone non défini"}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Commandes récentes */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Commandes récentes</CardTitle>
                  <Button
                    variant="link"
                    className="text-orange-600 hover:text-orange-700"
                  >
                    Voir tout <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <Avatar>
                          <AvatarFallback className="bg-orange-100 text-orange-600">
                            {order.customer
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="font-semibold text-gray-900">
                              {order.customer}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {order.id}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {order.items}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {order.time}
                          </p>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold text-gray-900 mb-2">
                          {order.amount}
                        </p>
                        <Badge className={order.statusColor}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
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
