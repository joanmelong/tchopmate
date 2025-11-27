"use client"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface Slide {
  image: string
  title: string
  description: string
}

// IMPORTANT: Les images dans /public doivent être référencées par un chemin absolu commençant par "/".
// Eviter tout préfixe comme "@/public" ou chemins relatifs sans slash qui provoquent une erreur URL.
const slides: Slide[] = [
  {
    image: "/delicious-african-jollof-rice-with-grilled-chicken.jpg",
    title: "Riz Jollof au Poulet",
    description: "Notre spécialité maison avec du poulet grillé et des légumes frais",
  },
  {
    image: "/traditional-african-ndole-dish-with-plantains-and-.jpg",
    title: "Ndolé Traditionnel",
    description: "Plat camerounais authentique avec plantains et viande",
  },
  {
    image: "/african-peanut-soup-with-fufu-and-vegetables.jpg",
    title: "Sauce Arachide & Fufu",
    description: "Sauce onctueuse servie avec du fufu fait maison",
  },
  {
    image: "/grilled-fish-with-atti-k--and-spicy-sauce.jpg",
    title: "Poisson Braisé & Attiéké",
    description: "Poisson frais grillé accompagné d'attiéké et sauce pimentée",
  },
];

export function FoodSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      <div className="relative aspect-[4/3] md:aspect-[16/9] rounded-2xl overflow-hidden bg-muted">
        <Image
          src={slides[currentSlide].image || "/placeholder.svg"}
          alt={slides[currentSlide].title}
          className="w-full h-full object-cover"
          width={600}
          height={450}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
          <h3 className="text-2xl md:text-4xl font-bold mb-2">{slides[currentSlide].title}</h3>
          <p className="text-sm md:text-lg text-white/90">{slides[currentSlide].description}</p>
        </div>
      </div>

      <Button
        variant="outline"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border-0 shadow-lg"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border-0 shadow-lg"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      <div className="flex justify-center gap-2 mt-6">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"
            }`}
            aria-label={`Aller à la diapositive ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
