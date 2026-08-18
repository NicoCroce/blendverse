const IMAGE_SERVICE_URL =
  import.meta.env.VITE_IMAGE_SERVICE_URL || 'http://149.50.133.123:8010';

export interface ImageUploadResponse {
  status: number;
  data: {
    imageId: string;
    size: number;
    mimeType: string;
    category: string;
  };
}

export class ImageService {
  static async uploadImage(
    file: File,
    category: string = 'articles',
  ): Promise<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('category', category);

    const response = await fetch(`${IMAGE_SERVICE_URL}/images`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al subir imagen');
    }

    return response.json();
  }

  static getImageUrl(
    category: string,
    imageId: string,
    options?: {
      width?: number;
      height?: number;
      fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
      quality?: number;
      format?: 'webp' | 'png' | 'jpeg';
    },
  ): string {
    let url = `${IMAGE_SERVICE_URL}/images/${category}/${imageId}`;

    if (options) {
      const params = new URLSearchParams();
      if (options.width) params.append('w', options.width.toString());
      if (options.height) params.append('h', options.height.toString());
      if (options.fit) params.append('fit', options.fit);
      if (options.quality) params.append('q', options.quality.toString());
      if (options.format) params.append('f', options.format);

      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
    }

    return url;
  }

  static getThumbnailUrl(category: string, imageId: string): string {
    return this.getImageUrl(category, imageId, {
      width: 300,
      height: 300,
      fit: 'cover',
      quality: 75,
      format: 'webp',
    });
  }

  static getFullUrl(category: string, imageId: string): string {
    return `${IMAGE_SERVICE_URL}/images/${category}/${imageId}`;
  }

  static isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 50 * 1024 * 1024;
    return validTypes.includes(file.type) && file.size <= maxSize;
  }

  static getImageValidationError(file: File): string | null {
    if (!this.isValidImageFile(file)) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        return 'Solo se aceptan imágenes JPEG, PNG o WebP';
      }
      if (file.size > 50 * 1024 * 1024) {
        return 'El archivo no debe superar 50MB';
      }
    }
    return null;
  }
}
