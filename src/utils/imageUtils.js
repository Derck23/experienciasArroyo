/**
 * Convierte un archivo a Base64
 * @param {File} file - Archivo de imagen
 * @returns {Promise<string>} - String Base64 de la imagen
 */
export const convertirImagenABase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = () => {
            resolve(reader.result);
        };
        
        reader.onerror = (error) => {
            reject(error);
        };
        
        reader.readAsDataURL(file);
    });
};

/**
 * Redimensiona y comprime una imagen antes de convertirla a Base64
 * @param {File} file - Archivo de imagen
 * @param {number} maxWidth - Ancho máximo (default: 800px)
 * @param {number} maxHeight - Alto máximo (default: 600px)
 * @param {number} quality - Calidad de compresión (0-1, default: 0.8)
 * @returns {Promise<string>} - String Base64 de la imagen comprimida
 */
export const comprimirYConvertirImagen = (file, maxWidth = 800, maxHeight = 600, quality = 0.8) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
            const img = new Image();
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calcular nuevas dimensiones manteniendo la proporción
                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convertir a Base64 con compresión
                const base64String = canvas.toDataURL('image/jpeg', quality);
                resolve(base64String);
            };

            img.onerror = reject;
            img.src = event.target.result;
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

/**
 * Convierte un archivo de audio a Base64
 * @param {File} file - Archivo de audio
 * @returns {Promise<string>} - String Base64 del audio
 */
export const convertirAudioABase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = () => {
            resolve(reader.result);
        };
        
        reader.onerror = (error) => {
            reject(error);
        };
        
        reader.readAsDataURL(file);
    });
};

/**
 * Valida el tamaño del archivo
 * @param {File} file - Archivo a validar
 * @param {number} maxSizeMB - Tamaño máximo en MB
 * @returns {boolean} - true si es válido
 */
export const validarTamañoArchivo = (file, maxSizeMB = 5) => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
};
