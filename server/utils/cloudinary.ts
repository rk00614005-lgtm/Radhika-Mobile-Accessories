import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary server-side SDK using server-only environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isConfigured = Boolean(cloudName && apiKey && apiSecret);

if (isConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export { cloudinary };

/**
 * Returns whether Cloudinary is properly configured via environment variables.
 */
export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

export interface CloudinaryUploadResult {
  publicId: string;
  secureUrl: string;
  bytes: number;
  format: string;
  width?: number;
  height?: number;
}

/**
 * Uploads a local file to Cloudinary under the radhika_mobile folder.
 */
export async function uploadToCloudinary(
  localFilePath: string,
  filenameWithoutExt: string
): Promise<CloudinaryUploadResult> {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      'Cloudinary Storage Error: Missing credentials. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in server environment variables.'
    );
  }

  // Ensure config is fresh in case env vars were set after initial module load
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  const uploadResponse = await cloudinary.uploader.upload(localFilePath, {
    folder: 'radhika_mobile/products',
    public_id: filenameWithoutExt,
    resource_type: 'image',
    overwrite: false,
    use_filename: true,
    unique_filename: true,
  });

  return {
    publicId: uploadResponse.public_id,
    secureUrl: uploadResponse.secure_url,
    bytes: uploadResponse.bytes,
    format: uploadResponse.format,
    width: uploadResponse.width,
    height: uploadResponse.height,
  };
}

/**
 * Deletes an image from Cloudinary using its public ID.
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      'Cloudinary Storage Error: Missing credentials to delete image.'
    );
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: 'image',
  });
  return result.result === 'ok';
}
