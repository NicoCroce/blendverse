import { useMutation } from '@tanstack/react-query';
import { ImageService } from '@app/Aplication/Services/ImageService';

export const useImageUpload = (category: string = 'articles') => {
  return useMutation({
    mutationFn: async (file: File) => {
      const error = ImageService.getImageValidationError(file);
      if (error) throw new Error(error);
      return ImageService.uploadImage(file, category);
    },
  });
};
