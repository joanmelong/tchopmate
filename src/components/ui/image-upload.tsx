'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { imageUploadService } from '@/services/ImageUploadService';
import { useToast } from '@/components/ui/use-toast';
import Image from 'next/image';

interface ImageUploadProps {
  /** URL de l'image actuelle (pour l'édition) */
  currentImageUrl?: string;
  /** Callback appelé quand une image est uploadée avec succès */
  onImageUploaded: (url: string) => void;
  /** Callback appelé quand l'image est supprimée */
  onImageRemoved?: () => void;
  /** Bucket Supabase Storage à utiliser */
  bucket: 'dishes' | 'menus' | 'restaurants';
  /** ID du restaurant (pour organiser les fichiers) */
  restaurantId: string;
  /** Texte personnalisé pour le bouton */
  label?: string;
  /** Activer la compression automatique */
  enableCompression?: boolean;
  /** Classe CSS personnalisée */
  className?: string;
}

export function ImageUpload({
  currentImageUrl,
  onImageUploaded,
  onImageRemoved,
  bucket,
  restaurantId,
  label = "Ajouter une image",
  enableCompression = true,
  className,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await handleFile(files[0]);
    }
  };

  const handleFileInput = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    try {
      setIsUploading(true);

      // Créer une preview locale immédiatement
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);

      // Compresser l'image si activé
      let fileToUpload = file;
      if (enableCompression) {
        try {
          fileToUpload = await imageUploadService.compressImage(file);
          toast({
            title: 'Image compressée',
            description: `Taille réduite de ${(file.size / 1024).toFixed(0)}KB à ${(fileToUpload.size / 1024).toFixed(0)}KB`,
          });
        } catch (compressionError) {
          console.warn('Compression failed, using original file:', compressionError);
          // Continue avec le fichier original si la compression échoue
        }
      }

      // Upload vers Supabase
      const publicUrl = await imageUploadService.uploadImage(
        fileToUpload,
        bucket,
        restaurantId
      );

      // Nettoyer la preview locale et utiliser l'URL Supabase
      URL.revokeObjectURL(localPreview);
      setPreviewUrl(publicUrl);
      onImageUploaded(publicUrl);

      toast({
        title: 'Succès',
        description: 'Image uploadée avec succès',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'upload';
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
      setPreviewUrl(currentImageUrl || null);
    } finally {
      setIsUploading(false);
      // Reset input pour permettre le même fichier
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    if (previewUrl && currentImageUrl) {
      try {
        await imageUploadService.deleteImage(previewUrl, bucket);
        toast({
          title: 'Image supprimée',
          description: 'L\'image a été supprimée avec succès',
        });
      } catch (error) {
        console.error('Error deleting image:', error);
        // Continue même si la suppression échoue
      }
    }

    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageRemoved?.();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileInput}
        className="hidden"
        disabled={isUploading}
      />

      {previewUrl ? (
        // Preview de l'image
        <div className="relative group">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border-2 border-gray-200">
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          
          {!isUploading && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          )}
        </div>
      ) : (
        // Zone de drop
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={cn(
            'relative border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-gray-400',
            isUploading && 'pointer-events-none opacity-50'
          )}
        >
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            {isUploading ? (
              <>
                <Loader2 className="h-12 w-12 text-gray-400 animate-spin" />
                <p className="text-sm text-gray-600">Upload en cours...</p>
              </>
            ) : (
              <>
                <div className="p-4 bg-gray-100 rounded-full">
                  {isDragging ? (
                    <Upload className="h-8 w-8 text-primary" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {isDragging ? 'Déposez l\'image ici' : label}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Glissez-déposez ou cliquez pour sélectionner
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    JPG, PNG, WebP ou GIF (max 5MB)
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Parcourir
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
