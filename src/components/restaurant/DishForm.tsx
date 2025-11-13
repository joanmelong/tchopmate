'use client';

import { useState } from 'react';
import { DishDTO, CreateDishDTO, UpdateDishDTO } from '@/core/entities/Dish';
import { dishService } from '@/services/DishService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { ImageUpload } from '@/components/ui/image-upload';

interface DishFormProps {
  restaurantId: string; // UUID dans PostgreSQL
  dish?: DishDTO | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function DishForm({ restaurantId, dish, onSuccess, onCancel }: DishFormProps) {
  const [formData, setFormData] = useState({
    nom: dish?.nom || '',
    description: dish?.description || '',
    prix: dish?.prix?.toString() || '',
    categorie: dish?.categorie || '',
    image_url: dish?.image_url || '',
    temps_preparation: dish?.temps_preparation?.toString() || '',
    disponible: dish?.disponible ?? true,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const prix = parseFloat(formData.prix);
      if (isNaN(prix) || prix < 0) {
        toast({
          title: 'Erreur',
          description: 'Le prix doit être un nombre positif',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const temps_preparation = formData.temps_preparation 
        ? parseInt(formData.temps_preparation) 
        : undefined;

      if (dish) {
        // Update existing dish
        const updateData: UpdateDishDTO = {
          nom: formData.nom,
          description: formData.description || undefined,
          prix,
          categorie: formData.categorie,
          image_url: formData.image_url || undefined,
          temps_preparation,
          disponible: formData.disponible,
        };
        await dishService.updateDish(dish.id, updateData);
        toast({
          title: 'Succès',
          description: 'Plat mis à jour avec succès',
        });
      } else {
        // Create new dish
        const createData: CreateDishDTO = {
          restaurant_id: restaurantId,
          nom: formData.nom,
          description: formData.description || undefined,
          prix,
          categorie: formData.categorie,
          image_url: formData.image_url || undefined,
          temps_preparation,
          disponible: formData.disponible,
        };
        await dishService.createDish(createData);
        toast({
          title: 'Succès',
          description: 'Plat créé avec succès',
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
        <CardTitle>{dish ? 'Modifier le plat' : 'Nouveau plat'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nom">Nom du plat *</Label>
            <Input
              id="nom"
              required
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              placeholder="Ex: Ndolé"
            />
          </div>

          <div>
            <Label htmlFor="categorie">Catégorie *</Label>
            <Input
              id="categorie"
              required
              value={formData.categorie}
              onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
              placeholder="Ex: Plats traditionnels"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description du plat"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prix">Prix (FCFA) *</Label>
              <Input
                id="prix"
                type="number"
                step="0.01"
                required
                value={formData.prix}
                onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                placeholder="2500"
              />
            </div>

            <div>
              <Label htmlFor="temps_preparation">Temps de préparation (min)</Label>
              <Input
                id="temps_preparation"
                type="number"
                value={formData.temps_preparation}
                onChange={(e) => setFormData({ ...formData, temps_preparation: e.target.value })}
                placeholder="30"
              />
            </div>
          </div>

          <div>
            <Label>Image du plat</Label>
            <ImageUpload
              currentImageUrl={formData.image_url}
              onImageUploaded={(url) => setFormData({ ...formData, image_url: url })}
              onImageRemoved={() => setFormData({ ...formData, image_url: '' })}
              bucket="dishes"
              restaurantId={restaurantId}
              label="Ajouter une photo du plat"
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
              {loading ? 'Enregistrement...' : dish ? 'Mettre à jour' : 'Créer'}
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
