'use client';

import { useState, useEffect } from 'react';
import { MenuWithDishesDTO } from '@/core/entities/MenuComposition';
import { DishDTO } from '@/core/entities/Dish';
import { menuCompositionService } from '@/services/MenuCompositionService';
import { dishService } from '@/services/DishService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, X, GripVertical, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Image from 'next/image';

interface MenuComposerProps {
  menuId: string;
  restaurantId: string; // UUID dans PostgreSQL
  onClose?: () => void;
}

export function MenuComposer({ menuId, restaurantId, onClose }: MenuComposerProps) {
  const [menu, setMenu] = useState<MenuWithDishesDTO | null>(null);
  const [availableDishes, setAvailableDishes] = useState<DishDTO[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuId, restaurantId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger le menu avec ses plats
      const menuData = await menuCompositionService.getMenuWithDishes(menuId);
      setMenu(menuData);

      // Charger tous les plats disponibles du restaurant
      const dishes = await dishService.getDishesByRestaurant(restaurantId);
      setAvailableDishes(dishes);

      // Calculer le prix total
      if (menuData) {
        const total = await menuCompositionService.calculateMenuTotalPrice(menuId);
        setTotalPrice(total);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDish = async (platId: string) => {
    try {
      await menuCompositionService.addDishToMenu({
        menu_id: menuId,
        plat_id: platId,
        quantite: 1,
        ordre: menu?.plats.length || 0,
      });

      toast({
        title: 'Succès',
        description: 'Plat ajouté au menu',
      });

      await loadData();
    } catch (error) {
      const err = error as Error;
      toast({
        title: 'Erreur',
        description: err.message || 'Impossible d\'ajouter le plat',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveDish = async (menuPlatId: string) => {
    try {
      await menuCompositionService.removeDishFromMenu(menuPlatId);
      
      toast({
        title: 'Succès',
        description: 'Plat retiré du menu',
      });

      await loadData();
    } catch (error) {
      console.error('Error removing dish:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de retirer le plat',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateQuantity = async (menuPlatId: string, newQuantity: number) => {
    if (newQuantity <= 0) return;

    try {
      await menuCompositionService.updateMenuDish(menuPlatId, {
        quantite: newQuantity,
      });

      await loadData();
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la quantité',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12">Chargement...</div>;
  }

  if (!menu) {
    return <div className="text-center py-12">Menu introuvable</div>;
  }

  // Filtrer les plats disponibles (qui ne sont pas déjà dans le menu)
  const dishesInMenu = new Set(menu.plats.map(mp => mp.plat_id));
  const filteredAvailableDishes = availableDishes
    .filter(dish => !dishesInMenu.has(dish.id))
    .filter(dish => 
      dish.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dish.categorie.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{menu.nom}</h2>
          <p className="text-gray-600">{menu.description}</p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plats dans le menu */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Plats du menu ({menu.plats.length})</span>
              <Badge variant="secondary">{totalPrice.toFixed(0)} FCFA</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {menu.plats.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Aucun plat dans ce menu. Ajoutez-en depuis la liste ci-contre.
              </div>
            ) : (
              <div className="space-y-3">
                {menu.plats.map((menuPlat) => (
                  <div
                    key={menuPlat.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                    
                    {menuPlat.plat?.image_url && (
                      <Image
                        src={menuPlat.plat.image_url}
                        alt={menuPlat.plat.nom}
                        className="w-16 h-16 object-cover rounded"
                        width={64}
                        height={64}
                      />
                    )}

                    <div className="flex-1">
                      <p className="font-medium">{menuPlat.plat?.nom}</p>
                      <p className="text-sm text-gray-600">
                        {menuPlat.plat?.prix} FCFA
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateQuantity(menuPlat.id, menuPlat.quantite - 1)}
                        disabled={menuPlat.quantite <= 1}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center">{menuPlat.quantite}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateQuantity(menuPlat.id, menuPlat.quantite + 1)}
                      >
                        +
                      </Button>
                    </div>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemoveDish(menuPlat.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plats disponibles */}
        <Card>
          <CardHeader>
            <CardTitle>Plats disponibles</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un plat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {filteredAvailableDishes.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  {searchTerm ? 'Aucun plat trouvé' : 'Tous les plats sont déjà dans le menu'}
                </div>
              ) : (
                filteredAvailableDishes.map((dish) => (
                  <div
                    key={dish.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
                  >
                    {dish.image_url && (
                      <Image
                        src={dish.image_url}
                        alt={dish.nom}
                        className="w-16 h-16 object-cover rounded"
                        width={64}
                        height={64}
                      />
                    )}

                    <div className="flex-1">
                      <p className="font-medium">{dish.nom}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {dish.categorie}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {dish.prix} FCFA
                        </span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleAddDish(dish.id)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
