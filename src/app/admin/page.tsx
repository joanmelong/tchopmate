"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Logo } from "@/components/logo";
import {
  Users,
  Plus,
  Mail,
  LogOut,
  UserPlus,
  Building2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { AdminDebugger } from "@/components/debug/AdminDebugger";

interface Gerant {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  numero_tel?: string;
  created_at: string;
  restaurant?: {
    id_restaurant: string;
    nom: string;
    localisation?: string;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [gerants, setGerants] = useState<Gerant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newGerantEmail, setNewGerantEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [adminInfo, setAdminInfo] = useState<{ nom: string; prenom: string; email: string } | null>(null);

  // Vérifier l'authentification admin
  useEffect(() => {
    const checkAdminAuth = async () => {
      console.log("📍 [/admin] Vérification authentification admin...");
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      console.log("📍 [/admin] Session récupérée:", session ? `Email: ${session.user.email}` : "NULL");
      
      if (sessionError) {
        console.error("📍 [/admin] Erreur session:", sessionError);
        router.push("/admin/login");
        return;
      }
      
      if (!session?.user) {
        console.log("📍 [/admin] Aucune session trouvée - REDIRECTION vers /admin/login");
        router.push("/admin/login");
        return;
      }

      console.log("📍 [/admin] Session trouvée pour:", session.user.email);

      // Vérifier si l'email correspond à l'admin autorisé
      const adminEmail = "joantsayem@gmail.com";
      if (session.user.email !== adminEmail) {
        console.log("📍 [/admin] Email non autorisé:", session.user.email);
        await supabase.auth.signOut();
        router.push("/admin/login?error=unauthorized");
        return;
      }

      console.log("📍 [/admin] Email autorisé - vérification du compte dans la BD...");

      // Vérifier le rôle admin
      const { data: compteData, error: compteError } = await supabase
        .from("compte")
        .select("id, nom, prenom, email, role")
        .eq("user_id", session.user.id)
        .single();

      if (compteError || !compteData) {
        console.log("📍 [/admin] Aucun compte trouvé, mais email autorisé - affichage du dashboard");
        // L'utilisateur est authentifié avec l'email admin, on lui permet d'accéder
        setAdminInfo({
          nom: session.user.user_metadata?.full_name?.split(' ')?.[0] || "Admin",
          prenom: session.user.user_metadata?.full_name?.split(' ')?.[1] || "Root",
          email: session.user.email || adminEmail
        });
        setIsLoading(false);
        await loadGerants();
        return;
      }

      console.log("📍 [/admin] Compte trouvé:", compteData);

      if (compteData.role !== "Administrateur") {
        console.log("📍 [/admin] Rôle non admin:", compteData.role);
        router.push("/admin/login");
        return;
      }

      console.log("📍 [/admin] ✅ Authentification admin réussie - affichage du dashboard");
      setAdminInfo(compteData);
      await loadGerants();
    };

    checkAdminAuth();
  }, [router]);

  const loadGerants = async () => {
    try {
      const { data, error } = await supabase
        .from("compte")
        .select(`
          id,
          nom,
          prenom,
          email,
          numero_tel,
          created_at,
          restaurant (
            id_restaurant,
            nom,
            localisation
          )
        `)
        .eq("role", "Gerant")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur chargement gérants:", error);
        setError("Erreur lors du chargement des gérants");
        return;
      }

      setGerants((data || []).map(gerant => ({
        ...gerant,
        restaurant: gerant.restaurant?.[0] || undefined
      })));
    } catch (error) {
      console.error("Erreur inattendue:", error);
      setError("Une erreur inattendue s'est produite");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGerant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGerantEmail.trim()) {
      setError("Veuillez saisir une adresse email");
      return;
    }

    setIsCreating(true);
    setError("");
    setSuccess("");

    try {
      // Vérifier si l'email existe déjà
      const { data: existingGerant } = await supabase
        .from("compte")
        .select("id")
        .eq("email", newGerantEmail.trim())
        .single();

      if (existingGerant) {
        setError("Un compte avec cette adresse email existe déjà");
        setIsCreating(false);
        return;
      }

      // Créer le compte gérant (sans user_id pour le moment)
      const { error: insertError } = await supabase
        .from("compte")
        .insert({
          nom: "Gérant",
          prenom: "Nouveau",
          email: newGerantEmail.trim(),
          role: "Gerant",
        })
        .select()
        .single();

      if (insertError) {
        console.error("Erreur création gérant:", insertError);
        setError("Erreur lors de la création du gérant");
        setIsCreating(false);
        return;
      }

      setSuccess(`Gérant créé avec succès ! L'email ${newGerantEmail} peut maintenant se connecter.`);
      setNewGerantEmail("");
      await loadGerants();
    } catch (error) {
      console.error("Erreur inattendue:", error);
      setError("Une erreur inattendue s'est produite");
    } finally {
      setIsCreating(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Logo />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Administration TCHOPMATE
                </h1>
                <p className="text-sm text-gray-500">
                  Gestion des gérants de restaurants
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {adminInfo?.prenom} {adminInfo?.nom}
                </p>
                <p className="text-xs text-gray-500">Administrateur</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-6">
        {/* Debug temporaire */}
        <AdminDebugger />
        
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <Badge variant="outline">{gerants.length}</Badge>
              </div>
              <CardTitle className="text-sm font-medium text-gray-500">
                Gérants inscrits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">
                {gerants.length}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Total des gérants actifs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-green-600" />
                </div>
                <Badge variant="outline">
                  {gerants.filter(g => g.restaurant).length}
                </Badge>
              </div>
              <CardTitle className="text-sm font-medium text-gray-500">
                Restaurants créés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">
                {gerants.filter(g => g.restaurant).length}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Restaurants configurés
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                  <UserPlus className="h-6 w-6 text-orange-600" />
                </div>
                <Badge variant="outline">
                  {gerants.filter(g => !g.restaurant).length}
                </Badge>
              </div>
              <CardTitle className="text-sm font-medium text-gray-500">
                En attente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">
                {gerants.filter(g => !g.restaurant).length}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Gérants sans restaurant
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Création d'un nouveau gérant */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Créer un nouveau gérant</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateGerant} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {success}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Adresse email du gérant
                </Label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="gerant@restaurant.com"
                      className="pl-10"
                      value={newGerantEmail}
                      onChange={(e) => setNewGerantEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "Création..." : "Créer"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Le gérant recevra un email avec les instructions de connexion
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Liste des gérants */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Liste des gérants</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {gerants.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucun gérant inscrit</p>
              </div>
            ) : (
              <div className="space-y-4">
                {gerants.map((gerant) => (
                  <div
                    key={gerant.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <Avatar>
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {gerant.prenom[0]}{gerant.nom[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-semibold text-gray-900">
                            {gerant.prenom} {gerant.nom}
                          </p>
                          {gerant.restaurant ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Restaurant créé
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              <XCircle className="h-3 w-3 mr-1" />
                              En attente
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {gerant.email}
                        </p>
                        {gerant.numero_tel && (
                          <p className="text-xs text-gray-500">
                            {gerant.numero_tel}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Inscrit le {new Date(gerant.created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      {gerant.restaurant ? (
                        <div>
                          <p className="font-medium text-gray-900 mb-1">
                            {gerant.restaurant.nom}
                          </p>
                          {gerant.restaurant.localisation && (
                            <p className="text-xs text-gray-500">
                              {gerant.restaurant.localisation}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          Pas encore de restaurant
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
