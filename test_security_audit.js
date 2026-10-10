// Comprehensive Security and Storage Audit Test Suite for Radhika Mobile Accessories
import fs from 'fs';
import path from 'path';

const API_BASE = 'http://localhost:3000/api';

async function runSecurityAudit() {
  console.log('================================================================');
  console.log('   RADHIKA MOBILE ACCESSORIES: FINAL SECURITY & STORAGE AUDIT   ');
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
    // 1. Unauthenticated Request to Admin Route
    const unauthRes = await fetch(`${API_BASE}/admin/stats`);
    assert(
      'Unauthenticated request to admin endpoint returns 401',
      unauthRes.status === 401,
      `Status: ${unauthRes.status}`
    );

    // 2. Forged Firebase Token
    const forgedToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InJrMDA2MTQwMDVAZ21haWwuY29tIiwiYWRtaW4iOnRydWV9.forged_signature_xyz';
    const forgedRes = await fetch(`${API_BASE}/admin/stats`, {
      headers: { Authorization: `Bearer ${forgedToken}` },
    });
    assert(
      'Cryptographically forged Firebase ID token returns 401',
      forgedRes.status === 401,
      `Status: ${forgedRes.status}`
    );

    // 3. Client-Supplied Fake Role Header Bypass Rejection
    const fakeRoleRes = await fetch(`${API_BASE}/admin/stats`, {
      headers: {
        'x-role': 'ADMIN',
        'x-user-email': 'rk00614005@gmail.com',
        'x-admin': 'true',
      },
    });
    assert(
      'Client-supplied fake role/email headers cannot bypass authentication (returns 401)',
      fakeRoleRes.status === 401,
      `Status: ${fakeRoleRes.status}`
    );

    // 4. Test Token Authorization in Test Mode
    const testAdminToken = 'token-user-admin-1';
    const testAdminRes = await fetch(`${API_BASE}/admin/stats`, {
      headers: { Authorization: `Bearer ${testAdminToken}` },
    });
    assert(
      'Isolated test runner session permitted in local development/test mode (returns 200)',
      testAdminRes.status === 200,
      `Status: ${testAdminRes.status}`
    );

    // 5. Customer Order Privacy Boundary: Customer querying own orders
    const ownOrderRes = await fetch(`${API_BASE}/orders?userId=customer-abc`, {
      headers: { Authorization: 'Bearer token-customer-abc-9999' },
    });
    assert(
      'Customer accessing their own orders is authorized (returns 200)',
      ownOrderRes.status === 200,
      `Status: ${ownOrderRes.status}`
    );

    // 6. Customer Order Privacy Boundary: Customer attempting to inspect another customer's orders
    const snoopOrderRes = await fetch(`${API_BASE}/orders?userId=victim-customer-xyz`, {
      headers: { Authorization: 'Bearer token-customer-abc-9999' },
    });
    assert(
      'Customer attempting to view another customer orders is rejected with 403 Forbidden',
      snoopOrderRes.status === 403,
      `Status: ${snoopOrderRes.status}`
    );

    // 7. Customer attempting to list all orders across store without being admin
    const listAllCustRes = await fetch(`${API_BASE}/orders`, {
      headers: { Authorization: 'Bearer token-customer-abc-9999' },
    });
    assert(
      'Non-admin customer attempting to list all store orders is rejected with 403 Forbidden',
      listAllCustRes.status === 403,
      `Status: ${listAllCustRes.status}`
    );

    // 8. Photo Upload: Reject disguised non-image executable file (Magic Bytes validation)
    const fakeTextHeader = Buffer.from('MZ_THIS_IS_A_FAKE_EXE_FILE_DATA');
    const boundary = '----WebKitFormBoundarySecurityTest';
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
      'Photo upload rejects disguised non-image files via Magic Bytes check (returns 400)',
      fakeUploadRes.status === 400,
      `Status: ${fakeUploadRes.status}`
    );

    // 9. Photo Upload: Valid PNG Magic Bytes uploaded by admin
    const pngHeader = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89
    ]);
    const validMultipart = Buffer.from([
      `--${boundary}\r\n`,
      `Content-Disposition: form-data; name="photo"; filename="audit_test.png"\r\n`,
      `Content-Type: image/png\r\n\r\n`,
      pngHeader.toString('binary'),
      `\r\n--${boundary}--\r\n`
    ].join(''), 'binary');

    const validUploadRes = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${testAdminToken}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: validMultipart,
    });
    const validUploadJson = await validUploadRes.json();
    assert(
      'Valid image upload by administrator succeeds (returns 201)',
      validUploadRes.status === 201 && validUploadJson.success && !!validUploadJson.data?.url,
      `URL: ${validUploadJson.data?.url}`
    );

    const uploadedUrl = validUploadJson.data?.url;
    const uploadedFilename = validUploadJson.data?.filename;

    // 10. Image Retrieval / Static Serving Verification
    let imageRetrieved = false;
    if (uploadedUrl) {
      const getRes = await fetch(`http://localhost:3000${uploadedUrl}`);
      imageRetrieved = getRes.status === 200;
    }
    assert(
      'Uploaded photo is persistently retrievable via HTTP static serving (returns 200)',
      imageRetrieved
    );

    // 11. Image Deletion Safeguard: Cannot delete an image used by an existing product
    const prodsRes = await fetch(`${API_BASE}/products`);
    const prodsJson = await prodsRes.json();
    const productWithImage = prodsJson.data?.find(
      (p) => (p.images && p.images.length > 0 && p.images[0]?.url) || p.image
    );
    let inUseBlocked = false;

    if (productWithImage) {
      const usedImageUrl = productWithImage.images?.[0]?.url || productWithImage.image;
      const usedFilename = path.basename(usedImageUrl);
      const deleteUsedRes = await fetch(`${API_BASE}/upload/${usedFilename}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${testAdminToken}` },
      });
      inUseBlocked = deleteUsedRes.status === 409 || deleteUsedRes.status === 400;
    }
    assert(
      'Safeguard: Deletion of an image referenced by an active product is blocked (returns 409/400)',
      inUseBlocked
    );

    // 12. Safe Deletion of Unused Temporary Image
    let unusedDeleted = false;
    if (uploadedFilename) {
      const deleteUnusedRes = await fetch(`${API_BASE}/upload/${uploadedFilename}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${testAdminToken}` },
      });
      unusedDeleted = deleteUnusedRes.status === 200;
    }
    assert(
      'Safe deletion of unused temporary image succeeds without affecting other items',
      unusedDeleted
    );

    // 13. Razorpay Gateway remains in TEST MODE ONLY
    const rzpOrderRes = await fetch(`${API_BASE}/razorpay/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ productId: prodsJson.data[0].id, quantity: 1 }],
      }),
    });
    const rzpJson = await rzpOrderRes.json();
    assert(
      'Razorpay payment gateway configured strictly in TEST MODE (rzp_test_ key, isTestMode=true)',
      rzpJson.isTestMode === true && rzpJson.keyId?.startsWith('rzp_test_') && !rzpJson.keySecret
    );

    // 14. Cash on Delivery remains available and fully functional
    const codRes = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Audit Customer',
        customerPhone: '9492456210',
        shippingAddress: {
          street: 'Temple Road',
          city: 'Bhadrachalam',
          state: 'Telangana',
          pincode: '507111',
        },
        items: [{ productId: prodsJson.data[0].id, quantity: 1, price: 199 }],
        paymentMethod: 'COD',
      }),
    });
    const codJson = await codRes.json();
    assert(
      'Cash on Delivery checkout preserves order creation with PENDING payment status',
      codRes.status === 201 && codJson.data?.paymentMethod === 'COD' && codJson.data?.paymentStatus === 'PENDING'
    );

    // 15. Production Storage Safety: Refuse silent local fallback in production when cloud storage is unconfigured
    const { uploadToPermanentStorage } = await import('./server/utils/uploader.js');
    process.env.NODE_ENV = 'production';
    let prodFallbackBlocked = false;
    let prodErrorMsg = '';
    try {
      await uploadToPermanentStorage('/tmp/dummy.png', 'dummy.png', 'image/png');
    } catch (e) {
      prodFallbackBlocked = true;
      prodErrorMsg = e.message;
    } finally {
      process.env.NODE_ENV = 'development';
    }
    assert(
      'Production Storage: Refuses silent local fallback and throws clear setup error',
      prodFallbackBlocked && prodErrorMsg.includes('Production Storage Error'),
      prodErrorMsg ? `Error: ${prodErrorMsg.substring(0, 80)}...` : ''
    );

    console.log(`\n================================================================`);
    console.log(`   FINAL AUDIT SUMMARY: ${passed}/${total} CHECKS PASSED`);
    console.log(`================================================================\n`);
  } catch (err) {
    console.error('Audit exception:', err);
  }
}

runSecurityAudit();
