/**
 * Page de démonstration complète du système de commande avec QR code
 */

'use client';

import React from 'react';
import { OrderConfirmationDemo } from '@/components/OrderConfirmationDemo';

export default function OrderDemoPage() {
  // Données d'exemple pour la démonstration
  const exampleOrderItems = [
    {
      platId: 1,
      platNom: 'Ndolé aux crevettes',
      quantite: 2,
      prixUnitaire: 2500,
      image: '/images/ndole.jpg' // Image optionnelle
    },
    {
      platId: 2,
      platNom: 'Riz sauté aux légumes',
      quantite: 1,
      prixUnitaire: 1800,
      image: '/images/riz-saute.jpg' // Image optionnelle
    },
    {
      platId: 3,
      platNom: 'Jus de bissap',
      quantite: 2,
      prixUnitaire: 500,
      image: '/images/bissap.jpg' // Image optionnelle
    }
  ];

  const handleOrderConfirmed = (qrCode: string) => {
    console.log('✅ Commande confirmée! QR Code généré:', qrCode.substring(0, 50) + '...');
    
    // Ici vous pouvez ajouter d'autres actions :
    // - Envoyer une notification
    // - Rediriger vers une page de suivi
    // - Sauvegarder en localStorage
    // - Etc.
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎯 Démonstration Commande + QR Code
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Cette démonstration montre le système complet de confirmation de commande 
            avec génération automatique de QR code. Cliquez sur &quot;Confirmer la commande&quot; 
            pour voir le QR code généré.
          </p>
        </div>

        <OrderConfirmationDemo
          orderItems={exampleOrderItems}
          restaurantName="Restaurant Universitaire Saint Jean"
          studentName="Jean Dupont"
          onOrderConfirmed={handleOrderConfirmed}
        />

        {/* Informations sur la démonstration */}
        <div className="mt-8 max-w-2xl mx-auto">
          <details className="bg-white p-6 rounded-lg shadow-sm border">
            <summary className="cursor-pointer font-medium text-gray-900 mb-2 flex items-center gap-2">
              <span>📋</span> Détails de la démonstration
            </summary>
            <div className="text-sm text-gray-600 space-y-3 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Articles commandés:</h4>
                  <ul className="space-y-1">
                    {exampleOrderItems.map((item, index) => (
                      <li key={index}>
                        • {item.platNom} (×{item.quantite}) - {(item.quantite * item.prixUnitaire).toLocaleString('fr-FR')} FCFA
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Informations:</h4>
                  <ul className="space-y-1">
                    <li>• <strong>Total:</strong> {exampleOrderItems.reduce((total, item) => total + (item.quantite * item.prixUnitaire), 0).toLocaleString('fr-FR')} FCFA</li>
                    <li>• <strong>Restaurant:</strong> Saint Jean</li>
                    <li>• <strong>Client:</strong> Jean Dupont</li>
                    <li>• <strong>Statut:</strong> En attente</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">🔍 Que contient le QR code ?</h4>
                <p className="text-blue-700 text-sm">
                  Le QR code généré contient toutes les informations de la commande au format JSON : 
                  ID de commande, restaurant, client, articles, prix total, statut et timestamp. 
                  Le restaurant peut scanner ce code pour vérifier et traiter la commande.
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">✅ Fonctionnalités testées :</h4>
                <ul className="text-green-700 text-sm space-y-1">
                  <li>• Génération dynamique de QR code</li>
                  <li>• Calcul automatique du total</li>
                  <li>• Interface utilisateur responsive</li>
                  <li>• Gestion des états de chargement</li>
                  <li>• Modal d&apos;affichage du QR code</li>
                  <li>• Données JSON structurées dans le QR</li>
                </ul>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}