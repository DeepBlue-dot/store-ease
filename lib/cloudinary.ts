import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// Helper function to upload images
export async function uploadImage(file: File | Blob): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: 'storeease/products',
          upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(result!.secure_url);
        }
      )
      .end(buffer);
  });
}

// Helper function to delete images
export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

// Extract public ID from Cloudinary URL
export function getPublicIdFromUrl(url: string): string {
  try {
    if (!isCloudinaryUrl(url)) return '';
    
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    
    // Cloudinary URL pattern: /upload/{version}/{public_id}.{format}
    const uploadIndex = pathParts.indexOf('upload');
    if (uploadIndex === -1) return '';
    
    // Get everything after 'upload' until the filename
    const publicIdParts = pathParts.slice(uploadIndex + 2); // Skip 'upload' and version
    let publicId = publicIdParts.join('/');
    
    // Remove file extension
    const lastDotIndex = publicId.lastIndexOf('.');
    if (lastDotIndex !== -1) {
      publicId = publicId.substring(0, lastDotIndex);
    }
    
    return publicId;
  } catch {
    return '';
  }
}

/**
 * Check if URL is from Cloudinary
 */
export function isCloudinaryUrl(url: string): boolean {
  if (!url) return false;
  return url.includes('res.cloudinary.com') || 
         (url.includes('cloudinary.com') && url.includes('/upload/'));
}

/**
 * Delete multiple images from Cloudinary
 */
export async function deleteImages(urls: string[]): Promise<void> {
  const cloudinaryUrls = urls.filter(url => isCloudinaryUrl(url));
  
  if (cloudinaryUrls.length === 0) return;

  const publicIds = cloudinaryUrls
    .map(url => getPublicIdFromUrl(url))
    .filter(publicId => publicId !== '');

  if (publicIds.length === 0) return;

  try {
    await cloudinary.api.delete_resources(publicIds);
    console.log(`✅ Successfully deleted ${publicIds.length} images from Cloudinary`);
  } catch (error) {
    console.error('❌ Error deleting from Cloudinary:', error);
    throw error; // Re-throw to handle in calling function
  }
}

export default cloudinary;