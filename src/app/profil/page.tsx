"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Logo } from "@/components/logo"
import { ArrowLeft, User, Mail, Phone, Save, Loader2, Camera, Edit2, CheckCircle, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import { Footer } from "@/components/ui/footer"
import { supabase } from "@/lib/supabaseClient"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { useToast } from "@/hooks/use-toast"

type ProfileData = {
  nom: string
  prenom: string
  email: string
  numero_tel: string
}

export default function ProfilPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData>({
    nom: "",
    prenom: "",
    email: "",
    numero_tel: "",
  })

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push("/login?redirect=/profil")
          return
        }

        setUser(user)

        // Charger les données du profil depuis la table compte
        const { data: compte, error } = await supabase
          .from("compte")
          .select("nom, prenom, email, numero_tel")
          .eq("user_id", user.id)
          .maybeSingle()

        if (error) {
          console.error("Erreur chargement profil:", error)
        }

        if (compte) {
          setProfileData({
            nom: compte.nom || "",
            prenom: compte.prenom || "",
            email: compte.email || user.email || "",
            numero_tel: compte.numero_tel || "",
          })
        } else {
          // Si pas de compte, utiliser les données de l'auth
          setProfileData({
            nom: "",
            prenom: "",
            email: user.email || "",
            numero_tel: "",
          })
        }
      } catch (error) {
        console.error("Erreur:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router])

  const handleSave = async () => {
    if (!user) return

    // Validation
    if (!profileData.nom.trim() || !profileData.prenom.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom et le prénom sont requis",
        variant: "destructive",
      })
      return
    }

    if (profileData.numero_tel && !/^\+?[0-9\s-]{8,}$/.test(profileData.numero_tel)) {
      toast({
        title: "Erreur",
        description: "Numéro de téléphone invalide",
        variant: "destructive",
      })
      return
    }

    setSaving(true)

    try {
      // Vérifier si le compte existe
      const { data: existingCompte } = await supabase
        .from("compte")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle()

      if (existingCompte) {
        // Mettre à jour le compte existant
        const { error } = await supabase
          .from("compte")
          .update({
            nom: profileData.nom.trim(),
            prenom: profileData.prenom.trim(),
            email: profileData.email.trim(),
            numero_tel: profileData.numero_tel.trim() || null,
          })
          .eq("user_id", user.id)

        if (error) throw error
      } else {
        // Créer un nouveau compte
        const { error } = await supabase
          .from("compte")
          .insert({
            user_id: user.id,
            nom: profileData.nom.trim(),
            prenom: profileData.prenom.trim(),
            email: profileData.email.trim(),
            numero_tel: profileData.numero_tel.trim() || null,
            role: "Client",
          })

        if (error) throw error
      }

      toast({
        title: "Succès",
        description: "Votre profil a été mis à jour",
      })
    } catch (error: any) {
      console.error("Erreur sauvegarde profil:", error)
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder le profil",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Chargement de votre profil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()} className="hover:bg-orange-50">
                <ArrowLeft className="h-5 w-5 text-orange-600" />
              </Button>
              <Logo size="small" />
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-orange-600">Mon Profil</h1>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8 cursor-pointer border-2 border-orange-200">
                <AvatarImage src={user?.user_metadata?.avatar_url || "/student-avatar.png"} />
                <AvatarFallback className="bg-orange-100 text-orange-600 font-semibold">
                  {profileData.prenom?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative group">
                  <Avatar className="h-32 w-32 border-4 border-white shadow-2xl transition-transform group-hover:scale-105">
                    <AvatarImage src={user?.user_metadata?.avatar_url || "/student-avatar.png"} />
                    <AvatarFallback className="bg-white text-orange-600 font-bold text-4xl">
                      {profileData.prenom?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-orange-50 transition-colors">
                    <Camera className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
                <div className="text-center md:text-left flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    {profileData.prenom && profileData.nom 
                      ? `${profileData.prenom} ${profileData.nom}` 
                      : "Complétez votre profil"}
                  </h1>
                  <p className="text-orange-100 mb-3 flex items-center justify-center md:justify-start gap-2">
                    <Mail className="h-4 w-4" />
                    {profileData.email}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                      <Shield className="h-3 w-3 mr-1" />
                      Client vérifié
                    </Badge>
                    {profileData.numero_tel && (
                      <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Téléphone ajouté
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form Card */}
        <Card className="shadow-xl border-2 border-orange-100 hover:shadow-2xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50 border-b-2 border-orange-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-orange-500 p-3 rounded-xl shadow-md">
                  <Edit2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Modifier mes informations</CardTitle>
                  <CardDescription>Mettez à jour vos données personnelles</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-8 space-y-6">

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 group">
                <Label htmlFor="prenom" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <div className="bg-orange-100 p-1.5 rounded-lg group-hover:bg-orange-200 transition-colors">
                    <User className="h-4 w-4 text-orange-600" />
                  </div>
                  Prénom *
                </Label>
                <Input
                  id="prenom"
                  value={profileData.prenom}
                  onChange={(e) => setProfileData({ ...profileData, prenom: e.target.value })}
                  placeholder="Votre prénom"
                  className="border-2 border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all h-12 text-base"
                />
              </div>

              <div className="space-y-2 group">
                <Label htmlFor="nom" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <div className="bg-orange-100 p-1.5 rounded-lg group-hover:bg-orange-200 transition-colors">
                    <User className="h-4 w-4 text-orange-600" />
                  </div>
                  Nom *
                </Label>
                <Input
                  id="nom"
                  value={profileData.nom}
                  onChange={(e) => setProfileData({ ...profileData, nom: e.target.value })}
                  placeholder="Votre nom"
                  className="border-2 border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all h-12 text-base"
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <Label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <div className="bg-gray-100 p-1.5 rounded-lg">
                  <Mail className="h-4 w-4 text-gray-600" />
                </div>
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                disabled
                className="border-2 border-gray-200 bg-gray-50 text-gray-600 h-12 text-base cursor-not-allowed"
              />
              <div className="flex items-center gap-2 mt-2">
                <div className="h-1 w-1 rounded-full bg-gray-400"></div>
                <p className="text-xs text-gray-500">L'email ne peut pas être modifié pour des raisons de sécurité</p>
              </div>
            </div>

            <div className="space-y-2 group">
              <Label htmlFor="numero_tel" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <div className="bg-orange-100 p-1.5 rounded-lg group-hover:bg-orange-200 transition-colors">
                  <Phone className="h-4 w-4 text-orange-600" />
                </div>
                Numéro de téléphone
              </Label>
              <Input
                id="numero_tel"
                type="tel"
                value={profileData.numero_tel}
                onChange={(e) => setProfileData({ ...profileData, numero_tel: e.target.value })}
                placeholder="+237 6XX XX XX XX"
                className="border-2 border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all h-12 text-base"
              />
              <div className="flex items-center gap-2 mt-2">
                <div className="h-1 w-1 rounded-full bg-orange-400"></div>
                <p className="text-xs text-gray-500">Format international recommandé (ex: +237 6XX XX XX XX)</p>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-start gap-3">
              <div className="bg-blue-500 p-2 rounded-lg flex-shrink-0">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Vos données sont sécurisées</h4>
                <p className="text-sm text-blue-700">
                  Nous protégeons vos informations personnelles et ne les partageons jamais avec des tiers.
                </p>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full h-14 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Enregistrement en cours...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Enregistrer les modifications
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
