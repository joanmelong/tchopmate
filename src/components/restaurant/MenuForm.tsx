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
    prix: menu?.prix?.toString() || '',
    image_url: menu?.image_url || '',
    disponible: menu?.disponible ?? true,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const prix = formData.prix ? parseFloat(formData.prix) : undefined;
      if (prix !== undefined && (isNaN(prix) || prix < 0)) {
        toast({
          title: 'Erreur',
          description: 'Le prix doit être un nombre positif',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (menu) {
        // Update existing menu
        const updateData: UpdateMenuDTO = {
          nom: formData.nom,
          description: formData.description || undefined,
          prix,
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
          prix,
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
            <Label htmlFor="prix">Prix (FCFA)</Label>
            <Input
              id="prix"
              type="number"
              step="0.01"
              value={formData.prix}
              onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
              placeholder="2500"
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

          <div className="flex items-center space-x-2">
            <Switch
              id="disponible"
              checked={formData.disponible}
              onCheckedChange={(checked) => setFormData({ ...formData, disponible: checked })}
            />
            <Label htmlFor="disponible">Disponible</Label>
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
