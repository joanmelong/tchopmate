import { supabase } from '@/lib/supabaseClient';

/**
 * ImageUploadService - Gestion des uploads d'images vers Supabase Storage
 */
export class ImageUploadService {
  /**
   * Upload une image vers Supabase Storage
   * @param file - Le fichier image à uploader
   * @param bucket - Le nom du bucket ('dishes', 'menus', 'restaurants')
   * @param restaurantId - L'ID du restaurant (pour organiser les fichiers)
   * @returns L'URL publique de l'image uploadée
   */
  async uploadImage(
    file: File,
    bucket: 'dishes' | 'menus' | 'restaurants',
    restaurantId: string
  ): Promise<string> {
    try {
      // Validation du fichier
      this.validateImage(file);

      // Générer un nom de fichier unique
  const fileExt = (file.name.split('.').pop() || '').toLowerCase();
  const fileName = `${restaurantId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload vers Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw new Error(`Failed to upload image: ${error.message}`);
      }

      // Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erreur inconnue lors de l\'upload de l\'image');
    }
  }

  /**
   * Supprime une image de Supabase Storage
   * @param imageUrl - L'URL de l'image à supprimer
   * @param bucket - Le nom du bucket
   */
  async deleteImage(imageUrl: string, bucket: 'dishes' | 'menus' | 'restaurants'): Promise<void> {
    try {
      // Extraire le chemin du fichier depuis l'URL
      const path = this.extractPathFromUrl(imageUrl, bucket);
      
      if (!path) {
        throw new Error('Invalid image URL');
      }

      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        throw new Error(`Failed to delete image: ${error.message}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erreur inconnue lors de la suppression de l\'image');
    }
  }

  /**
   * Récupère l'URL publique d'une image
   * @param path - Le chemin du fichier dans le bucket
   * @param bucket - Le nom du bucket
   */
  getPublicUrl(path: string, bucket: 'dishes' | 'menus' | 'restaurants'): string {
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return publicUrl;
  }

  /**
   * Valide qu'un fichier est une image valide
   */
  private validateImage(file: File): void {
    // Vérifier le type MIME
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Format de fichier invalide. Utilisez JPG, PNG, WebP ou GIF.');
    }

    // Vérifier la taille (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB en bytes
    if (file.size > maxSize) {
      throw new Error('Le fichier est trop volumineux. Taille maximale : 5MB');
    }

    // Vérifier les dimensions (optionnel, nécessite de lire l'image)
    // Peut être fait côté client avec FileReader si nécessaire
  }

  /**
   * Extrait le chemin du fichier depuis une URL Supabase
   */
  private extractPathFromUrl(url: string, bucket: string): string | null {
    try {
      // Format URL Supabase: https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const bucketIndex = pathParts.indexOf(bucket);
      
      if (bucketIndex === -1 || bucketIndex === pathParts.length - 1) {
        return null;
      }

      // Extraire tout ce qui suit le nom du bucket
      return pathParts.slice(bucketIndex + 1).join('/');
    } catch {
      return null;
    }
  }

  /**
   * Compresse une image avant l'upload (optionnel)
   * Utile pour réduire la taille des fichiers
   */
  async compressImage(file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculer les nouvelles dimensions
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }

              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });

              resolve(compressedFile);
            },
            file.type,
            quality
          );
        };

        img.onerror = () => reject(new Error('Failed to load image'));
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
    });
  }
}

// Instance singleton
export const imageUploadService = new ImageUploadService();
