// Cloudinary Integration & Image Storage Test Suite for Radhika Mobile Accessories
import fs from 'fs';
import path from 'path';

const API_BASE = 'http://localhost:3000/api';
const testAdminToken = 'token-user-admin-1';

async function runCloudinaryTests() {
  console.log('================================================================');
  console.log('   RADHIKA MOBILE ACCESSORIES: CLOUDINARY & STORAGE TEST SUITE   ');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(title, condition, details = '') {
    total++;
    if (condition) {
      console.log(`✅ ${total}. ${title}: PASS ${details ? `(${details})` : ''}`);
      passed++;
    } else {
      console.error(`❌ ${total}. ${title}: FAIL ${details ? `(${details})` : ''}`);
    }
  }

  try {
    // 1. Cloudinary SDK Import & Configuration Check
    const { isCloudinaryConfigured, cloudinary } = await import('./server/utils/cloudinary.js');
    const isConfiguredInitial = isCloudinaryConfigured();
    console.log(`ℹ️ Initial Cloudinary configuration status: ${isConfiguredInitial ? 'Configured' : 'Not configured (using local non-prod fallback)'}`);

    assert(
      'Cloudinary official v2 SDK is properly imported and provides uploader methods',
      typeof cloudinary.uploader.upload === 'function' && typeof cloudinary.uploader.destroy === 'function'
    );

    // 2. Admin authorization: Unauthenticated upload attempt is rejected (401)
    const boundary = '----WebKitFormBoundaryCloudinaryTest';
    const pngHeader = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
      0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
      0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
      0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
      0x42, 0x60, 0x82
    ]);
    const validMultipart = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="photo"; filename="test_cloud_image.png"\r\nContent-Type: image/png\r\n\r\n`),
      pngHeader,
      Buffer.from(`\r\n--${boundary}--\r\n`)
    ]);

    const unauthUpload = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: validMultipart,
    });
    assert(
      'Admin Authorization: Unauthenticated upload attempt is blocked with 401 Unauthorized',
      unauthUpload.status === 401
    );

    // 3. Customer role upload attempt is rejected (403)
    const customerUpload = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer token-customer-1234-999',
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: validMultipart,
    });
    assert(
      'Admin Authorization: Non-admin customer upload attempt is blocked with 403 Forbidden',
      customerUpload.status === 403
    );

    // 4. Disguised executable rejection via Magic Bytes check (5 MB and Magic Bytes safeguards)
    const fakeTextHeader = Buffer.from('NOT_A_REAL_IMAGE_DATA_EXE_SCRIPT');
    const fakeMultipart = Buffer.from([
      `--${boundary}\r\n`,
      `Content-Disposition: form-data; name="photo"; filename="disguised.png"\r\n`,
      `Content-Type: image/png\r\n\r\n`,
      fakeTextHeader.toString('binary'),
      `\r\n--${boundary}--\r\n`
    ].join(''), 'binary');

    const fakeUploadRes = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${testAdminToken}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: fakeMultipart,
    });
    assert(
      'Image Validation: Disguised non-image files are rejected with 400 Bad Request',
      fakeUploadRes.status === 400
    );

    // 5. Admin upload succeeds and returns image URL and metadata
    const validUploadRes = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${testAdminToken}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: validMultipart,
    });
    const validJson = await validUploadRes.json();
    assert(
      'Admin Upload: Successfully uploads valid photo and returns secure asset metadata (201 Created)',
      validUploadRes.status === 201 && validJson.success && !!validJson.data?.url,
      `URL: ${validJson.data?.url}`
    );

    const uploadedUrl = validJson.data?.url;
    const uploadedFilename = validJson.data?.filename;

    // 6. Image retrieval verification: Uploaded image is accessible via URL
    let retrieved = false;
    if (uploadedUrl) {
      const fetchUrl = uploadedUrl.startsWith('http') ? uploadedUrl : `http://localhost:3000${uploadedUrl}`;
      const retrieveRes = await fetch(fetchUrl);
      retrieved = retrieveRes.status === 200;
    }
    assert(
      'Image Retrieval: Uploaded photo is accessible via HTTP (200 OK)',
      retrieved,
      `Status: ${retrieved ? '200 OK' : 'Failed'}`
    );

    // 7. Safe Deletion Safeguards: Cannot delete image in use by an active product
    const prodsRes = await fetch(`${API_BASE}/products`);
    const prodsJson = await prodsRes.json();
    const productWithImage = prodsJson.data?.find(
      (p) => (p.images && p.images.length > 0 && p.images[0]?.url) || p.image
    );
    let inUseBlocked = false;
    let conflictStatus = 0;

    if (productWithImage) {
      const usedImageUrl = productWithImage.images?.[0]?.url || productWithImage.image;
      const usedFilename = path.basename(usedImageUrl);
      const deleteUsedRes = await fetch(`${API_BASE}/upload/${usedFilename}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${testAdminToken}` },
      });
      conflictStatus = deleteUsedRes.status;
      inUseBlocked = deleteUsedRes.status === 409 || deleteUsedRes.status === 400;
    }
    assert(
      'Safe Deletion Safeguard: Deleting an image referenced by an active product is blocked (409 Conflict)',
      inUseBlocked,
      `Status: ${conflictStatus}`
    );

    // 8. Safe Deletion: Deleting an unused temporary asset by admin succeeds
    let unusedDeleted = false;
    if (uploadedFilename) {
      const deleteUnusedRes = await fetch(`${API_BASE}/upload/${uploadedFilename}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${testAdminToken}` },
      });
      unusedDeleted = deleteUnusedRes.status === 200;
    }
    assert(
      'Safe Deletion: Authorized deletion of unreferenced image succeeds (200 OK)',
      unusedDeleted
    );

    // 9. Production Safety: Unsafe local fallback is strictly disabled in production when Cloudinary is not configured
    const { uploadToPermanentStorage } = await import('./server/utils/uploader.js');
    process.env.NODE_ENV = 'production';
    const oldCloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const oldApiKey = process.env.CLOUDINARY_API_KEY;
    const oldApiSecret = process.env.CLOUDINARY_API_SECRET;
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;

    let prodStorageError = '';
    try {
      await uploadToPermanentStorage('/tmp/test_image.png', 'test_image.png', 'image/png');
    } catch (err) {
      prodStorageError = err.message;
    } finally {
      process.env.NODE_ENV = 'development';
      if (oldCloudName) process.env.CLOUDINARY_CLOUD_NAME = oldCloudName;
      if (oldApiKey) process.env.CLOUDINARY_API_KEY = oldApiKey;
      if (oldApiSecret) process.env.CLOUDINARY_API_SECRET = oldApiSecret;
    }

    assert(
      'Production Storage Safety: Local fallback is rejected with clear error when Cloudinary is not configured',
      prodStorageError.includes('Production Storage Error') && prodStorageError.includes('CLOUDINARY_CLOUD_NAME'),
      prodStorageError.substring(0, 90)
    );

    console.log(`\n================================================================`);
    console.log(`   CLOUDINARY TEST SUITE: ${passed}/${total} CHECKS PASSED`);
    console.log(`================================================================\n`);
  } catch (error) {
    console.error('Test execution error:', error);
  }
}

runCloudinaryTests();
