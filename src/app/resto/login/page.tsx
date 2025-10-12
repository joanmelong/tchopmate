"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/logo";
import { Eye, EyeOff, Mail, Lock, Store } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function RestoLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) newErrors.email = "L'adresse email est requise";
    if (!formData.password) newErrors.password = "Le mot de passe est requis";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Connexion avec Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        console.error("Erreur authentification:", authError);
        setErrors({ general: "Email ou mot de passe incorrect" });
        setIsLoading(false);
        return;
      }

      // Vérifier le rôle du compte
      const { data: compteData, error: compteError } = await supabase
        .from("compte")
        .select("id, role, nom, prenom")
        .eq("user_id", authData.user.id)
        .single();

      if (compteError || !compteData) {
        console.error("Erreur récupération compte:", compteError);
        setErrors({ general: "Compte non trouvé" });
        setIsLoading(false);
        return;
      }

      // Vérifier que c'est un gérant
      if (compteData.role !== "Gerant") {
        setErrors({ general: "Accès réservé aux gérants de restaurant" });
        setIsLoading(false);
        return;
      }

      // Vérifier si le gérant a déjà un restaurant
      const { data: restaurantData, error: restaurantError } = await supabase
        .from("restaurant")
        .select("id_restaurant")
        .eq("gerant_id", compteData.id)
        .single();

      if (restaurantError && restaurantError.code !== "PGRST116") {
        console.error("Erreur vérification restaurant:", restaurantError);
        setErrors({ general: "Erreur lors de la vérification du restaurant" });
        setIsLoading(false);
        return;
      }

      // Redirection selon si le restaurant existe
      if (restaurantData) {
        // Restaurant existe, aller au tableau de bord
        router.push(`/resto/${restaurantData.id_restaurant}`);
      } else {
        // Première connexion, créer le restaurant
        router.push("/resto/create-resto");
      }
    } catch (error) {
      console.error("Erreur inattendue:", error);
      setErrors({ general: "Une erreur inattendue s'est produite" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Colonne gauche - Formulaire */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <Link href="/">
              <Logo size="default" />
            </Link>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center space-y-2">
              <div className="flex justify-center mb-4">
                <div className="bg-primary/10 rounded-full p-3">
                  <Store className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Bienvenue</CardTitle>
              <CardDescription className="text-base">
                Connectez-vous à votre espace restaurateur
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {errors.general && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.general}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Adresse email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      className="pl-10 h-11"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Mot de passe
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Votre mot de passe"
                      className="pl-10 pr-10 h-11"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberMe"
                      checked={formData.rememberMe}
                      onCheckedChange={(checked) => handleInputChange("rememberMe", checked as boolean)}
                    />
                    <Label htmlFor="rememberMe" className="text-sm cursor-pointer">
                      Se souvenir de moi
                    </Label>
                  </div>
                  <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                    Mot de passe oublié ?
                  </Link>
                </div>

                <Button type="submit" className="w-full h-11 text-base font-medium" disabled={isLoading}>
                  {isLoading ? "Connexion en cours..." : "Se connecter"}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Pas encore de compte ? </span>
                <Link href="/register" className="text-primary hover:underline font-medium">
                  S'inscrire
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Colonne droite - Image et texte */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
        <div className="relative z-10 flex flex-col justify-center items-center text-center p-12">
          <div className="max-w-md">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Donnez vie à vos idées
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Créez votre restaurant en ligne et proposez vos plats aux clients. 
              Gérez facilement vos menus, commandes et paiements.
            </p>
          </div>
        </div>
        {/* Image décorative */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-primary/30 to-transparent rounded-full -translate-x-1/2 translate-y-1/2" />
      </div>
    </div>
  );
}