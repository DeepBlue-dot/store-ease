export interface ImageData {
  id?: string;
  url: string;
  productId?: string;
  createdAt?: Date;
}

/**
 * Extracts image URLs from various data formats
 */
export function extractImageUrls(images: any): string[] {
  if (!images) return [];
  
  // Handle array of image objects with url property
  if (Array.isArray(images) && images.length > 0) {
    if (typeof images[0] === 'object' && images[0].url) {
      return images.map((img: any) => img.url).filter((url: string) => url && isValidUrl(url));
    }
    // Handle array of strings (URLs)
    if (typeof images[0] === 'string') {
      return images.filter((url: string) => url && isValidUrl(url));
    }
  }
  
  // Handle comma-separated string
  if (typeof images === 'string') {
    return images.split(',')
      .map(url => url.trim())
      .filter(url => url && isValidUrl(url));
  }
  
  return [];
}

/**
 * Validates if a string is a proper URL
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Gets the first valid image URL from various data formats
 */
export function getFirstImageUrl(images: any): string | null {
  const urls = extractImageUrls(images);
  return urls.length > 0 ? urls[0] : null;
}

/**
 * Fallback image handler for broken images
 */
export function handleImageError(e: React.SyntheticEvent<HTMLImageElement>): void {
  const target = e.currentTarget;
  target.style.display = 'none';
  
  // Find or create fallback container
  let fallback = target.nextElementSibling as HTMLElement;
  if (!fallback || !fallback.classList.contains('image-fallback')) {
    fallback = document.createElement('div');
    fallback.className = 'image-fallback w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center';
    fallback.innerHTML = `
      <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
    `;
    target.parentNode?.insertBefore(fallback, target.nextSibling);
  }
  
  fallback.style.display = 'flex';
}