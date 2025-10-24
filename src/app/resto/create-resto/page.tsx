"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Logo } from "@/components/logo";
import { Upload, Camera, MapPin, Store, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

export default function CreateRestoPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    nom: "",
    localisation: "",
    description: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { router.replace("/resto/login"); return; }

      const { data: compte, error: compteError } = await supabase
        .from("compte").select("id, role").eq("user_id", session.user.id).single();
      if (compteError || !compte || compte.role !== "Gerant") { router.replace("/resto/login"); return; }
  // garder l'id en scope via compteData plus tard

      const { data: resto } = await supabase
        .from("restaurant").select("id_restaurant").eq("gerant_id", compte.id).maybeSingle();
      if (resto) { router.replace(`/resto/${compte.id}`); return; }

  setInitLoading(false);
    };
    init();
  }, [router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ image: "L'image doit faire moins de 5MB" });
        return;
      }

      // Vérifier le type de fichier
      if (!file.type.startsWith("image/")) {
        setErrors({ image: "Veuillez sélectionner une image valide" });
        return;
      }

      setSelectedImage(file);
      setErrors((prev) => ({ ...prev, image: "" }));

      // Créer une preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom du restaurant est requis";
    } else if (formData.nom.trim().length < 2) {
      newErrors.nom = "Le nom doit contenir au moins 2 caractères";
    }

    if (!formData.localisation.trim()) {
      newErrors.localisation = "La localisation est requise";
    } else if (formData.localisation.trim().length < 5) {
      newErrors.localisation = "Veuillez fournir une localisation plus précise";
    }

    if (!selectedImage) {
      newErrors.image = "Une photo du restaurant est requise";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadImage = async (file: File, userId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${crypto.randomUUID()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('restaurants')
      .upload(fileName, file);

    if (error) {
      throw new Error(`Erreur upload: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('restaurants')
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      // Récupérer l'utilisateur connecté
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setErrors({ general: "Vous devez être connecté pour créer un restaurant" });
        setIsSubmitting(false);
        return;
      }

      // Récupérer le compte du gérant
      const { data: compteData, error: compteError } = await supabase
        .from("compte")
        .select("id")
        .eq("user_id", user.id)
        .eq("role", "Gerant")
        .single();

      if (compteError || !compteData) {
        setErrors({ general: "Compte gérant non trouvé" });
        setIsSubmitting(false);
        return;
      }

      // Upload de l'image
      let imageUrl = "";
      if (selectedImage) {
        try {
          imageUrl = await uploadImage(selectedImage, user.id);
        } catch (uploadError) {
          console.error("Erreur upload:", uploadError);
          setErrors({ general: "Erreur lors de l’upload de l’image" });
          setIsSubmitting(false);
          return;
        }
      }

      // Créer le restaurant (client d’abord)
      const { error: clientInsertError } = await supabase
        .from("restaurant")
        .insert([{ nom: formData.nom.trim(), localisation: formData.localisation.trim(), photo: imageUrl, gerant_id: compteData.id }]);

      if (clientInsertError) {
        // Fallback API avec token
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch("/api/gerant/restaurants", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token ?? ""}` },
          body: JSON.stringify({ nom: formData.nom.trim(), localisation: formData.localisation.trim() }),
        });
        if (!res.ok) {
          const payload = await res.json().catch(() => ({} as Record<string, unknown>));
          setErrors({ general: (payload["error"] as string) || "Erreur lors de la création du restaurant" });
          setIsSubmitting(false);
          return;
        }
      }

      // Redirection vers le tableau de bord (par id gérant)
      router.push(`/resto/${compteData.id}`);

    } catch (error) {
      console.error("Erreur inattendue:", error);
      setErrors({ general: "Une erreur inattendue s'est produite" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (initLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/resto/login" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Retour à la connexion</span>
            </Link>
            <Logo size="small" />
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 rounded-full p-3">
              <Store className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Créez votre restaurant</h1>
          <p className="text-muted-foreground">
            Renseignez les informations de votre restaurant pour commencer
          </p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Informations du restaurant</CardTitle>
            <CardDescription>
              Ces informations seront visibles par vos clients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}

              {/* Upload d'image */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Photo du restaurant</Label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer bg-muted/5 hover:bg-muted/10 transition-colors"
                  >
                    {imagePreview ? (
                      <div className="relative w-full h-full rounded-lg overflow-hidden">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Camera className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Cliquez pour uploader</span> ou glissez-déposez
                        </p>
                        <p className="text-xs text-muted-foreground">PNG, JPG jusqu&apos;à 5MB</p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      id="image-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                {errors.image && (
                  <p className="text-sm text-destructive">{errors.image}</p>
                )}
              </div>

              {/* Nom du restaurant */}
              <div className="space-y-2">
                <Label htmlFor="nom" className="text-sm font-medium">
                  Nom du restaurant *
                </Label>
                <div className="relative">
                  <Store className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="nom"
                    type="text"
                    placeholder="ex: Le Saint Jean"
                    className="pl-10 h-11"
                    value={formData.nom}
                    onChange={(e) => handleInputChange("nom", e.target.value)}
                  />
                </div>
                {errors.nom && (
                  <p className="text-sm text-destructive">{errors.nom}</p>
                )}
              </div>

              {/* Localisation */}
              <div className="space-y-2">
                <Label htmlFor="localisation" className="text-sm font-medium">
                  Localisation *
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="localisation"
                    type="text"
                    placeholder="ex: Yaoundé - Mvog-Ada, Cameroun"
                    className="pl-10 h-11"
                    value={formData.localisation}
                    onChange={(e) => handleInputChange("localisation", e.target.value)}
                  />
                </div>
                {errors.localisation && (
                  <p className="text-sm text-destructive">{errors.localisation}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description (optionnel)
                </Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez votre restaurant, vos spécialités..."
                  className="min-h-[100px] resize-none"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Création en cours..." : "Créer le restaurant"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
