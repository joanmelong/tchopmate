"use client"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Logo } from "@/components/logo"
import { Bell, Clock, MapPin, Star, Calendar, Settings, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { GoogleLogin } from "@/components/auth/GoogleLogin"
import { Footer } from "@/components/ui/footer"

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter()

  useEffect(() => {
    // Récupérer l'utilisateur actuel
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Logo size="small" />
              <div className="hidden md:block">
                <h1 className="text-xl font-semibold text-gray-900">Bienvenue sur TchopMate</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-orange-500 text-white text-xs">
                  3
                </Badge>
              </Button>
              {user ? (
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage src={user.user_metadata?.avatar_url || "/student-avatar.png"} />
                    <AvatarFallback className="bg-orange-100 text-orange-600">
                      {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900">
                      {user.user_metadata?.full_name || "Utilisateur"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user.user_metadata?.school || "Université de Yaoundé"}
                    </p>
                  </div>
                </div>
              ) : (
                <GoogleLogin />
              )}

              <Button variant="ghost" size="sm">
                <Settings className="h-5 w-5" />
              </Button>

              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Bon appétit ! 🍽️</h2>
                <p className="text-orange-100 mb-4">Découvrez les délicieux plats de votre restaurant universitaire</p>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Ouvert jusqu'à 20h</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>Campus Central</span>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/20 rounded-xl p-4 text-center">
                  <Calendar className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">Menu du jour</p>
                  <p className="text-xs text-orange-100">Lundi 23 Sept</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push("/menu")}>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-lg">Menu du jour</CardTitle>
              <CardDescription>Consultez tous les plats, boissons et desserts disponibles aujourd'hui</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-lg">Mes commandes</CardTitle>
              <CardDescription>Suivez l'état de vos commandes en cours</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                <Star className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-lg">Mes favoris</CardTitle>
              <CardDescription>Retrouvez vos plats préférés rapidement</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
