// Comprehensive Test Suite for Phase 2: Razorpay Integration in Test Mode Only
import crypto from 'crypto';

const API_BASE = 'http://localhost:3000/api';

async function runRazorpayTestSuite() {
  console.log('====================================================');
  console.log('  TESTING PHASE 2: RAZORPAY INTEGRATION (TEST MODE)  ');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(desc, condition, details = '') {
    total++;
    if (condition) {
      console.log(`✅ ${total}. ${desc}: PASS ${details ? `(${details})` : ''}`);
      passed++;
    } else {
      console.error(`❌ ${total}. ${desc}: FAIL ${details ? `(${details})` : ''}`);
    }
  }

  try {
    // 1. Fetch products to get authentic catalog items
    const prodRes = await fetch(`${API_BASE}/products`);
    const prodJson = await prodRes.json();
    const testProduct1 = prodJson.data[0];
    const testProduct2 = prodJson.data[1];

    assert(
      'Catalog products available for order calculation',
      prodRes.status === 200 && testProduct1 && testProduct2,
      `Product 1: ${testProduct1?.name} @ ₹${testProduct1?.price}`
    );

    // 2. Secure Server-Side Payment Order Creation
    const createOrderPayload = {
      items: [
        { productId: testProduct1.id, quantity: 2 },
        { productId: testProduct2.id, quantity: 1 }
      ],
      couponCode: 'SAVE10',
      customerName: 'Kavita Reddy',
      customerEmail: 'kavita@example.com',
      customerPhone: '9492456210'
    };

    const createOrderRes = await fetch(`${API_BASE}/razorpay/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createOrderPayload)
    });
    const orderData = await createOrderRes.json();

    assert(
      'Server-Side Razorpay Order Creation (Trusted Catalog Calculation)',
      createOrderRes.status === 200 && orderData.success && orderData.orderId,
      `Generated Order: ${orderData.orderId}, Amount: ${orderData.amount} paise (₹${orderData.amountInRupees})`
    );

    // Verify key secret is never exposed in response
    assert(
      'Security: Razorpay Key Secret is NEVER leaked in client API response',
      !orderData.keySecret && !orderData.secret && !JSON.stringify(orderData).includes('rzp_test_secret')
    );

    // Verify test mode flag
    assert(
      'Test Mode Verification: Response identifies Test Mode environment',
      orderData.isTestMode === true && orderData.keyId.startsWith('rzp_test_')
    );

    // 3. Rejection of Invalid / Discontinued Products
    const invalidProdRes = await fetch(`${API_BASE}/razorpay/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ productId: 'non-existent-product-id-999', quantity: 1 }]
      })
    });
    const invalidProdJson = await invalidProdRes.json();
    assert(
      'Server-Side Validation: Rejects invalid or nonexistent product IDs',
      invalidProdRes.status === 404 && invalidProdJson.success === false
    );

    // 4. Rejection of Empty Items Array
    const emptyOrderRes = await fetch(`${API_BASE}/razorpay/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [] })
    });
    assert(
      'Server-Side Validation: Rejects empty cart items array',
      emptyOrderRes.status === 400
    );

    // 5. Valid Payment Verification (HMAC-SHA256 Signature Verification)
    const testRzpOrderId = orderData.orderId || `order_test_${Date.now()}`;
    const testRzpPaymentId = `pay_test_${Date.now()}_5555`;
    const testSecret = 'rzp_test_secret_radhika_2025';

    // Compute legitimate HMAC-SHA256 signature
    const validSignature = crypto
      .createHmac('sha256', testSecret)
      .update(`${testRzpOrderId}|${testRzpPaymentId}`)
      .digest('hex');

    const verifySuccessRes = await fetch(`${API_BASE}/razorpay/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpayOrderId: testRzpOrderId,
        razorpayPaymentId: testRzpPaymentId,
        razorpaySignature: validSignature
      })
    });
    const verifySuccessJson = await verifySuccessRes.json();

    assert(
      'Cryptographic Payment Signature Verification (Valid HMAC-SHA256)',
      verifySuccessRes.status === 200 && verifySuccessJson.success === true && verifySuccessJson.verified === true,
      `Transaction: ${verifySuccessJson.transactionId}`
    );

    // 6. Tampered / Invalid Signature Rejection
    const verifyTamperedRes = await fetch(`${API_BASE}/razorpay/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpayOrderId: testRzpOrderId,
        razorpayPaymentId: testRzpPaymentId,
        razorpaySignature: 'tampered_invalid_hex_signature_1234567890abcdef'
      })
    });
    const verifyTamperedJson = await verifyTamperedRes.json();

    assert(
      'Security: Rejection of forged / invalid payment signature',
      verifyTamperedRes.status === 400 && verifyTamperedJson.success === false
    );

    // 7. Missing Payment Identifiers Rejection
    const missingParamsRes = await fetch(`${API_BASE}/razorpay/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpayOrderId: testRzpOrderId
        // missing razorpayPaymentId
      })
    });
    assert(
      'Input Validation: Rejects payment verification missing payment ID',
      missingParamsRes.status === 400
    );

    // 8. Place Order with Verified Razorpay Payment Details (Preserves persistence)
    const orderPayload = {
      customerName: 'Kavita Reddy',
      customerPhone: '9492456210',
      customerEmail: 'kavita@example.com',
      shippingAddress: {
        fullName: 'Kavita Reddy',
        phone: '9492456210',
        street: 'Market Road, Opposite Current Office',
        city: 'Bhadrachalam',
        state: 'Telangana',
        pincode: '507111'
      },
      items: [
        {
          productId: testProduct1.id,
          quantity: 2
        }
      ],
      paymentMethod: 'RAZORPAY',
      razorpayOrderId: testRzpOrderId,
      razorpayPaymentId: testRzpPaymentId
    };

    const placeOrderRes = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });
    const placedOrderJson = await placeOrderRes.json();

    assert(
      'Online Order Record Created with Razorpay Payment Metadata',
      placeOrderRes.status === 201 && placedOrderJson.success && placedOrderJson.data?.orderNumber,
      `Order #${placedOrderJson.data?.orderNumber}, Payment: ${placedOrderJson.data?.paymentMethod} (${placedOrderJson.data?.paymentStatus})`
    );

    // 9. Preserve Cash on Delivery Functionality
    const codOrderPayload = {
      customerName: 'Naveen Kumar',
      customerPhone: '7207126270',
      customerEmail: 'naveen@example.com',
      shippingAddress: {
        fullName: 'Naveen Kumar',
        phone: '7207126270',
        street: 'Temple Street',
        city: 'Bhadrachalam',
        state: 'Telangana',
        pincode: '507111'
      },
      items: [
        {
          productId: testProduct2.id,
          quantity: 1
        }
      ],
      paymentMethod: 'COD'
    };

    const codOrderRes = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(codOrderPayload)
    });
    const codOrderJson = await codOrderRes.json();

    assert(
      'Cash on Delivery Preservation: Successfully placed COD order with PENDING payment status',
      codOrderRes.status === 201 && codOrderJson.data?.paymentMethod === 'COD' && codOrderJson.data?.paymentStatus === 'PENDING'
    );

    // 10. Webhook Signature Verification & Event Processing
    const webhookEvent = {
      event: 'payment.captured',
      event_id: `evt_test_${Date.now()}_999`,
      payload: {
        payment: {
          entity: {
            id: testRzpPaymentId,
            order_id: testRzpOrderId,
            amount: orderData.amount,
            status: 'captured',
            method: 'upi'
          }
        }
      }
    };

    const webhookBodyBuffer = Buffer.from(JSON.stringify(webhookEvent), 'utf8');
    const validWebhookSignature = crypto
      .createHmac('sha256', testSecret)
      .update(webhookBodyBuffer)
      .digest('hex');

    const webhookRes = await fetch(`${API_BASE}/razorpay/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': validWebhookSignature
      },
      body: webhookBodyBuffer
    });
    const webhookJson = await webhookRes.json();

    assert(
      'Razorpay Webhook: Cryptographic signature verified and event acknowledged',
      webhookRes.status === 200 && webhookJson.success === true && webhookJson.status === 'processed'
    );

    // 11. Webhook Idempotency: Duplicate Event Replay Prevention
    const duplicateWebhookRes = await fetch(`${API_BASE}/razorpay/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': validWebhookSignature
      },
      body: webhookBodyBuffer
    });
    const duplicateJson = await duplicateWebhookRes.json();

    assert(
      'Razorpay Webhook Idempotency: Duplicate webhook event safely ignored without duplicate processing',
      duplicateWebhookRes.status === 200 && duplicateJson.status === 'ignored_duplicate'
    );

    // 12. Webhook Security: Rejection of Forged Webhook Signature
    const forgedWebhookRes = await fetch(`${API_BASE}/razorpay/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': 'forged_fake_signature_abc123'
      },
      body: webhookBodyBuffer
    });
    assert(
      'Security: Rejection of forged webhook signature without valid secret',
      forgedWebhookRes.status === 400
    );

    // 13. Admin Privileged API Protection Check
    const unauthProductModRes = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Hacked Product', price: 10, categoryId: 'cat-1' })
    });
    assert(
      'Security: Privileged Product Creation API requires Authorization (401 Rejection)',
      unauthProductModRes.status === 401
    );

    console.log(`\n====================================================`);
    console.log(`  PHASE 2 SUMMARY: ${passed}/${total} TEST SUITE TESTS PASSED  `);
    console.log(`====================================================\n`);
  } catch (err) {
    console.error('Test execution exception:', err);
  }
}

runRazorpayTestSuite();
