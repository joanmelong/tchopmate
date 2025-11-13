'use client';

import { useState, useEffect } from 'react';
import { MenuWithDishesDTO, MenuPlatDTO } from '@/core/entities/MenuComposition';
import { DishDTO } from '@/core/entities/Dish';
import { menuCompositionService } from '@/services/MenuCompositionService';
import { dishService } from '@/services/DishService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface MenuCompositionManagerProps {
  menuId: string;
  restaurantId: string;
  onBack: () => void;
}

export function MenuCompositionManager({ menuId, restaurantId, onBack }: MenuCompositionManagerProps) {
  const [menuWithDishes, setMenuWithDishes] = useState<MenuWithDishesDTO | null>(null);
  const [availableDishes, setAvailableDishes] = useState<DishDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedDish, setSelectedDish] = useState<DishDTO | null>(null);
  const [quantite, setQuantite] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [menu, dishes] = await Promise.all([
        menuCompositionService.getMenuWithDishes(menuId),
        dishService.getDishesByRestaurant(restaurantId),
      ]);
      setMenuWithDishes(menu);
      setAvailableDishes(dishes);
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

  const handleAddDish = async () => {
    if (!selectedDish) return;

    try {
      await menuCompositionService.addDishToMenu({
        menu_id: menuId,
        plat_id: selectedDish.id,
        quantite,
      });
      toast({
        title: 'Succès',
        description: 'Plat ajouté au menu',
      });
      setShowAddDialog(false);
      setSelectedDish(null);
      setQuantite(1);
      await loadData();
    } catch (error) {
      console.error('Error adding dish:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de l\'ajout du plat',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveDish = async (menuPlatId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer ce plat du menu ?')) return;

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
        description: 'Erreur lors du retrait du plat',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12">Chargement...</div>;
  }

  if (!menuWithDishes) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Menu introuvable</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </div>
    );
  }

  const dishesInMenu = menuWithDishes.plats.map(mp => mp.plat_id);
  const dishesNotInMenu = availableDishes.filter(d => !dishesInMenu.includes(d.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{menuWithDishes.nom}</h2>
            <p className="text-sm text-gray-500">Composition du menu</p>
          </div>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un plat
        </Button>
      </div>

      {menuWithDishes.image_url && (
        <img
          src={menuWithDishes.image_url}
          alt={menuWithDishes.nom}
          className="w-full h-48 object-cover rounded-lg"
        />
      )}

      {menuWithDishes.description && (
        <p className="text-gray-600">{menuWithDishes.description}</p>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {menuWithDishes.plats.map((menuPlat) => (
          <Card key={menuPlat.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>{menuPlat.plat?.nom || 'Plat inconnu'}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveDish(menuPlat.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {menuPlat.plat?.image_url && (
                <img
                  src={menuPlat.plat.image_url}
                  alt={menuPlat.plat.nom}
                  className="w-full h-32 object-cover rounded mb-2"
                />
              )}
              <p className="text-sm text-gray-600 mb-2">{menuPlat.plat?.description}</p>
              <div className="flex justify-between items-center">
                <p className="text-lg font-bold">{menuPlat.plat?.prix} FCFA</p>
                <span className="text-sm text-gray-500">Qté: {menuPlat.quantite}</span>
              </div>
              {menuPlat.plat?.categorie && (
                <span className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 inline-block">
                  {menuPlat.plat.categorie}
                </span>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {menuWithDishes.plats.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          Aucun plat dans ce menu. Cliquez sur &quot;Ajouter un plat&quot; pour commencer.
        </div>
      )}

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un plat au menu</DialogTitle>
          </DialogHeader>
          
          {dishesNotInMenu.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Tous les plats disponibles sont déjà dans ce menu.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {dishesNotInMenu.map((dish) => (
                  <Card
                    key={dish.id}
                    className={`cursor-pointer transition-all ${
                      selectedDish?.id === dish.id ? 'ring-2 ring-orange-500' : ''
                    }`}
                    onClick={() => setSelectedDish(dish)}
                  >
                    <CardHeader>
                      <CardTitle className="text-base">{dish.nom}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {dish.image_url && (
                        <img
                          src={dish.image_url}
                          alt={dish.nom}
                          className="w-full h-24 object-cover rounded mb-2"
                        />
                      )}
                      <p className="text-sm text-gray-600 mb-2">{dish.description}</p>
                      <div className="flex justify-between items-center">
                        <p className="font-bold">{dish.prix} FCFA</p>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {dish.categorie}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedDish && (
                <div className="border-t pt-4">
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <Label htmlFor="quantite">Quantité</Label>
                      <Input
                        id="quantite"
                        type="number"
                        min="1"
                        value={quantite}
                        onChange={(e) => setQuantite(parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <Button onClick={handleAddDish} className="flex-1">
                      Ajouter au menu
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
