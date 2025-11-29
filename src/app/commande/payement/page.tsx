"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"

type CartItem = {
  id: number
  name: string
  price: string
  quantity: number
  image: string
}

export default function PaymentConfirmationPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [orderId, setOrderId] = useState<string>("")
  // Removed unused isProcessing variable

  useEffect(() => {
    const saved = localStorage.getItem("tchopmate-cart")
    if (saved) {
      try {
        setCart(JSON.parse(saved))
      } catch (e) {
        console.warn("Erreur parsing cart", e)
        setCart([])
      }
    }
    // Générer un identifiant de commande temporaire
    setOrderId(`CMD-${Date.now()}`)
  }, [])

  const getTotalItems = () => cart.reduce((t, it) => t + it.quantity, 0)

  const getTotalPrice = () =>
    cart.reduce((total, item) => {
      const price = typeof item.price === 'number' ? item.price : (Number.parseInt(String(item.price).replace(/\D/g, "")) || 0)
      return total + price * item.quantity
    }, 0)

  const saveOrderAndClearCart = (paymentMethod: string) => {
    const order = {
      id: orderId || `CMD-${Date.now()}`,
      date: new Date().toISOString(),
      items: cart,
      total: getTotalPrice(),
      paymentMethod,
      status: paymentMethod === 'mobile_money' ? 'pending_payment' : 'to_pay_at_restaurant',
    }
    try {
      localStorage.setItem('lastOrder', JSON.stringify(order))
      localStorage.removeItem('tchopmate-cart')
      setCart([])
    } catch (e) {
      console.warn('Erreur sauvegarde commande', e)
    }
  }

  const handleMobileMoney = () => {
    if (cart.length === 0) return
    setIsProcessing(true)
    saveOrderAndClearCart('mobile_money')
    // Simulation de redirection vers le flow Mobile Money
    setTimeout(() => {
      setIsProcessing(false)
      alert('Fonctionnalité Mobile Money pour une prochaine fois .')
      router.push('/commandes')
    }, 700)
  }

  const handlePayAtRestaurant = () => {
    if (cart.length === 0) return
    setIsProcessing(true)
    saveOrderAndClearCart('au_restaurant')
    setTimeout(() => {
      setIsProcessing(false)
      alert('Commande enregistrée — paiement à effectuer au restaurant')
      router.push('/commandes')
    }, 400)
  }

  const handleCancelOrder = () => {
    const ok = confirm('Voulez-vous annuler la commande ?')
    if (!ok) return
    try {
      localStorage.removeItem('tchopmate-cart')
      setCart([])
    } catch (e) {
      console.warn('Erreur annulation panier', e)
    }
    router.push('/menu')
  }

  return (
    <div className="min-h-screen bg-yellow-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-orange-100 p-3 rounded-full">
            <ShoppingCart className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Confirmation de paiement</h1>
            <p className="text-sm text-gray-600">Vérifiez les détails de votre commande avant de payer</p>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Votre panier est vide.</p>
            <Button onClick={() => router.push("/menu")} className="bg-orange-500 hover:bg-orange-600 text-white">
              Retour au menu
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="relative h-16 w-16 flex-shrink-0">
                    <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover rounded-md" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-gray-900 truncate">{item.name}</h3>
                    <p className="text-xs text-gray-600">{typeof item.price === 'number' ? `${item.price} FCFA` : item.price} × {item.quantity}</p>
                    <p className="text-sm font-bold text-orange-600">{(typeof item.price === 'number' ? item.price : (Number.parseInt(String(item.price).replace(/\D/g, "")) || 0)) * item.quantity} FCFA</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Articles</span>
                <span className="font-semibold">{getTotalItems()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sous-total</span>
                <span className="font-semibold">{getTotalPrice()} FCFA</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total à payer</span>
                <span className="text-orange-600">{getTotalPrice()} FCFA</span>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white" onClick={() => alert('Simulation paiement — implémentez votre flow réel')}>
                Payer {getTotalPrice()} FCFA
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => router.push('/menu')}>
                Modifier la commande
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
