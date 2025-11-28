// Fichier: page2.tsx

"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ShoppingCart, CreditCard, DollarSign, X } from "lucide-react"
import { useRouter } from "next/navigation"
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
  const [sessionToken, setSessionToken] = useState<string | null>(null) // CECI MANQUAIT !
  const [isLoading, setIsLoading] = useState(true)

  // Vérification de l'authentification et REDIRECTION IMMÉDIATE
useEffect(() => {
  let isMounted = true

  const handleSession = (session: any | null) => {
    if (isMounted) {
      if (session?.user && session.access_token) {
        // L'utilisateur est connecté. On stocke le token et on arrête le chargement.
        setUser(session.user)
        setSessionToken(session.access_token)
        setIsLoading(false)
      } else {
        // L'utilisateur n'est pas connecté (session définitivement nulle)
        // Redirection forcée vers la page de connexion
        router.replace('/login?redirect=/commande/payment')
        // Ne PAS appeler setIsLoading(false) ici, car la redirection quitte la page.
      }
    }
  }

  // 1. Première vérification de l'état de la session (lecture du localStorage)
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (isMounted && session) {
      handleSession(session)
    } else if (isMounted) {
      // Si la session initiale est null, on redirige, car on a fini de vérifier.
      handleSession(null)
    }
  })

  // 2. Écouteur pour les changements en temps réel (déconnexion, expiration du token, etc.)
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (isMounted) {
      // Si l'état change (déconnexion, reconnexion), on gère la nouvelle session
      handleSession(session)
    }
  })

  return () => { 
    isMounted = false 
    subscription.unsubscribe() // Nettoyage de l'écouteur
  }
}, [router])

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

  // Suppression de saveOrderAndClearCart car c'est la fonction handlePayAtRestaurant qui gère la logique métier API

  const handleMobileMoney = () => {

    if (cart.length === 0) return
    alert('La fonctionnalité de paiement par Mobile Money sera développée prochainement. Veuillez choisir un autre mode de paiement.')
  }

  // const handlePayAtRestaurant = async () => {
  //   // Vérification de sécurité avant l'appel API
  //  if (cart.length === 0 || !sessionToken) { // <-- Utilisez sessionToken pour la vérification
  //       if (!sessionToken) {
  //            alert('Session expirée ou utilisateur déconnecté. Veuillez vous reconnecter.')
  //            router.push('/login?redirect=/commande/payment')
  //       }
  //       return
  //   }
    
  //   setIsProcessing(true)

  //     try {
  //       const payload = {
  //         items: cart.map((it) => ({ name: it.name, quantity: it.quantity })),
  //         commentaire: null,
  //         livraison: false,
  //         creneau_retrait: null,
  //       }

  //       // Appel à la logique métier (création de commande)
      
  //       const created = await createCommande(payload,sessionToken) // Logique API côté client

  //       // Sauvegarde locale de l'historique de commandes et nettoyage du panier
  //       try {
  //         const existingOrders = localStorage.getItem('tchopmate-orders')
  //         const orders = existingOrders ? JSON.parse(existingOrders) : []
  //         orders.unshift(created)
  //         localStorage.setItem('tchopmate-orders', JSON.stringify(orders))
  //         localStorage.removeItem('tchopmate-cart')
  //         setCart([])
  //       } catch (e) {
  //         console.warn('Erreur sauvegarde commande locale', e)
  //       }

  //       setIsProcessing(false)
  //       alert('Commande enregistrée — paiement à effectuer au restaurant')
  //       // Revenir à la page des menus ou à la liste des commandes
  //       router.push('/commandes') 
  //     } catch (e: any) {
  //       console.error('Exception création commande:', e)
  //       const errorMessage = e?.message || 'Erreur inconnue'
        
  //       // Failsafe: Redirection si l'API de création de commande renvoie une erreur d'authentification (401)
  //       if (errorMessage.includes('connecté pour passer une commande') || errorMessage.includes('Authentification requise')) {
  //            alert('Votre session a expiré. Veuillez vous reconnecter.')
  //            router.push('/login?redirect=/commande/payment')
  //       } else {
  //            alert('Erreur lors de la création de la commande : ' + errorMessage)
  //       }
       
  //       setIsProcessing(false)
  //     }
  // }
 const saveOrderAndClearCart = (paymentMethod: string) => {
    // Créer l'objet commande au format de l'API
    const orderId = `CMD-${Date.now()}`
    const order = {
      id: orderId,
      id_commande: orderId,
      date: new Date().toISOString(),
      date_commande: new Date().toISOString(),
      items: cart,
      total: getTotalPrice(),
      montant_total: getTotalPrice(),
      paymentMethod,
      status: paymentMethod === 'mobile_money' ? 'pending_payment' : 'to_pay_at_restaurant',
      statut: paymentMethod === 'mobile_money' ? 'en_attente_paiement' : 'en_attente',
    }
    
    try {
      // 1. Sauvegarder dans localStorage (tchopmate-orders pour l'affichage)
      const existingOrders = localStorage.getItem('tchopmate-orders')
      const orders = existingOrders ? JSON.parse(existingOrders) : []
      orders.unshift(order) // Ajouter en début de liste
      localStorage.setItem('tchopmate-orders', JSON.stringify(orders))
      console.log('Commande sauvegardée dans localStorage:', order)
      
      // 2. Nettoyer le panier
      localStorage.removeItem('tchopmate-cart')
      setCart([])
    } catch (e) {
      console.warn('Erreur sauvegarde commande localStorage', e)
    }
  }

  // const handleMobileMoney = () => {
  //   if (cart.length === 0) return
  //   setIsProcessing(true)
  //   saveOrderAndClearCart('mobile_money')
  //   // Simulation de redirection vers le flow Mobile Money
  //   setTimeout(() => {
  //     setIsProcessing(false)
  //     alert('Fonctionnalité Mobile Money pour une prochaine fois .')
  //     router.push('/commandes')
  //   }, 700)
  // }
   const handlePayAtRestaurant = async () => {
    if (cart.length === 0 || !sessionToken || !user) {
      alert('Panier vide, session expirée ou utilisateur non identifié')
      return
    }
    
    setIsProcessing(true)
    
    try {
      const newOrderId = `CMD-${Date.now()}`
      
      // 1. Sauvegarder dans localStorage d'abord
      saveOrderAndClearCart('au_restaurant')
      
      // 2. Créer la commande en BD via l'API
      const payload = {
        items: cart.map((it) => ({ name: it.name, quantity: it.quantity })),
        commentaire: null,
        livraison: false,
        creneau_retrait: null,
      }
      
      const res = await fetch('/api/commandes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify(payload),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        console.error('Erreur création commande BD:', {
          status: res.status,
          statusText: res.statusText,
          error: data.error,
          data: data
        })
        alert(`Erreur lors de la création de la commande: ${data.error || 'Erreur inconnue'}`)
        setIsProcessing(false)
        return
      }
      
      setIsProcessing(false)
      // Rediriger vers la page de succès
      router.push(`/commande/success?orderId=${encodeURIComponent(newOrderId)}`)
    } catch (e: any) {
      console.error('Exception création commande:', e)
      const newOrderId = `CMD-${Date.now()}`
      setIsProcessing(false)
      // Rediriger vers la page de succès même en cas d'erreur BD
      // car la commande est sauvegardée localement
      router.push(`/commande/success?orderId=${encodeURIComponent(newOrderId)}`)
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

  // Afficher un loader pendant le traitement de la commande
  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-50 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Création de votre commande...</h2>
          <p className="text-gray-600">Veuillez patienter pendant que nous traitons votre demande.</p>
          
          {/* Étapes du traitement */}
          <div className="mt-8 space-y-3 text-left max-w-sm mx-auto">
            <div className="flex items-center gap-3 text-green-700">
              <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">✓</div>
              <span>Panier enregistré</span>
            </div>
            <div className="flex items-center gap-3 text-orange-600 animate-pulse">
              <div className="flex-shrink-0 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm">⏳</div>
              <span>Création en base de données...</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <div className="flex-shrink-0 w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm">3</div>
              <span>Redirection vers votre commande</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // L'affichage de la page n'a lieu que si isLoading est faux et que l'utilisateur est présent.
  // La redirection a lieu dans useEffect si !user.

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
            {/* Récapitulatif de la commande (Reste inchangé) */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <ShoppingCart className="h-6 w-6 text-orange-500" />
                Récapitulatif de la commande
              </h2>

              {/* Articles (Reste inchangé) */}
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
                        {(typeof item.price === 'number' ? item.price : Number.parseInt(String(item.price).replace(/\D/g, "")) || 0) * item.quantity} FCFA
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total (Reste inchangé) */}
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

            {/* Options de paiement (Reste inchangé, sauf pour la logique de handlePayAtRestaurant) */}
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