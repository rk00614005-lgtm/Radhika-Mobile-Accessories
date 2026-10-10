// Comprehensive Verification Script for Firebase Integration
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  collection,
  query,
  where,
  limit,
} from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

console.log('--- STARTING FIREBASE INTEGRATION TEST SUITE ---');
console.log(`Target Project: ${config.projectId}`);
console.log(`Target Database: ${config.firestoreDatabaseId}`);

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function runTests() {
  let passed = 0;
  let total = 0;

  function assert(desc, condition) {
    total++;
    if (condition) {
      console.log(`✅ ${total}. ${desc}: PASS`);
      passed++;
    } else {
      console.error(`❌ ${total}. ${desc}: FAIL`);
    }
  }

  try {
    // 1. Connection check
    assert('1. Firebase Initialization & Configuration', !!db && !!config.apiKey);

    // 2. Read categories
    const catSnap = await getDocs(collection(db, 'categories'));
    console.log(`Categories count: ${catSnap.size}`);
    assert('2. Cloud Firestore Categories collection query', true);

    // 3. Products query
    const prodSnap = await getDocs(query(collection(db, 'products'), limit(5)));
    console.log(`Products queried: ${prodSnap.size}`);
    assert('3. Cloud Firestore Products catalog query', true);

    // 4. Test Order Creation
    const testOrderId = `order-test-${Date.now()}`;
    const orderData = {
      orderNumber: `RMA-${new Date().getFullYear()}-999001`,
      customerName: 'Test Customer',
      customerPhone: '9492456210',
      customerEmail: 'test@example.com',
      items: [
        {
          id: 'item-1',
          productId: 'prod-001',
          name: 'Radhika Crystal MagSafe Armor Case',
          price: 699,
          quantity: 1,
          total: 699
        }
      ],
      subtotal: 699,
      total: 699,
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'orders', testOrderId), orderData);
      const readOrderSnap = await getDoc(doc(db, 'orders', testOrderId));
      assert('4. Order Creation & Persistence in Cloud Firestore', readOrderSnap.exists() && readOrderSnap.data().orderNumber === orderData.orderNumber);

      // Clean up test order
      try {
        await deleteDoc(doc(db, 'orders', testOrderId));
      } catch {}
    } catch (orderErr) {
      console.log('Order creation note:', orderErr.message);
      assert('4. Order Creation & Persistence in Cloud Firestore', false);
    }

    // 5. Test Contact Message Creation
    const testMsgId = `msg-test-${Date.now()}`;
    const contactData = {
      name: 'Ramesh',
      email: 'ramesh@example.com',
      phone: '9492456210',
      message: 'Looking for OnePlus 12 tempered glass availability in Bhadrachalam shop.',
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'contact_messages', testMsgId), contactData);
      assert('5. Customer Contact Inquiry submission to Firestore', true);
      try {
        await deleteDoc(doc(db, 'contact_messages', testMsgId));
      } catch {}
    } catch (msgErr) {
      assert('5. Customer Contact Inquiry submission to Firestore', false);
    }

    // 6. Test Security Rules Restriction: Unauthenticated client cannot delete products
    try {
      await deleteDoc(doc(db, 'products', 'prod-001'));
      // If this succeeded without admin auth, rules failed
      assert('6. Security Rules: Unauthorized Product Deletion blocked', false);
    } catch (secErr) {
      // Permission denied is expected and proves the rule works!
      const isDenied = secErr.code === 'permission-denied' || secErr.message.includes('Missing or insufficient permissions');
      assert('6. Security Rules: Unauthorized Product Deletion blocked (PERMISSION_DENIED)', isDenied);
    }

    // 7. Test Security Rules Restriction: Unauthenticated client cannot create coupons
    try {
      await setDoc(doc(db, 'coupons', 'HACK99'), { code: 'HACK99', discountValue: 99, discountType: 'PERCENTAGE' });
      assert('7. Security Rules: Unauthorized Coupon creation blocked', false);
    } catch (coupErr) {
      const isDenied = coupErr.code === 'permission-denied' || coupErr.message.includes('Missing or insufficient permissions');
      assert('7. Security Rules: Unauthorized Coupon creation blocked (PERMISSION_DENIED)', isDenied);
    }

    // 8. Test Security Rules Restriction: Unauthenticated client cannot write to /admins
    try {
      await setDoc(doc(db, 'admins', 'attacker-uid'), { role: 'ADMIN', email: 'attacker@test.com' });
      assert('8. Security Rules: Privilege Escalation blocked on /admins', false);
    } catch (adminErr) {
      const isDenied = adminErr.code === 'permission-denied' || adminErr.message.includes('Missing or insufficient permissions');
      assert('8. Security Rules: Privilege Escalation blocked on /admins (PERMISSION_DENIED)', isDenied);
    }

    // 9. Local API Server Health Check & Static Uploads
    const healthRes = await fetch('http://localhost:3000/api/health');
    const healthJson = await healthRes.json();
    assert('9. Full-stack Server Health & Store details intact', healthRes.status === 200 && healthJson.store === 'Radhika Mobile Accessories');

    console.log(`\n=== FIREBASE SUITE RESULTS: ${passed}/${total} TESTS PASSED ===`);
    process.exit(passed === total ? 0 : 1);
  } catch (err) {
    console.error('Test suite error:', err);
    process.exit(1);
  }
}

runTests();
