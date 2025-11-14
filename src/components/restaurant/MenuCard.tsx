'use client';

import { useState, useEffect } from 'react';
import { MenuDTO } from '@/core/entities/Menu';
import { menuCompositionService } from '@/services/MenuCompositionService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, Utensils } from 'lucide-react';
import Image from 'next/image';

interface MenuCardProps {
  menu: MenuDTO;
  onView: () => void;
  onCompose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function MenuCard({
  menu,
  onView,
  onCompose,
  onEdit,
  onDelete,
}: MenuCardProps) {
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [dishCount, setDishCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMenuDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menu.id]);

  const loadMenuDetails = async () => {
    try {
      setLoading(true);
      
      // Récupérer le menu avec ses plats
      const menuWithDishes = await menuCompositionService.getMenuWithDishes(menu.id);
      
      if (menuWithDishes) {
        setDishCount(menuWithDishes.plats.length);
        
        // Calculer le prix total
        const total = await menuCompositionService.calculateMenuTotalPrice(menu.id);
        setCalculatedPrice(total);
      }
    } catch (error) {
      console.error('Error loading menu details:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-col gap-2">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
              <div className="truncate text-lg">{menu.nom}</div>
            </div>
            {dishCount > 0 && (
              <Badge variant="secondary" className="flex-shrink-0">
                {dishCount} plat{dishCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <div className="flex gap-1 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={onView}
              title="Voir les détails"
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCompose}
              title="Composer le menu"
              className="h-8 w-8 p-0"
            >
              <Utensils className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              title="Modifier"
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              title="Supprimer"
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {menu.image_url && (
          <Image
            src={menu.image_url}
            alt={menu.nom}
            className="w-full h-32 object-cover rounded mb-2"
            width={600}
            height={128}
          />
        )}
        
        <p className="text-sm text-gray-600 mb-3">{menu.description}</p>
        
        {/* Prix calculé */}
        <div className="flex justify-between items-center mb-2">
          {loading ? (
            <p className="text-sm text-gray-400">Calcul du prix...</p>
          ) : dishCount === 0 ? (
            <p className="text-sm text-orange-600">
              ⚠️ Aucun plat - Cliquez sur 🍴 pour composer
            </p>
          ) : (
            <div>
              <p className="text-lg font-bold text-green-600">
                {calculatedPrice?.toFixed(0)} FCFA
              </p>
              <p className="text-xs text-gray-500">Prix calculé</p>
            </div>
          )}
        </div>

        {/* Statut */}
        <div className="flex items-center gap-2">
          <Badge variant={menu.disponible ? 'default' : 'secondary'}>
            {menu.disponible ? 'Disponible' : 'Non disponible'}
          </Badge>
          {dishCount === 0 && (
            <Badge variant="outline" className="text-orange-600">
              Non composé
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
