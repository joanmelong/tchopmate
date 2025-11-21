/**
 * Exemple d'utilisation du service de commande avec génération de QR code
 * Ce fichier montre comment intégrer tous les composants ensemble
 */

'use client';

import React, { useState, useEffect } from 'react';
import { OrderConfirmation } from '@/components/OrderConfirmation';
import { OrderService } from '@/services/OrderService';
import { SupabaseOrderRepository } from '@/data/repositories/SupabaseOrderRepository';
import { User, UserRole } from '@/core/entities/User';
import { Order } from '@/core/entities/Order';
import { supabase } from '@/lib/supabaseClient';

// Simulation d'un repository pour les plats (à implémenter selon vos besoins)
class MockPlatRepository {
  async getById(id: number) {
    // Retourner un plat mock pour les tests
    return {
      id,
      nom: `Plat ${id}`,
      prix: 1500,
      isAvailable: () => true
    };
  }
}

export default function OrderExamplePage() {
  const [orderService, setOrderService] = useState<OrderService | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Initialiser les repositories
        const orderRepository = new SupabaseOrderRepository();
        const platRepository = new MockPlatRepository(); // À remplacer par une vraie implémentation

        // Créer le service de commande
        const service = new OrderService(
          orderRepository as any, // Type assertion temporaire pour l'exemple
          platRepository as any   // Type assertion temporaire pour l'exemple
        );

        setOrderService(service);

        // Récupérer l'utilisateur actuel
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Créer une entité User (adapter selon votre structure)
          const userEntity = new User({
            id: parseInt(user.id), // Supposons que l'ID est numérique
            nom: user.user_metadata?.nom || 'Nom',
            prenom: user.user_metadata?.prenom || 'Prénom',
            email: user.email || '',
            role: UserRole.STUDENT // Étudiant
          });
          setCurrentUser(userEntity);
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation des services:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeServices();
  }, []);

  const handleOrderConfirmed = (order: Order, qrCode: string) => {
    console.log('Commande confirmée:', {
      orderId: order.id,
      status: order.status,
      total: order.totalPrice,
      qrCodeLength: qrCode.length
    });
    
    // Ici vous pouvez :
    // - Rediriger vers une page de confirmation
    // - Afficher une notification de succès
    // - Envoyer une notification push
    // - Etc.
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent"></div>
        <span className="ml-2">Chargement...</span>
      </div>
    );
  }

  if (!orderService || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur lors de l&apos;initialisation</p>
          <p className="text-gray-600">Veuillez vous connecter pour continuer</p>
        </div>
      </div>
    );
  }

  // Exemple d'articles de commande
  const exampleOrderItems = [
    {
      platId: 1,
      platNom: 'Ndolé aux crevettes',
      quantite: 2,
      prixUnitaire: 2500,
      image: '/images/ndole.jpg' // Optionnel
    },
    {
      platId: 2,
      platNom: 'Riz sauté aux légumes',
      quantite: 1,
      prixUnitaire: 1800,
      image: '/images/riz-saute.jpg' // Optionnel
    },
    {
      platId: 3,
      platNom: 'Jus de bissap',
      quantite: 2,
      prixUnitaire: 500,
      image: '/images/bissap.jpg' // Optionnel
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Confirmation de commande
          </h1>
          <p className="text-gray-600">
            Vérifiez votre commande et confirmez pour générer votre QR code
          </p>
        </div>

        <OrderConfirmation
          orderItems={exampleOrderItems}
          restaurantId="restaurant-uuid-123" // ID du restaurant
          restaurantName="Restaurant Universitaire Saint Jean"
          student={currentUser}
          orderService={orderService}
          onOrderConfirmed={handleOrderConfirmed}
        />

        {/* Informations développeur (à retirer en production) */}
        <div className="mt-8 max-w-2xl mx-auto">
          <details className="bg-white p-4 rounded-lg shadow-sm border">
            <summary className="cursor-pointer font-medium text-gray-900 mb-2">
              Informations de développement
            </summary>
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Utilisateur:</strong> {currentUser.nom} {currentUser.prenom}</p>
              <p><strong>Email:</strong> {currentUser.email}</p>
              <p><strong>Rôle:</strong> {currentUser.role}</p>
              <p><strong>Articles:</strong> {exampleOrderItems.length}</p>
              <p><strong>Total:</strong> {exampleOrderItems.reduce((total, item) => total + (item.quantite * item.prixUnitaire), 0).toLocaleString('fr-FR')} FCFA</p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}

/**
 * GUIDE D'INTÉGRATION
 * 
 * Pour utiliser ce système de commande dans votre application :
 * 
 * 1. CONFIGURATION DES SERVICES
 *    - Implémentez un vrai IPlatRepository pour vos plats
 *    - Configurez Supabase avec les bonnes variables d'environnement
 *    - Adaptez les types User selon votre structure
 * 
 * 2. INTÉGRATION DANS UNE PAGE DE PANIER
 *    ```typescript
 *    import { OrderConfirmation } from '@/components/OrderConfirmation';
 *    
 *    // Dans votre composant de panier
 *    const cartItems = cart.items.map(item => ({
 *      platId: item.id,
 *      platNom: item.name,
 *      quantite: item.quantity,
 *      prixUnitaire: item.price,
 *      image: item.image
 *    }));
 *    
 *    return (
 *      <OrderConfirmation
 *        orderItems={cartItems}
 *        restaurantId={selectedRestaurant.id}
 *        restaurantName={selectedRestaurant.name}
 *        student={currentUser}
 *        orderService={orderService}
 *        onOrderConfirmed={(order, qrCode) => {
 *          // Gérer la confirmation
 *          router.push(`/orders/${order.id}`);
 *        }}
 *      />
 *    );
 *    ```
 * 
 * 3. GESTION DES COMMANDES CÔTÉ RESTAURANT
 *    ```typescript
 *    const { orders, updateOrderStatus } = useOrderService(orderService);
 *    
 *    // Récupérer les commandes du restaurant
 *    useEffect(() => {
 *      orderService.getOrdersByRestaurantId(restaurantId);
 *    }, []);
 *    
 *    // Changer le statut
 *    const handleStatusChange = async (orderId, newStatus) => {
 *      await updateOrderStatus(orderId, newStatus);
 *    };
 *    ```
 * 
 * 4. VARIABLES D'ENVIRONNEMENT REQUISES
 *    ```env
 *    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
 *    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
 *    ```
 * 
 * 5. TABLES SUPABASE REQUISES
 *    - commandes (id, etudiant_id, restaurant_id, statut, montant_total, qr_code, created_at, updated_at)
 *    - lignes_commande (id, commande_id, plat_id, quantite, prix_unitaire)
 *    - plats (id, nom, prix, ...)
 *    - comptes (id, nom, prenom, email, role, ...)
 */