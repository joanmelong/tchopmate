import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/ui/footer"
import { ScrollReveal } from "@/components/scroll-reveal"
import { Users, Target, Heart, Award } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">À propos de TchopMate</h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
                Votre partenaire de confiance pour une expérience culinaire universitaire exceptionnelle
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="max-w-4xl mx-auto mb-20">
              <div className="bg-card rounded-2xl p-8 md:p-12 shadow-lg">
                <h2 className="text-3xl font-bold mb-6">Notre Histoire</h2>
                <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                  TchopMate est née de la passion de rendre l' expérience culinaire universitaire plus accessible,
                  pratique et agréable. Nous comprenons les défis auxquels font face les étudiants : emplois du temps
                  chargés, budgets limités et le désir de manger sainement.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  C'est pourquoi nous avons créé une plateforme qui connecte les étudiants avec des restaurants
                  universitaires de qualité, offrant des menus variés à des prix adaptés au budget étudiant.
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
              <div className="bg-card rounded-xl p-6 text-center shadow-md hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Communauté</h3>
                <p className="text-muted-foreground">Plus de 10 000 étudiants nous font confiance</p>
              </div>

              <div className="bg-card rounded-xl p-6 text-center shadow-md hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Mission</h3>
                <p className="text-muted-foreground">Simplifier l'accès à une alimentation de qualité</p>
              </div>

              <div className="bg-card rounded-xl p-6 text-center shadow-md hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Passion</h3>
                <p className="text-muted-foreground">Dédiés à votre satisfaction et bien-être</p>
              </div>

              <div className="bg-card rounded-xl p-6 text-center shadow-md hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Excellence</h3>
                <p className="text-muted-foreground">Service de qualité et innovation constante</p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.4}>
            <div className="max-w-4xl mx-auto">
              <div className="bg-card rounded-2xl p-8 md:p-12 shadow-lg">
                <h2 className="text-3xl font-bold mb-6">Nos Valeurs</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-primary">Accessibilité</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Nous croyons que chaque étudiant mérite un accès facile à des repas de qualité, peu importe son
                      budget ou son emploi du temps.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-primary">Qualité</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Nous travaillons uniquement avec des restaurants qui partagent notre engagement envers la
                      fraîcheur et la qualité des ingrédients.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-primary">Innovation</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Nous améliorons constamment notre plateforme pour offrir la meilleure expérience utilisateur
                      possible.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </main>

      <Footer />
    </div>
  )
}
