'use server';

import { v2 as cloudinary } from 'cloudinary';
import { getPublicIdFromUrl, isCloudinaryUrl } from './cloudinary-utils';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// ✅ Upload from Buffer
export async function uploadImage(buffer: Buffer, folder = 'storeease/'): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Cloudinary upload failed'));
          return;
        }
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

// ✅ Delete single image
export async function deleteImage(publicId: string): Promise<void> {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId);
}

// ✅ Delete multiple images
export async function deleteImages(urls: string[]): Promise<void> {
  const publicIds = urls
    .filter(isCloudinaryUrl)
    .map(getPublicIdFromUrl)
    .filter(Boolean);

  if (publicIds.length === 0) return;

  await cloudinary.api.delete_resources(publicIds);
}
