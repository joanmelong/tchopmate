"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ShoppingCart, CreditCard, DollarSign, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { createCommande } from "@/services/commandes"
import { supabase } from "@/lib/supabaseClient"
import type { User as SupabaseUser } from "@supabase/supabase-js"

type CartItem = {
  id: number
  name: string
  price: string
  quantity: number
  image: string
}

export default function PaymentPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [orderId, setOrderId] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Vérifier l'authentification et écouter les changements
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (e) {
        console.error('Erreur vérification authentification:', e)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Écouter les changements d'authentification (y compris la connexion)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      
      if (session?.user) {
        // Utilisateur connecté - mettre à jour l'état
        setUser(session.user)
        setIsLoading(false)
      } else {
        // Utilisateur déconnecté
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

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
      const price = Number.parseInt(item.price.replace(/\D/g, "")) || 0
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
    alert('La fonctionnalité de paiement par Mobile Money sera développée prochainement. Veuillez choisir un autre mode de paiement.')
  }

  const handlePayAtRestaurant = async () => {
    if (cart.length === 0) return
    setIsProcessing(true)

      try {
        const payload = {
          items: cart.map((it) => ({ name: it.name, quantity: it.quantity })),
          commentaire: null,
          livraison: false,
          creneau_retrait: null,
        }

        const created = await createCommande(payload)

        try {
          const existingOrders = localStorage.getItem('tchopmate-orders')
          console.log(existingOrders)
          const orders = existingOrders ? JSON.parse(existingOrders) : []
          orders.unshift(created)
          localStorage.setItem('tchopmate-orders', JSON.stringify(orders))
          localStorage.removeItem('tchopmate-cart')
          setCart([])
        } catch (e) {
          console.warn('Erreur sauvegarde commande locale', e)
        }

        setIsProcessing(false)
        alert('Commande enregistrée — paiement à effectuer au restaurant')
        router.push('/commandes')
      } catch (e: any) {
        console.error('Exception création commande:', e)
        alert('Erreur lors de la création de la commande : ' + (e?.message || 'Erreur inconnue'))
        setIsProcessing(false)
      }
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

  // Afficher un loader pendant la vérification de l'authentification
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    )
  }

  // Afficher un message si l'utilisateur n'est pas authentifié
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-50 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CreditCard className="h-10 w-10 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Connexion requise</h2>
            <p className="text-gray-600 mb-6">
              Vous devez être connecté pour passer une commande. Connectez-vous pour continuer.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => router.push('/login?redirect=/commande/payment')}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Se connecter
              </Button>
              <Button
                onClick={() => router.push('/menu')}
                variant="outline"
                className="border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                Retour au menu
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-gradient-to-br from-orange-500 to-yellow-500 p-4 rounded-full">
            <ShoppingCart className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Paiement de la Commande</h1>
            <p className="text-sm text-gray-600 mt-1">Commande n° {orderId}</p>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4 text-lg">Votre panier est vide.</p>
            <Button onClick={() => router.push("/menu")} className="bg-orange-500 hover:bg-orange-600 text-white">
              Retour au menu
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Récapitulatif de la commande */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <ShoppingCart className="h-6 w-6 text-orange-500" />
                Récapitulatif de la commande
              </h2>

              {/* Articles */}
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-100">
                    <div className="relative h-20 w-20 flex-shrink-0">
                      <Image 
                        src={item.image || "/placeholder.svg"} 
                        alt={item.name} 
                        fill 
                        className="object-cover rounded-lg border border-orange-200"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{item.price} × {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-orange-600">
                        {(Number.parseInt(item.price.replace(/\D/g, "")) || 0) * item.quantity} FCFA
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t-2 border-orange-200 pt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Articles</span>
                  <span className="font-semibold text-gray-900">{getTotalItems()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Frais de livraison</span>
                  <span className="font-semibold text-gray-900">0 FCFA</span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t-2 border-orange-300 pt-4 bg-gradient-to-r from-orange-50 to-yellow-50 px-3 py-3 rounded-lg">
                  <span className="text-gray-900">Total à payer</span>
                  <span className="text-orange-600">{getTotalPrice()} FCFA</span>
                </div>
              </div>
            </div>

            {/* Options de paiement */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <CreditCard className="h-6 w-6 text-orange-500" />
                  Mode de paiement
                </h3>

                <div className="space-y-4">
                  {/* Mobile Money */}
                  <Button
                    disabled={isProcessing}
                    onClick={handleMobileMoney}
                    className="w-full h-auto py-4 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold flex items-center gap-3 justify-center transition-all shadow-md hover:shadow-lg"
                  >
                    <DollarSign className="h-5 w-5" />
                    <span>Payer par Mobile Money</span>
                  </Button>

                  {/* Au restaurant */}
                  <Button
                    disabled={isProcessing}
                    onClick={handlePayAtRestaurant}
                    className="w-full h-auto py-4 px-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-semibold flex items-center gap-3 justify-center transition-all shadow-md hover:shadow-lg"
                  >
                    <CreditCard className="h-5 w-5" />
                    <span>Payer au restaurant</span>
                  </Button>

                  {/* Annuler commande */}
                  <Button
                    disabled={isProcessing}
                    onClick={handleCancelOrder}
                    variant="outline"
                    className="w-full h-auto py-4 px-4 border-2 border-red-300 text-red-600 hover:bg-red-50 rounded-xl font-semibold flex items-center gap-3 justify-center transition-all"
                  >
                    <X className="h-5 w-5" />
                    <span>Annuler la commande</span>
                  </Button>
                </div>

                {isProcessing && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-300 rounded-lg text-sm text-blue-700 text-center">
                    Traitement en cours...
                  </div>
                )}
              </div>

              {/* Info utile */}
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                <p className="text-sm text-gray-700">
                  <strong>Note:</strong> Vous pouvez modifier votre commande en retournant au menu avant le paiement.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
