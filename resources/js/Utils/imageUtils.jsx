/**
 * Utilitaire pour normaliser les URLs d'images
 * Convertit les chemins relatifs en chemins absolus pour éviter les problèmes d'affichage
 */

/**
 * Normalise une URL d'image pour l'affichage
 * @param {string} imagePath - Le chemin de l'image (peut être relatif ou absolu)
 * @returns {string} - L'URL normalisée pour l'affichage
 */
export const normalizeImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // Si l'URL est déjà complète (http/https), la retourner telle quelle
    if (imagePath.startsWith('http')) {
        return imagePath;
    }
    
    // Si l'URL commence déjà par '/', la retourner telle quelle
    if (imagePath.startsWith('/')) {
        return imagePath;
    }
    
    // Sinon, préfixer avec '/' pour en faire une URL absolue
    return `/${imagePath}`;
};

/**
 * Normalise un tableau d'URLs d'images
 * @param {Array} images - Tableau d'objets image ou de chemins
 * @param {string} imageKey - Clé à utiliser pour extraire le chemin (défaut: 'image')
 * @returns {Array} - Tableau d'URLs normalisées
 */
export const normalizeImageUrls = (images, imageKey = 'image') => {
    if (!Array.isArray(images)) return [];
    
    return images.map(img => {
        const imagePath = typeof img === 'string' ? img : img[imageKey];
        return normalizeImageUrl(imagePath);
    });
};

/**
 * Component wrapper pour les images avec normalisation automatique
 * Usage: <ImageDisplay src={product.image} alt="Product" className="..." />
 */
export const ImageDisplay = ({ src, alt, className, ...props }) => {
    const normalizedSrc = normalizeImageUrl(src);
    
    if (!normalizedSrc) {
        return (
            <div className={`bg-gray-100 flex items-center justify-center ${className}`} {...props}>
                <span className="text-gray-400 text-sm">Pas d'image</span>
            </div>
        );
    }
    
    return (
        <img 
            src={normalizedSrc} 
            alt={alt} 
            className={className}
            {...props}
        />
    );
};