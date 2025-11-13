'use client';

import { useState, useEffect } from 'react';
import { MenuDTO } from '@/core/entities/Menu';
import { menuService } from '@/services/MenuService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, List, UtensilsCrossed } from 'lucide-react';
import { MenuForm } from './MenuForm';
import { MenuCompositionManager } from './MenuCompositionManager';
import { useToast } from '@/components/ui/use-toast';

interface MenuManagementProps {
  restaurantId: string; // UUID du restaurant
}

export function MenuManagement({ restaurantId }: MenuManagementProps) {
  const [menus, setMenus] = useState<MenuDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuDTO | null>(null);
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadMenus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  const loadMenus = async () => {
    try {
      setLoading(true);
      const data = await menuService.getMenusByRestaurant(restaurantId);
      setMenus(data);
    } catch (error) {
      console.error('Error loading menus:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les menus',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce menu ?')) return;
    
    try {
      await menuService.deleteMenu(id);
      toast({
        title: 'Succès',
        description: 'Menu supprimé avec succès',
      });
      await loadMenus();
    } catch (error) {
      console.error('Error deleting menu:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la suppression du menu',
        variant: 'destructive',
      });
    }
  };

  const handleViewDishes = (menuId: string) => {
    setSelectedMenuId(menuId);
  };

  const handleAddDishes = (menuId: string) => {
    setSelectedMenuId(menuId);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingMenu(null);
    loadMenus();
  };

  if (loading) {
    return <div className="flex justify-center py-12">Chargement...</div>;
  }

  // Si un menu est sélectionné, afficher le gestionnaire de composition
  if (selectedMenuId) {
    return (
      <MenuCompositionManager
        menuId={selectedMenuId}
        restaurantId={restaurantId}
        onBack={() => {
          setSelectedMenuId(null);
          loadMenus();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Menus</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau Menu
        </Button>
      </div>

      {showForm && (
        <MenuForm
          restaurantId={restaurantId}
          menu={editingMenu}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingMenu(null);
          }}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {menus.map((menu) => (
          <Card key={menu.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>{menu.nom}</span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingMenu(menu);
                      setShowForm(true);
                    }}
                    title="Modifier le menu"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(menu.id)}
                    title="Supprimer le menu"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {menu.image_url && (
                <img
                  src={menu.image_url}
                  alt={menu.nom}
                  className="w-full h-32 object-cover rounded mb-2"
                />
              )}
              <p className="text-sm text-gray-600 mb-2">{menu.description}</p>
              {menu.prix && (
                <p className="text-lg font-bold mb-3">{menu.prix} FCFA</p>
              )}
              
              <div className="flex flex-col gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => handleViewDishes(menu.id)}
                >
                  <List className="mr-1 h-3 w-3" />
                  Voir les plats
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => handleAddDishes(menu.id)}
                >
                  <UtensilsCrossed className="mr-1 h-3 w-3" />
                  Ajouter plats
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {menus.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          Aucun menu créé. Cliquez sur &quot;Nouveau Menu&quot; pour commencer.
        </div>
      )}
    </div>
  );
}
