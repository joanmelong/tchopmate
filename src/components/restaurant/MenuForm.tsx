'use client';

import { useState } from 'react';
import { MenuDTO, CreateMenuDTO, UpdateMenuDTO } from '@/core/entities/Menu';
import { menuService } from '@/services/MenuService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { ImageUpload } from '@/components/ui/image-upload';

interface MenuFormProps {
  restaurantId: string; // UUID dans PostgreSQL
  menu?: MenuDTO | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MenuForm({ restaurantId, menu, onSuccess, onCancel }: MenuFormProps) {
  const [formData, setFormData] = useState({
    nom: menu?.nom || '',
    description: menu?.description || '',
    image_url: menu?.image_url || '',
    disponible: menu?.disponible ?? false,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (menu) {
        // Update existing menu
        const updateData: UpdateMenuDTO = {
          nom: formData.nom,
          description: formData.description || undefined,
          image_url: formData.image_url || undefined,
          disponible: formData.disponible,
        };
        await menuService.updateMenu(menu.id, updateData);
        toast({
          title: 'Succès',
          description: 'Menu mis à jour avec succès',
        });
      } else {
        // Create new menu
        const createData: CreateMenuDTO = {
          restaurant_id: restaurantId,
          nom: formData.nom,
          description: formData.description || undefined,
          image_url: formData.image_url || undefined,
          disponible: formData.disponible,
        };
        await menuService.createMenu(createData);
        toast({
          title: 'Succès',
          description: 'Menu créé avec succès',
        });
      }

      onSuccess();
    } catch (err) {
      const error = err as Error;
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{menu ? 'Modifier le menu' : 'Nouveau menu'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nom">Nom du menu *</Label>
            <Input
              id="nom"
              required
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              placeholder="Ex: Menu du jour"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description du menu"
              rows={3}
            />
          </div>

          <div>
            <Label>Image du menu</Label>
            <ImageUpload
              currentImageUrl={formData.image_url}
              onImageUploaded={(url) => setFormData({ ...formData, image_url: url })}
              onImageRemoved={() => setFormData({ ...formData, image_url: '' })}
              bucket="menus"
              restaurantId={restaurantId}
              label="Ajouter une photo du menu composé"
              enableCompression={true}
            />
          </div>

          <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
            <Switch
              id="disponible"
              checked={formData.disponible}
              onCheckedChange={(checked) => setFormData({ ...formData, disponible: checked })}
            />
            <div className="flex-1">
              <Label htmlFor="disponible" className="font-semibold">Activer ce menu</Label>
              <p className="text-xs text-gray-500 mt-1">
                Lorsque activé, ce menu sera visible dans la page menu publique
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Enregistrement...' : menu ? 'Mettre à jour' : 'Créer'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
