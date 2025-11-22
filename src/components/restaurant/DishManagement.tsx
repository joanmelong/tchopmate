'use client';

import { useState, useEffect } from 'react';
import { DishDTO } from '@/core/entities/Dish';
import { dishService } from '@/services/DishService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { DishForm } from './DishForm';
import { useToast } from '@/components/ui/use-toast';
import Image from 'next/image';

interface DishManagementProps {
  restaurantId: string; // UUID dans PostgreSQL
}

export function DishManagement({ restaurantId }: DishManagementProps) {
  const [dishes, setDishes] = useState<DishDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDish, setEditingDish] = useState<DishDTO | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadDishes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  const loadDishes = async () => {
    try {
      setLoading(true);
      const data = await dishService.getDishesByRestaurant(restaurantId);
      setDishes(data);
    } catch (error) {
      console.error('Error loading dishes:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les plats',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce plat ?')) return;
    
    try {
      await dishService.deleteDish(id);
      toast({
        title: 'Succès',
        description: 'Plat supprimé avec succès',
      });
      await loadDishes();
    } catch (error) {
      console.error('Error deleting dish:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la suppression du plat',
        variant: 'destructive',
      });
    }
  };

  const handleToggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      await dishService.toggleAvailability(id, !currentStatus);
      toast({
        title: 'Succès',
        description: `Plat ${!currentStatus ? 'activé' : 'désactivé'}`,
      });
      await loadDishes();
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors du changement de statut',
        variant: 'destructive',
      });
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingDish(null);
    loadDishes();
  };

  const categories = Array.from(new Set(dishes.map(d => d.categorie)));
  const filteredDishes = selectedCategory === 'all' 
    ? dishes 
    : dishes.filter(d => d.categorie === selectedCategory);

  if (loading) {
    return <div className="flex justify-center py-12">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Plats</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau Plat
        </Button>
      </div>

      {showForm && (
        <DishForm
          restaurantId={restaurantId}
          dish={editingDish}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingDish(null);
          }}
        />
      )}

      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
          >
            Tous
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDishes.map((dish) => (
          <Card key={dish.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>{dish.nom}</span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleAvailability(dish.id, dish.disponible)}
                  >
                    {dish.disponible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingDish(dish);
                      setShowForm(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(dish.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dish.image_url && (
                <Image
                  src={dish.image_url}
                  alt={dish.nom}
                  className="w-full h-32 object-cover rounded mb-2"
                  width={600}
                  height={128}
                />
              )}
              <p className="text-sm text-gray-600 mb-2">{dish.description}</p>
              <div className="flex justify-between items-center">
                <p className="text-lg font-bold">{dish.prix} FCFA</p>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{dish.categorie}</span>
              </div>
              {dish.temps_preparation && (
                <p className="text-xs text-gray-500 mt-1">
                  Temps: {dish.temps_preparation} min
                </p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                {dish.disponible ? 'Disponible' : 'Non disponible'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDishes.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          {selectedCategory === 'all' 
            ? 'Aucun plat créé. Cliquez sur &quot;Nouveau Plat&quot; pour commencer.'
            : `Aucun plat dans la catégorie &quot;${selectedCategory}&quot;.`}
        </div>
      )}
    </div>
  );
}
