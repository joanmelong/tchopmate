"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/logo";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { GoogleLogin } from "@/components/auth/GoogleLogin";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    emailOrPhone: "",
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
    if (!formData.emailOrPhone.trim()) newErrors.emailOrPhone = "Email ou numéro de téléphone requis";
    if (!formData.password) newErrors.password = "Le mot de passe est requis";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.emailOrPhone,
      password: formData.password,
    });
    setIsLoading(false);

    if (error) {
      console.error("Erreur login:", error);
      setErrors({ general: "Email ou mot de passe incorrect" });
    } else {
      // Vérifier s'il y a un paramètre redirect dans l'URL
      const searchParams = new URLSearchParams(window.location.search);
      const redirect = searchParams.get('redirect');
      
      if (redirect) {
        router.push(redirect);
      } else {
        router.push("/home");
      }
    }
  };

  return (
    <div className="min-h-screen bg-yellow-600 bg-gradient-to-b from-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Logo size="default" />
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Se connecter</CardTitle>
            <CardDescription>Connectez-vous à votre compte TchopMate</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="emailOrPhone">Email ou numéro de téléphone</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="emailOrPhone"
                    type="text"
                    placeholder="exemple@gmail.com ou +237 6 12 34 56 78"
                    className="pl-10"
                    value={formData.emailOrPhone}
                    onChange={(e) => handleInputChange("emailOrPhone", e.target.value)}
                  />
                </div>
                {errors.emailOrPhone && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.emailOrPhone}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Votre mot de passe"
                    className="pl-10 pr-10"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.password}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id="rememberMe"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) => handleInputChange("rememberMe", checked as boolean)}
                    className="h-5 w-5"
                  />
                  <Label htmlFor="rememberMe" className="text-sm font-medium cursor-pointer">
                    Se souvenir de moi
                  </Label>
                </div>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Connexion en cours..." : "Se connecter"}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Ou</span>
                </div>
              </div>

              <GoogleLogin />
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Pas encore de compte ? </span>
              <Link href="/register" className="text-primary hover:underline">
                S'inscrire
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}