import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { fileURLToPath } from 'url';
import { store } from '../data/store.js';
import { adminAuth, adminStorage, ADMIN_EMAIL, firebaseConfig } from './firebaseAdmin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root persistent uploads directory (configurable for volume mounts or persistent container storage)
export const UPLOAD_DIR = process.env.UPLOADS_DIRECTORY
  ? path.resolve(process.env.UPLOADS_DIRECTORY)
  : path.resolve(__dirname, '../../uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// 5 MB limit
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed MIME types
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

// Storage configuration with sanitized, randomized filenames
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    // Generate cryptographically random unique safe filename
    const uniqueId = crypto.randomUUID().replace(/-/g, '');
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : '.jpg';
    cb(null, `rma_${Date.now()}_${uniqueId}${safeExt}`);
  },
});

// File filter based on MIME type
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const mime = file.mimetype.toLowerCase();
  if (ALLOWED_MIME_TYPES.includes(mime)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, JPEG, PNG, and WebP images are permitted.'));
  }
};

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5, // Maximum 5 files per batch
  },
  fileFilter,
});

/**
 * Validate real image content via Magic Bytes (signature check).
 * Prevents disguised executable / malicious files with fake image extensions.
 */
export function validateImageMagicBytes(filePath: string): boolean {
  try {
    const buffer = Buffer.alloc(16);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 16, 0);
    fs.closeSync(fd);

    // JPEG: FF D8 FF
    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;

    // PNG: 89 50 4E 47 (0x89 'P' 'N' 'G')
    const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;

    // WebP: 'RIFF' at 0..3 and 'WEBP' at 8..11
    const isRiff = buffer.toString('ascii', 0, 4) === 'RIFF';
    const isWebp = buffer.toString('ascii', 8, 12) === 'WEBP';
    const isWebpValid = isRiff && isWebp;

    return isJpeg || isPng || isWebpValid;
  } catch (err) {
    console.error('[MagicBytes] Error verifying image magic bytes:', err);
    return false;
  }
}

import {
  isCloudinaryConfigured,
  uploadToCloudinary,
  deleteFromCloudinary,
} from './cloudinary.js';

export interface StorageUploadResult {
  url: string;
  provider: 'cloudinary' | 'gcs' | 'local';
  publicId?: string;
  bytes?: number;
  format?: string;
}

/**
 * Uploads image to persistent cloud storage.
 * Prioritizes Cloudinary Free tier without requiring Firebase Blaze plan or GCS billing.
 * If Cloudinary is configured (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET),
 * uploads to Cloudinary and returns permanent HTTPS CDN URL.
 * In production mode, local filesystem fallback is strictly disabled to prevent image loss on restarts.
 */
export async function uploadToPermanentStorage(
  localFilePath: string,
  filename: string,
  mimetype: string
): Promise<StorageUploadResult> {
  const isProduction = process.env.NODE_ENV === 'production';
  const filenameWithoutExt = path.parse(filename).name;

  // 1. Primary: Cloudinary (Free tier, no Firebase Blaze plan required)
  if (isCloudinaryConfigured()) {
    try {
      const result = await uploadToCloudinary(localFilePath, filenameWithoutExt);
      return {
        url: result.secureUrl,
        provider: 'cloudinary',
        publicId: result.publicId,
        bytes: result.bytes,
        format: result.format,
      };
    } catch (cloudErr: any) {
      if (isProduction) {
        const errorDetail = cloudErr?.message || cloudErr?.error?.message || String(cloudErr);
        throw new Error(
          `Production Storage Error: Cloudinary upload failed: ${errorDetail}. ` +
          `Local filesystem fallback is disabled in production to protect customer/product images from data loss on instance restarts.`
        );
      }
      console.warn('[PermanentStorage] Cloudinary upload failed, falling back to local directory in non-production:', cloudErr?.message || cloudErr);
    }
  }

  // 2. Optional Secondary: Google Cloud Storage / Firebase Storage (if bucket explicitly provided)
  const bucketName =
    process.env.FIREBASE_STORAGE_BUCKET ||
    process.env.GCS_BUCKET ||
    (firebaseConfig.storageBucket && !firebaseConfig.storageBucket.includes('firebasestorage.app') ? firebaseConfig.storageBucket : undefined);

  if (bucketName) {
    try {
      const bucket = adminStorage.bucket(bucketName);
      const [exists] = await bucket.exists();
      if (exists) {
        const destination = `uploads/${filename}`;
        await bucket.upload(localFilePath, {
          destination,
          metadata: {
            contentType: mimetype,
            cacheControl: 'public, max-age=31536000',
          },
        });
        return {
          url: `https://storage.googleapis.com/${bucketName}/${destination}`,
          provider: 'gcs',
        };
      }
    } catch (storageErr: any) {
      if (isProduction) {
        throw new Error(
          `Production Storage Error: Cloud storage bucket operation failed: ${storageErr.message}.`
        );
      }
      console.warn('[PermanentStorage] GCS bucket upload failed in non-production:', storageErr.message);
    }
  }

  // 3. Strict Production Check: Do NOT allow silent local filesystem fallback in production
  if (isProduction) {
    throw new Error(
      'Production Storage Error: Cloudinary is not configured. ' +
      'To prevent image loss across redeployments, configure Cloudinary server environment variables: ' +
      'CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET. ' +
      'Local filesystem uploads are ephemeral and strictly disabled in production.'
    );
  }

  // Non-production / Local development fallback
  return {
    url: `/uploads/${filename}`,
    provider: 'local',
  };
}

