'use client';

import { useState, useEffect } from 'react';
import { MenuWithDishesDTO } from '@/core/entities/MenuComposition';
import { menuCompositionService } from '@/services/MenuCompositionService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface MenuDetailDialogProps {
  menuId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MenuDetailDialog({ menuId, open, onOpenChange }: MenuDetailDialogProps) {
  const [menu, setMenu] = useState<MenuWithDishesDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (open && menuId) {
      loadMenuDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, menuId]);

  const loadMenuDetails = async () => {
    try {
      setLoading(true);
      const menuData = await menuCompositionService.getMenuWithDishes(menuId);
      setMenu(menuData);

      if (menuData) {
        const total = await menuCompositionService.calculateMenuTotalPrice(menuId);
        setTotalPrice(total);
      }
    } catch (error) {
      console.error('Error loading menu details:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {menu?.nom || 'Détails du menu'}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : menu ? (
          <div className="space-y-6">
            {/* Description */}
            {menu.description && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
                <p className="text-gray-600">{menu.description}</p>
              </div>
            )}

            {/* Image du menu */}
            {menu.image_url && (
              <div>
                <img
                  src={menu.image_url}
                  alt={menu.nom}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Liste des plats */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-700">
                  Plats composant ce menu ({menu.plats.length})
                </h3>
                <Badge variant="secondary" className="text-lg">
                  {totalPrice.toFixed(0)} FCFA
                </Badge>
              </div>

              {menu.plats.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Ce menu ne contient aucun plat
                </p>
              ) : (
                <div className="space-y-3">
                  {menu.plats.map((menuPlat, index) => (
                    <div
                      key={menuPlat.id}
                      className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50"
                    >
                      {/* Numéro */}
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold">
                        {index + 1}
                      </div>

                      {/* Image du plat */}
                      {menuPlat.plat?.image_url && (
                        <img
                          src={menuPlat.plat.image_url}
                          alt={menuPlat.plat.nom}
                          className="w-20 h-20 object-cover rounded"
                        />
                      )}

                      {/* Détails du plat */}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {menuPlat.plat?.nom}
                        </h4>
                        {menuPlat.plat?.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {menuPlat.plat.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {menuPlat.plat?.categorie}
                          </Badge>
                          {menuPlat.quantite > 1 && (
                            <Badge variant="secondary" className="text-xs">
                              x{menuPlat.quantite}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Prix */}
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {menuPlat.plat?.prix} FCFA
                        </p>
                        {menuPlat.quantite > 1 && (
                          <p className="text-sm text-gray-500">
                            = {(menuPlat.plat?.prix || 0) * menuPlat.quantite} FCFA
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Prix total */}
            {menu.plats.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">
                    Prix total du menu
                  </span>
                  <span className="text-2xl font-bold text-orange-600">
                    {totalPrice.toFixed(0)} FCFA
                  </span>
                </div>
              </div>
            )}

            {/* Statut */}
            <div className="flex items-center gap-2">
              <Badge variant={menu.disponible ? 'default' : 'secondary'}>
                {menu.disponible ? 'Disponible' : 'Non disponible'}
              </Badge>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">Menu introuvable</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
