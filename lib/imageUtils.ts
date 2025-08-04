// Utilitários para compressão e otimização de imagens

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'webp' | 'png';
}

export class ImageCompressor {
  static async compressImage(
    file: File, 
    options: ImageCompressionOptions = {}
  ): Promise<string> {
    const {
      maxWidth = 800,
      maxHeight = 600,
      quality = 0.8,
      format = 'jpeg'
    } = options;

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcular dimensões mantendo proporção
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // Configurar canvas
        canvas.width = width;
        canvas.height = height;

        // Desenhar imagem redimensionada
        ctx?.drawImage(img, 0, 0, width, height);

        // Converter para base64 comprimido
        const mimeType = `image/${format}`;
        const compressedDataUrl = canvas.toDataURL(mimeType, quality);
        
        resolve(compressedDataUrl);
      };

      img.onerror = () => {
        reject(new Error('Erro ao carregar imagem'));
      };

      // Carregar imagem
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  static async compressBase64(
    base64: string,
    options: ImageCompressionOptions = {}
  ): Promise<string> {
    const {
      maxWidth = 800,
      maxHeight = 600,
      quality = 0.8,
      format = 'jpeg'
    } = options;

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        const mimeType = `image/${format}`;
        const compressedDataUrl = canvas.toDataURL(mimeType, quality);
        
        resolve(compressedDataUrl);
      };

      img.onerror = () => {
        reject(new Error('Erro ao processar imagem'));
      };

      img.src = base64;
    });
  }

  static getImageSize(base64: string): Promise<{ width: number; height: number; size: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        // Calcular tamanho aproximado em bytes
        const sizeInBytes = Math.round((base64.length * 3) / 4);
        
        resolve({
          width: img.width,
          height: img.height,
          size: sizeInBytes
        });
      };

      img.onerror = () => {
        reject(new Error('Erro ao analisar imagem'));
      };

      img.src = base64;
    });
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Hook para compressão automática de imagens
export const useImageCompression = () => {
  const compressImage = async (file: File): Promise<string> => {
    try {
      // Verificar se é uma imagem
      if (!file.type.startsWith('image/')) {
        throw new Error('Arquivo não é uma imagem válida');
      }

      // Verificar tamanho do arquivo
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('Imagem muito grande. Máximo 5MB permitido.');
      }

      // Comprimir imagem
      const compressed = await ImageCompressor.compressImage(file, {
        maxWidth: 800,
        maxHeight: 600,
        quality: 0.8,
        format: 'jpeg'
      });

      return compressed;
    } catch (error) {
      console.error('Erro na compressão:', error);
      throw error;
    }
  };

  return { compressImage };
};