/**
 * Check whether an image is currently referenced by any catalog product or gallery item.
 * Prevents accidental cascading deletion of shared product assets.
 */
export function isImageInUse(filename: string): { inUse: boolean; usedBy: string[] } {
  const products = store.getProducts();
  const gallery = store.getGallery();
  const usedBy: string[] = [];

  for (const prod of products) {
    const hasInImages = Array.isArray(prod.images) && prod.images.some((img) => img.url && img.url.includes(filename));
    const legacyImage = (prod as any).image && typeof (prod as any).image === 'string' && (prod as any).image.includes(filename);
    const legacyGallery = Array.isArray((prod as any).gallery) && (prod as any).gallery.some((img: unknown) => typeof img === 'string' && img.includes(filename));

    if (hasInImages || legacyImage || legacyGallery) {
      usedBy.push(`Product: "${prod.name}"`);
    }
  }

  for (const item of gallery) {
    if (item.imageUrl && item.imageUrl.includes(filename)) {
      usedBy.push(`Gallery: "${item.title}"`);
    }
  }

  return { inUse: usedBy.length > 0, usedBy };
}

/**
 * Admin authorization middleware.
 * Cryptographically verifies Firebase ID tokens using the official Firebase Admin SDK.
 * Client-supplied roles, headers, or body attributes can NEVER grant admin privileges.
 * In production, static test session tokens are completely disabled.
 */
export async function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader ? authHeader.replace(/^Bearer\s+/i, '').trim() : '';

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please sign in as store administrator.',
    });
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const allowTestTokens = !isProduction;

  // Allow isolated test token ONLY in non-production test suites
  if (allowTestTokens && token === 'token-user-admin-1') {
    (req as any).user = {
      uid: 'admin-test-uid',
      email: ADMIN_EMAIL,
      role: 'ADMIN',
      admin: true,
    };
    return next();
  }

  // Non-production: Explicitly block non-admin customer test tokens with 403 Forbidden
  if (allowTestTokens && token.startsWith('token-')) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Store administrator privileges are required.',
    });
  }

  // In production, token-user-admin-1 or any static token is strictly rejected
  if (isProduction && (token === 'token-user-admin-1' || token.startsWith('token-'))) {
    return res.status(401).json({
      success: false,
      message: 'Test tokens are strictly disabled in production environment.',
    });
  }

  // Cryptographically verify Firebase ID token using Firebase Admin SDK
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const email = decodedToken.email?.toLowerCase();
    const isAdmin =
      (email && email === ADMIN_EMAIL) ||
      decodedToken.admin === true ||
      decodedToken.role === 'ADMIN';

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Store administrator privileges are required.',
      });
    }

    (req as any).user = decodedToken;
    return next();
  } catch (verifyError: any) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed: Invalid, tampered, or expired Firebase ID token.',
      error: verifyError.code || verifyError.message,
    });
  }
}

/**
 * Customer or Admin authorization middleware for private order access.
 * Cryptographically verifies identity and strictly prevents customers from inspecting other accounts.
 */
export async function requireCustomerOrAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader ? authHeader.replace(/^Bearer\s+/i, '').trim() : '';

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required to access order records.',
    });
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const allowTestTokens = !isProduction;

  // In production, test tokens are strictly rejected
  if (isProduction && (token === 'token-user-admin-1' || token.startsWith('token-'))) {
    return res.status(401).json({
      success: false,
      message: 'Test tokens are strictly disabled in production environment.',
    });
  }

  // Non-production test tokens for test suites
  if (allowTestTokens) {
    if (token === 'token-user-admin-1') {
      (req as any).user = {
        uid: 'admin-test-uid',
        email: ADMIN_EMAIL,
        role: 'ADMIN',
        admin: true,
      };
      return next();
    }

    if (token.startsWith('token-')) {
      const requestedUserId = (req.query.userId || req.params.userId) as string | undefined;
      const tokenParts = token.split('-');
      const tokenUserId = tokenParts.length >= 3 ? tokenParts.slice(1, -1).join('-') : tokenParts[1];

      if (requestedUserId && tokenUserId && tokenUserId !== requestedUserId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Customers can access only their own private order information.',
        });
      }

      if (!requestedUserId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Customer ID required or administrator privileges needed to list all orders.',
        });
      }

      (req as any).user = { uid: tokenUserId };
      return next();
    }
  }

  // Cryptographically verify Firebase ID token using Firebase Admin SDK
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const email = decodedToken.email?.toLowerCase();
    const isAdmin =
      (email && email === ADMIN_EMAIL) ||
      decodedToken.admin === true ||
      decodedToken.role === 'ADMIN';

    const requestedUserId = (req.query.userId || req.params.userId) as string | undefined;

    if (isAdmin) {
      (req as any).user = decodedToken;
      return next();
    }

    // Customer: Must provide matching customer ID
    if (requestedUserId) {
      if (decodedToken.uid !== requestedUserId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Customers can access only their own private order information.',
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Customer ID required or administrator privileges needed to list all orders.',
      });
    }

    (req as any).user = decodedToken;
    return next();
  } catch (verifyError: any) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed: Invalid, tampered, or expired Firebase ID token.',
      error: verifyError.code || verifyError.message,
    });
  }
}
