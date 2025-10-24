import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Smartphone, Clock, Utensils, MapPin, Star, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Footer } from "@/components/ui/footer"
import { FoodSlider } from "@/components/food-slider"
import { Navbar } from "@/components/navbar"
import { ScrollReveal } from "@/components/scroll-reveal"

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32 pt-32 md:pt-40">
        <ScrollReveal>
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-block mb-6 px-4 py-2 bg-secondary rounded-full">
              <p className="text-sm font-medium text-foreground">Livraison en 30 minutes</p>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-balance mb-8 leading-tight">
              Commandez vos plats préférés à distance
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground text-balance max-w-3xl mx-auto mb-12 leading-relaxed">
              TchopMate révolutionne la restauration universitaire. Commandez en ligne, évitez les files d&apos;attente et
              savourez vos repas.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8 py-6 w-full sm:w-auto">
                  Commencer maintenant
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 w-full sm:w-auto bg-transparent">
                  Découvrir
                </Button>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-secondary/30">
        <div className="container mx-auto px-4 py-12">
          <ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">5000+</div>
                <div className="text-muted-foreground">Étudiants actifs</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">30min</div>
                <div className="text-muted-foreground">Temps moyen</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">4.8★</div>
                <div className="text-muted-foreground">Note moyenne</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">50+</div>
                <div className="text-muted-foreground">Plats disponibles</div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20 md:py-32">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-balance mb-6">Nos plats populaires</h2>
            <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto leading-relaxed">
              Découvrez une sélection de nos plats les plus appréciés par les étudiants
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={200}>
          <FoodSlider />
        </ScrollReveal>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20 md:py-32">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-balance mb-6">Comment ça marche</h2>
            <p className="text-xl md:text-2xl text-muted-foreground text-balance max-w-3xl mx-auto mb-12 leading-relaxed">
              Trois étapes simples pour profiter de vos plats préférés
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <ScrollReveal delay={0}>
            <Card className="text-center border-2 hover:border-primary transition-colors h-full">
              <CardHeader>
                <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Smartphone className="text-primary" size={32} />
                </div>
                <div className="text-6xl font-bold text-muted-foreground/20 mb-2">01</div>
                <CardTitle className="text-2xl">Parcourez le menu</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Découvrez notre sélection de plats frais et variés, mis à jour quotidiennement
                </CardDescription>
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={150}>
            <Card className="text-center border-2 hover:border-primary transition-colors h-full">
              <CardHeader>
                <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Utensils className="text-primary" size={32} />
                </div>
                <div className="text-6xl font-bold text-muted-foreground/20 mb-2">02</div>
                <CardTitle className="text-2xl">Commandez en ligne</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Passez votre commande en quelques clics et payez directement depuis l&apos;application
                </CardDescription>
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <Card className="text-center border-2 hover:border-primary transition-colors h-full">
              <CardHeader>
                <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <MapPin className="text-primary" size={32} />
                </div>
                <div className="text-6xl font-bold text-muted-foreground/20 mb-2">03</div>
                <CardTitle className="text-2xl">Récupérez votre plat</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Recevez une notification et récupérez votre commande sans faire la queue
                </CardDescription>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-secondary/30 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <ScrollReveal>
                <div>
                  <h2 className="text-4xl md:text-5xl font-bold text-balance mb-6 leading-tight">
                    Gagnez du temps, profitez de vos pauses
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                    Plus besoin de faire la queue pendant des heures. Commandez à l&apos;avance et récupérez votre repas
                    quand vous le souhaitez.
                  </p>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="text-primary" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Commande rapide</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          Commandez en moins de 2 minutes depuis votre smartphone
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Star className="text-primary" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Qualité garantie</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          Des plats préparés avec des ingrédients frais et locaux
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="text-primary" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Prix étudiants</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          Tarifs adaptés au budget étudiant avec des offres régulières
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={200}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
                    <img
                      src="/african-rice-dish-with-vegetables-and-meat.jpg"
                      alt="Plat de riz africain"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
                    <img
                      src="/grilled-chicken-with-plantains-african-cuisine.jpg"
                      alt="Poulet grillé avec plantains"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
                    <img
                      src="/african-stew-with-fufu-traditional-meal.jpg"
                      alt="Sauce avec fufu"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
                    <img
                      src="/fresh-african-salad-with-vegetables.jpg"
                      alt="Salade fraîche"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <ScrollReveal>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-balance mb-6 leading-tight">Prêt à commander ?</h2>
            <p className="text-xl text-muted-foreground text-balance mb-12 leading-relaxed">
              Rejoignez des milliers d&apos;étudiants qui utilisent déjà TchopMate pour leurs repas quotidiens
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="text-lg px-8 py-6 w-full">
                  Créer un compte
                </Button>
              </Link>
              <Link href="/resto/login" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 w-full bg-transparent">
                  Espace Restaurateur
                </Button>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
