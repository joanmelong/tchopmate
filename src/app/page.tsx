import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/logo"
import { Users, Clock, Star, ChefHat } from "lucide-react"
import Link from "next/link"
import { Footer } from "@/components/ui/footer"

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-yellow-600 bg-gradient-to-b from-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Logo size="large" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-balance mb-4">Bienvenue sur TchopMate</h1>
          <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
            Votre application de restaurant universitaire. Commandez facilement vos repas et découvrez les menus du
            jour.
          </p>
        </header>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <ChefHat className="mx-auto mb-2 text-primary" size={32} />
              <CardTitle>Menus Variés</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Découvrez nos plats préparés avec des ingrédients frais et locaux</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Clock className="mx-auto mb-2 text-primary" size={32} />
              <CardTitle>Commande Rapide</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Commandez en quelques clics et récupérez votre repas sans attendre</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Star className="mx-auto mb-2 text-primary" size={32} />
              <CardTitle>Prix Étudiants</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Profitez de tarifs préférentiels adaptés au budget étudiant</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Auth Buttons */}
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <Users className="mx-auto mb-2 text-primary" size={32} />
              <CardTitle>Rejoignez TchopMate</CardTitle>
              <CardDescription>Connectez-vous ou créez votre compte pour commencer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/register" className="w-full">
                <Button className="w-full" size="lg">
                  S'inscrire
                </Button>
              </Link>
              <Link href="/login" className="w-full">
                <Button variant="outline" className="w-full bg-transparent" size="lg">
                  Se connecter
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        {/* Ancien footer */}
        {/* <p>&copy; 2024 TchopMate. Fait avec ❤️ pour les étudiants.</p> */}
      </div>
      {/* Nouveau Footer */}
      <Footer />
    </div>
    
  )
}
