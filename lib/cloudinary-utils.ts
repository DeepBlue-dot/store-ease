// ✅ Pure synchronous helpers, safe in client/server
export function isCloudinaryUrl(url?: string): boolean {
  if (!url) return false;
  return (
    url.includes('res.cloudinary.com') ||
    (url.includes('cloudinary.com') && url.includes('/upload/'))
  );
}

export function getPublicIdFromUrl(url: string): string {
  if (!isCloudinaryUrl(url)) return '';

  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');

    const uploadIndex = pathParts.indexOf('upload');
    if (uploadIndex === -1) return '';

    const publicIdParts = pathParts.slice(uploadIndex + 2);
    let publicId = publicIdParts.join('/');

    return publicId.replace(/\.[^/.]+$/, '');
  } catch {
    return '';
  }
}
