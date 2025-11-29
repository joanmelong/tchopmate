"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SupabaseOrderRepository } from '@/data/repositories/SupabaseOrderRepository';
import { SupabaseDishRepository } from '@/data/repositories/SupabaseDishRepository';
import { User } from '@/core/entities/User';
import { createClient } from '@supabase/supabase-js';
import { ApiOrderRepository } from '@/data/repositories/ApiOrderRepository';

interface DataDebuggerProps {
  user: User | null;
  restaurantId: string;
}

export function DataDebugger({ user, restaurantId }: DataDebuggerProps) {
  const [debugData, setDebugData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(false);

  const testData = async () => {
    if (!user || !restaurantId) return;

    setLoading(true);
    try {
      const orderRepo = new SupabaseOrderRepository();
      const dishRepo = new SupabaseDishRepository();

      console.log("🔍 Test avec restaurantId (gerantId):", restaurantId);

      // Test direct des données dans la DB
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      // 1. Vérifier le restaurant du gérant
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurant')
        .select('id_restaurant, nom, gerant_id')
        .eq('gerant_id', restaurantId);
      
      console.log("🏢 Recherche restaurant pour gérant:", restaurantId);
      console.log("🏢 Restaurant trouvé:", restaurantData);
      console.log("🏢 Erreur restaurant:", restaurantError);
      
      // 2. Vérifier tous les restaurants (pour debug)
      const { data: allRestaurants } = await supabase
        .from('restaurant')
        .select('id_restaurant, nom, gerant_id')
        .limit(5);
      
      console.log("🏢 Tous les restaurants (5 premiers):", allRestaurants);
      
      // 3. Vérifier le compte du gérant
      const { data: compteData, error: compteError } = await supabase
        .from('compte')
        .select('id, nom, prenom, role')
        .eq('id', restaurantId);
      
      console.log("👤 Compte gérant:", compteData);
      console.log("👤 Erreur compte:", compteError);
      
      // 4. Test des commandes
      const { data: rawCommandes } = await supabase
        .from('commande')
        .select('id_commande, statut, montant_total, created_at')
        .limit(5);
      
      console.log("🔍 Commandes brutes (pour voir les statuts):", rawCommandes);

      // Test avec l'API qui fonctionne
      const apiOrderRepo = new ApiOrderRepository();
      
      // Utiliser user.id (compte.id) au lieu de restaurantId (user_id)
      const compteId = user?.id.toString() || restaurantId;
      console.log("🔍 Test avec compte.id:", compteId);
      
      // Test des statistiques
      // const stats = await apiOrderRepo.getStats(compteId);
      // console.log("📊 Statistiques:", stats);

      // Test des commandes
      const orders = await apiOrderRepo.getByRestaurantId(compteId);
      console.log("📦 Commandes:", orders);

      // Test des plats
      const dishes = await dishRepo.getDishesByRestaurantId(restaurantId);
      console.log("🍽️ Plats:", dishes);

      // Test des plats populaires
      const popularDishes = await dishRepo.getPopularDishes(restaurantId);
      console.log("⭐ Plats populaires:", popularDishes);

      setDebugData({
        gerantId: restaurantId,
        restaurantData,
        restaurantError: restaurantError?.message,
        allRestaurants,
        compteData,
        compteError: compteError?.message,
        rawCommandes,
        stats,
        ordersCount: orders.length,
        orders: orders.slice(0, 3), // Premiers 3 pour l'affichage
        dishesCount: dishes.length,
        dishes: dishes.slice(0, 3), // Premiers 3 pour l'affichage
        popularDishes,
      });
    } catch (error) {
      console.error("❌ Erreur test:", error);
      setDebugData({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-blue-800">🔧 Debug des Données</CardTitle>
        <Button onClick={testData} disabled={loading} size="sm">
          {loading ? "Test en cours..." : "Tester les données"}
        </Button>
      </CardHeader>
      <CardContent>
        {debugData && (
          <div className="space-y-4">
            {debugData.error ? (
              <div className="text-red-600">
                <strong>Erreur:</strong> {debugData.error}
              </div>
            ) : (
              <>
                <div>
                  <strong>👤 Gérant ID:</strong> {debugData.gerantId}
                </div>
                
                <div>
                  <strong>🏢 Restaurant du gérant:</strong>
                  <pre className="text-xs bg-white p-2 rounded mt-1">
                    {JSON.stringify(debugData.restaurantData, null, 2)}
                  </pre>
                  {debugData.restaurantError && (
                    <p className="text-red-600 text-xs mt-1">Erreur: {debugData.restaurantError}</p>
                  )}
                </div>
                
                <div>
                  <strong>🏢 Tous les restaurants (échantillon):</strong>
                  <pre className="text-xs bg-white p-2 rounded mt-1">
                    {JSON.stringify(debugData.allRestaurants, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <strong>👤 Compte gérant:</strong>
                  <pre className="text-xs bg-white p-2 rounded mt-1">
                    {JSON.stringify(debugData.compteData, null, 2)}
                  </pre>
                  {debugData.compteError && (
                    <p className="text-red-600 text-xs mt-1">Erreur: {debugData.compteError}</p>
                  )}
                </div>
                
                <div>
                  <strong>🔍 Commandes brutes (statuts DB):</strong>
                  <pre className="text-xs bg-white p-2 rounded mt-1">
                    {JSON.stringify(debugData.rawCommandes, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <strong>📊 Statistiques:</strong>
                  <pre className="text-xs bg-white p-2 rounded mt-1">
                    {JSON.stringify(debugData.stats, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <strong>📦 Commandes ({debugData.ordersCount} total):</strong>
                  <pre className="text-xs bg-white p-2 rounded mt-1">
                    {JSON.stringify(debugData.orders, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <strong>🍽️ Plats ({debugData.dishesCount} total):</strong>
                  <pre className="text-xs bg-white p-2 rounded mt-1">
                    {JSON.stringify(debugData.dishes, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <strong>⭐ Plats populaires:</strong>
                  <pre className="text-xs bg-white p-2 rounded mt-1">
                    {JSON.stringify(debugData.popularDishes, null, 2)}
                  </pre>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}