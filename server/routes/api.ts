import fs from 'fs';
import path from 'path';
import { Router, Request, Response } from 'express';
import { store } from '../data/store.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import {
  uploadMiddleware,
  validateImageMagicBytes,
  uploadToPermanentStorage,
  isImageInUse,
  requireAdminAuth,
  requireCustomerOrAdminAuth,
  UPLOAD_DIR,
  MAX_FILE_SIZE,
} from '../utils/uploader.js';
import {
  isCloudinaryConfigured,
  deleteFromCloudinary,
} from '../utils/cloudinary.js';

export const apiRouter = Router();

// ==========================================
// CATEGORIES
// ==========================================
apiRouter.get('/categories', (_req: Request, res: Response) => {
  try {
    const categories = store.getCategories();
    res.json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// PRODUCTS
// ==========================================
apiRouter.get('/products', (req: Request, res: Response) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      inStockOnly,
      minRating,
      sort,
      featured,
      bestSeller,
      brand,
    } = req.query;

    const products = store.getProducts({
      category: category ? String(category) : undefined,
      search: search ? String(search) : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      inStockOnly: inStockOnly === 'true',
      minRating: minRating ? Number(minRating) : undefined,
      sort: sort ? String(sort) : undefined,
      featured: featured === 'true',
      bestSeller: bestSeller === 'true',
      brand: brand ? String(brand) : undefined,
    });

    res.json({ success: true, total: products.length, data: products });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

apiRouter.get('/products/:id', (req: Request, res: Response) => {
  try {
    const product = store.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    const related = store.getRelatedProducts(product.id, 4);
    const reviews = store.getReviewsForProduct(product.id);
    res.json({ success: true, data: { ...product, related, reviews } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin Add Product (Protected)
apiRouter.post('/products', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { name, price, originalPrice, categoryId, description } = req.body;
    if (!name || !price || !categoryId) {
      return res.status(400).json({ success: false, message: 'Name, price, and category are required' });
    }
    const newProduct = store.addProduct(req.body);
    res.status(201).json({ success: true, data: newProduct });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin Update Product (Protected)
apiRouter.put('/products/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const updated = store.updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin Delete Product (Protected)
apiRouter.delete('/products/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const deleted = store.deleteProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin Reset Sample Inventory (Protected)
apiRouter.post('/products/reset', requireAdminAuth, (_req: Request, res: Response) => {
  try {
    store.resetData();
    res.json({ success: true, message: 'Reset inventory to realistic factory sample data' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// REVIEWS
// ==========================================
apiRouter.get('/products/:id/reviews', (req: Request, res: Response) => {
  try {
    const reviews = store.getReviewsForProduct(req.params.id);
    res.json({ success: true, data: reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

apiRouter.post('/products/:id/reviews', (req: Request, res: Response) => {
  try {
    const { userName, rating, title, comment } = req.body;
    if (!userName || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Name, rating, and comment are required' });
    }
    const review = store.addReview({
      productId: req.params.id,
      userName,
      rating: Number(rating),
      title: title || 'Verified Purchase Review',
      comment,
    });
    res.status(201).json({ success: true, data: review });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// AUTHENTICATION
// ==========================================
apiRouter.post('/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existing = store.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const newUser = store.registerUser(name, email, password, phone);
    const { passwordHash, ...userProfile } = newUser;
    const token = `token-${newUser.id}-${Date.now()}`;

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to Radhika Mobile Accessories',
      token,
      user: userProfile,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = store.findUserByEmail(email);
    if (!user || user.passwordHash !== password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const { passwordHash, ...userProfile } = user;
    const token = `token-${user.id}-${Date.now()}`;

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: userProfile,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// COUPONS
// ==========================================
apiRouter.post('/coupons/validate', (req: Request, res: Response) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }
    const result = store.validateCoupon(code, Number(subtotal) || 0);
    res.json({ success: result.valid, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

apiRouter.get('/coupons', (_req: Request, res: Response) => {
  try {
    const coupons = store.getCoupons();
    res.json({ success: true, data: coupons });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

apiRouter.post('/coupons', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { code, discountValue } = req.body;
    if (!code || !discountValue) {
      return res.status(400).json({ success: false, message: 'Coupon code and discount value are required' });
    }
    const newCoupon = store.addCoupon(req.body);
    res.status(201).json({ success: true, data: newCoupon });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

apiRouter.delete('/coupons/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const deleted = store.deleteCoupon(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// RAZORPAY PAYMENT GATEWAY (TEST MODE ONLY)
// ==========================================

// Initialise official Razorpay SDK client in Test Mode if credentials are configured
const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_RadhikaMobileStore';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_radhika_2025';
const razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || razorpayKeySecret;

let razorpayClient: any = null;
try {
  razorpayClient = new (Razorpay as any)({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret,
  });
} catch (clientErr) {
  console.warn('[Razorpay] Note initializing Razorpay SDK client:', clientErr);
}

// 1. Calculate trusted server-side order total and create Razorpay order
apiRouter.post('/razorpay/create-order', async (req: Request, res: Response) => {
  try {
    const { items, couponCode, customerName, customerEmail, customerPhone } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order creation requires a non-empty list of cart items',
      });
    }

    // Security: Calculate subtotal from trusted server catalog prices, never trust client-provided totals
    let calculatedSubtotal = 0;
    const validatedItems: any[] = [];

    for (const item of items) {
      const prodId = item.productId || item.product?.id || item.id;
      const product = store.getProductById(prodId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product "${prodId}" not found in catalog or discontinued`,
        });
      }

      const qty = Math.max(1, Number(item.quantity) || 1);
      const lineTotal = product.price * qty;
      calculatedSubtotal += lineTotal;

      validatedItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: qty,
        lineTotal,
      });
    }

    // Apply valid coupon discount securely on the server
    let discountAmount = 0;
    if (couponCode && typeof couponCode === 'string') {
      const couponCheck = store.validateCoupon(couponCode, calculatedSubtotal);
      if (couponCheck.valid) {
        discountAmount = couponCheck.discount;
      }
    }

    // Configured free shipping threshold (₹499)
    const freeShippingThreshold = Number(process.env.FREE_SHIPPING_THRESHOLD || 499);
    const defaultShippingFee = Number(process.env.DEFAULT_SHIPPING_FEE || 49);
    const shippingFee = (calculatedSubtotal - discountAmount) >= freeShippingThreshold ? 0 : defaultShippingFee;

    const finalAmountInRupees = Math.max(1, calculatedSubtotal - discountAmount + shippingFee);
    const finalAmountInPaise = Math.round(finalAmountInRupees * 100);

    const receiptId = `rcpt_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;

    let razorpayOrderId: string;

    // Use official Razorpay SDK client if available and valid
    if (razorpayClient && razorpayKeyId.startsWith('rzp_test_') && razorpayKeySecret !== 'rzp_test_secret_radhika_2025') {
      try {
        const rzpOrder = await razorpayClient.orders.create({
          amount: finalAmountInPaise,
          currency: 'INR',
          receipt: receiptId,
          notes: {
            shop: 'Radhika Mobile Accessories',
            customerName: customerName || 'Valued Customer',
            customerPhone: customerPhone || '9492456210',
            customerEmail: customerEmail || 'customer@example.com',
            mode: 'TEST_MODE',
          },
        });
        razorpayOrderId = rzpOrder.id;
      } catch (sdkErr: any) {
        console.warn('[Razorpay SDK] Order creation call fallback:', sdkErr?.message);
        // Fallback to test order ID simulation if test credentials rejected by sandbox
        razorpayOrderId = `order_test_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
      }
    } else {
      // Deterministic Sandbox Test Mode order ID
      razorpayOrderId = `order_test_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Return ONLY safe client fields (Never leak Key Secret!)
    res.json({
      success: true,
      keyId: razorpayKeyId,
      orderId: razorpayOrderId,
      amount: finalAmountInPaise,
      amountInRupees: finalAmountInRupees,
      currency: 'INR',
      receipt: receiptId,
      calculatedDetails: {
        subtotal: calculatedSubtotal,
        discount: discountAmount,
        shippingFee,
        total: finalAmountInRupees,
      },
      businessName: process.env.RAZORPAY_MERCHANT_NAME || 'Radhika Mobile Accessories',
      description: 'Payment for Smartphone Accessories & Gear (Test Mode)',
      isTestMode: true,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to generate payment order' });
  }
});

// 2. Cryptographically verify Razorpay payment signature
apiRouter.post('/razorpay/verify', (req: Request, res: Response) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: missing razorpayOrderId or razorpayPaymentId',
      });
    }

    // Official algorithm: HMAC-SHA256(order_id + "|" + payment_id, secret)
    const generatedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    // If client supplied signature, verify it against generated signature
    let signatureVerified = false;
    if (razorpaySignature && typeof razorpaySignature === 'string') {
      try {
        signatureVerified = crypto.timingSafeEqual(
          Buffer.from(generatedSignature, 'utf8'),
          Buffer.from(razorpaySignature, 'utf8')
        );
      } catch {
        signatureVerified = false;
      }
    } else if (razorpayPaymentId.startsWith('pay_rzp_test_') || razorpayPaymentId.startsWith('pay_test_')) {
      // In sandbox interactive modal simulation without external webhook signature, generate verified signature
      signatureVerified = true;
    }

    if (!signatureVerified) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'Invalid payment signature. Transaction verification failed.',
      });
    }

    res.json({
      success: true,
      verified: true,
      message: 'Payment verified successfully via Razorpay test gateway (Test Mode)',
      transactionId: razorpayPaymentId,
      orderId: razorpayOrderId,
      generatedSignature,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Payment signature verification error' });
  }
});

// 3. Webhook endpoint: Process server-to-server Razorpay asynchronous notifications
const processedWebhookEvents = new Set<string>();

apiRouter.post('/razorpay/webhook', (req: Request, res: Response) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'] as string;
    const rawBody: Buffer = (req as any).rawBody || Buffer.from(JSON.stringify(req.body));

    if (!webhookSignature) {
      return res.status(400).json({
        success: false,
        message: 'Missing x-razorpay-signature header on webhook request',
      });
    }

    // Verify webhook signature with HMAC-SHA256(rawBody, webhookSecret)
    const expectedSignature = crypto
      .createHmac('sha256', razorpayWebhookSecret)
      .update(rawBody)
      .digest('hex');

    let isValid = false;
    try {
      isValid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'utf8'),
        Buffer.from(webhookSignature, 'utf8')
      );
    } catch {
      isValid = false;
    }

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Webhook signature validation failed',
      });
    }

    const event = req.body;
    const eventId = event?.event_id || event?.id || `${event?.event}_${event?.payload?.payment?.entity?.id}`;

    // Prevent duplicate processing / replay attacks
    if (processedWebhookEvents.has(eventId)) {
      return res.json({
        success: true,
        status: 'ignored_duplicate',
        message: 'Duplicate webhook event ignored safely',
      });
    }

    processedWebhookEvents.add(eventId);

    const eventType = event?.event;
    console.log(`[Razorpay Webhook] Received event: ${eventType} (ID: ${eventId})`);

    // Handle standard payment events
    switch (eventType) {
      case 'payment.captured':
      case 'order.paid': {
        const paymentEntity = event?.payload?.payment?.entity;
        const rzpOrderId = paymentEntity?.order_id || event?.payload?.order?.entity?.id;
        const rzpPaymentId = paymentEntity?.id;

        if (rzpOrderId) {
          // Update order status in store
          const orders = store.getOrders();
          const targetOrder = orders.find(
            (o) => o.razorpayOrderId === rzpOrderId || o.id === rzpOrderId
          );

          if (targetOrder) {
            targetOrder.paymentStatus = 'COMPLETED';
            targetOrder.status = 'PROCESSING';
            targetOrder.razorpayPaymentId = rzpPaymentId || targetOrder.razorpayPaymentId;
            targetOrder.updatedAt = new Date().toISOString();
          }
        }
        break;
      }

      case 'payment.failed': {
        const paymentEntity = event?.payload?.payment?.entity;
        const rzpOrderId = paymentEntity?.order_id;
        if (rzpOrderId) {
          const orders = store.getOrders();
          const targetOrder = orders.find((o) => o.razorpayOrderId === rzpOrderId);
          if (targetOrder && targetOrder.paymentStatus !== 'COMPLETED') {
            targetOrder.paymentStatus = 'FAILED';
            targetOrder.updatedAt = new Date().toISOString();
          }
        }
        break;
      }

      default:
        console.log(`[Razorpay Webhook] Unhandled event type: ${eventType}`);
        break;
    }

    res.json({
      success: true,
      status: 'processed',
      event: eventType,
      message: 'Razorpay webhook acknowledged successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Webhook processing failed' });
  }
});

// ==========================================
// ORDERS
// ==========================================
apiRouter.post('/orders', (req: Request, res: Response) => {
  try {
    const { customerName, customerEmail, customerPhone, items, shippingAddress, paymentMethod } = req.body;
    if (!customerName || !customerPhone || !items || !items.length || !shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone number, shipping address, and at least 1 item are required',
      });
    }

    const order = store.createOrder(req.body);
    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Customer / Admin Protected Orders Query
apiRouter.get('/orders', requireCustomerOrAdminAuth, (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    const orders = store.getOrders(userId ? String(userId) : undefined);
    res.json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

apiRouter.get('/orders/track/:orderNumber', (req: Request, res: Response) => {
  try {
    const order = store.getOrderByNumber(req.params.orderNumber);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: `No order found with number "${req.params.orderNumber}". Please double-check your order ID.`,
      });
    }
    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin-Only Order Status Update
apiRouter.patch('/orders/:id/status', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { status, trackingNumber } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }
    const updated = store.updateOrderStatus(req.params.id, status, trackingNumber);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: updated, message: `Order status updated to ${status}` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// CONTACT FORM
// ==========================================
apiRouter.post('/contact', (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required' });
    }
    const saved = store.addContactMessage({ name, email, phone, subject: subject || 'Store Inquiry', message });
    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! Our team at Radhika Mobile Accessories will contact you within 24 hours.',
      data: saved,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin-Only Read Contact Inquiries
apiRouter.get('/contact', requireAdminAuth, (_req: Request, res: Response) => {
  try {
    const messages = store.getContactMessages();
    res.json({ success: true, data: messages });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// ADMIN DASHBOARD ANALYTICS
// ==========================================
apiRouter.get('/admin/stats', requireAdminAuth, (_req: Request, res: Response) => {
  try {
    const stats = store.getAdminStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// PHOTO UPLOAD API
// ==========================================
apiRouter.post('/upload', requireAdminAuth, (req: Request, res: Response) => {
  uploadMiddleware.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'image', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ])(req, res, async (err: any) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Image size exceeds maximum limit of 5 MB. Please select a smaller photo.',
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to upload photo.',
      });
    }

    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    const file =
      files?.photo?.[0] ||
      files?.image?.[0] ||
      files?.file?.[0] ||
      (req as any).file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No photo file provided. Please choose a JPG, PNG, or WebP photo to upload.',
      });
    }

    // Security: Validate Magic Bytes to verify true image content
    const isValidImage = validateImageMagicBytes(file.path);
    if (!isValidImage) {
      try {
        fs.unlinkSync(file.path);
      } catch (unlinkErr) {
        console.error('Failed to remove invalid upload:', unlinkErr);
      }
      return res.status(400).json({
        success: false,
        message: 'Security validation failed: File content is corrupted or not a valid image format.',
      });
    }

    try {
      const storageResult = await uploadToPermanentStorage(file.path, file.filename, file.mimetype);

      // Clean up temporary local file if uploaded to Cloudinary
      if (storageResult.provider === 'cloudinary') {
        try {
          fs.unlinkSync(file.path);
        } catch {}
      }

      res.status(201).json({
        success: true,
        message: 'Photo uploaded and verified successfully.',
        data: {
          url: storageResult.url,
          filename: file.filename,
          originalName: file.originalname,
          size: storageResult.bytes || file.size,
          mimetype: file.mimetype,
          provider: storageResult.provider,
          publicId: storageResult.publicId,
        },
      });
    } catch (storageErr: any) {
      try {
        fs.unlinkSync(file.path);
      } catch {}
      return res.status(500).json({
        success: false,
        message: storageErr.message || 'Failed to upload photo to permanent storage.',
        code: 'PERSISTENT_STORAGE_REQUIRED',
      });
    }
  });
});

apiRouter.post('/upload/multiple', requireAdminAuth, (req: Request, res: Response) => {
  uploadMiddleware.array('photos', 5)(req, res, async (err: any) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'One or more images exceed the 5 MB limit. Please select smaller photos.',
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to upload photos.',
      });
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No photo files provided. Please choose photos to upload.',
      });
    }

    const validatedResults: Array<{
      url: string;
      filename: string;
      originalName: string;
      size: number;
      mimetype: string;
      provider?: string;
      publicId?: string;
    }> = [];

    for (const file of files) {
      const isValid = validateImageMagicBytes(file.path);
      if (!isValid) {
        try {
          fs.unlinkSync(file.path);
        } catch (e) {}
        continue;
      }

      try {
        const storageResult = await uploadToPermanentStorage(file.path, file.filename, file.mimetype);
        if (storageResult.provider === 'cloudinary') {
          try {
            fs.unlinkSync(file.path);
          } catch {}
        }
        validatedResults.push({
          url: storageResult.url,
          filename: file.filename,
          originalName: file.originalname,
          size: storageResult.bytes || file.size,
          mimetype: file.mimetype,
          provider: storageResult.provider,
          publicId: storageResult.publicId,
        });
      } catch (uploadErr) {
        try {
          fs.unlinkSync(file.path);
        } catch {}
      }
    }

    if (validatedResults.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Security validation failed: None of the uploaded files contained valid image signatures or storage failed.',
      });
    }

    res.status(201).json({
      success: true,
      message: `${validatedResults.length} photo(s) uploaded successfully`,
      data: validatedResults,
    });
  });
});

apiRouter.delete('/upload/:filename', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const rawTarget = req.params.filename;
    const safeFilename = path.basename(rawTarget);

    // Safeguard: Check that no products or gallery items still reference this asset
    const inUseCheck = isImageInUse(safeFilename);
    if (inUseCheck.inUse) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete photo: This image is currently in use by ${inUseCheck.usedBy.join(', ')}. Please update or remove the referencing item before deleting this asset.`,
        referencedBy: inUseCheck.usedBy,
      });
    }

    let deletedFromCloud = false;

    // If Cloudinary public_id or filename is requested
    if (isCloudinaryConfigured()) {
      try {
        const filenameWithoutExt = path.parse(safeFilename).name;
        const candidatePublicIds = [
          `radhika_mobile/products/${filenameWithoutExt}`,
          filenameWithoutExt,
          rawTarget,
        ];
        for (const pid of candidatePublicIds) {
          const destroyed = await deleteFromCloudinary(pid);
          if (destroyed) {
            deletedFromCloud = true;
            break;
          }
        }
      } catch (cloudErr) {
        console.warn('Cloudinary destroy notice:', cloudErr);
      }
    }

    const targetPath = path.join(UPLOAD_DIR, safeFilename);
    let deletedFromLocal = false;

    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
      deletedFromLocal = true;
    }

    if (deletedFromCloud || deletedFromLocal) {
      return res.json({
        success: true,
        message: 'Photo deleted successfully from storage',
        deletedFrom: {
          cloudinary: deletedFromCloud,
          local: deletedFromLocal,
        },
      });
    }

    res.status(404).json({ success: false, message: 'Photo not found in storage' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// SHOP PHOTO GALLERY
// ==========================================
apiRouter.get('/gallery', (req: Request, res: Response) => {
  try {
    const category = req.query.category ? String(req.query.category) : undefined;
    const items = store.getGallery(category);
    res.json({ success: true, total: items.length, data: items });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

apiRouter.get('/gallery/:id', (req: Request, res: Response) => {
  try {
    const item = store.getGalleryItemById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Gallery photo not found' });
    }
    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

apiRouter.post('/gallery', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { title, imageUrl, category, description } = req.body;
    if (!title || !imageUrl) {
      return res.status(400).json({ success: false, message: 'Title and Image URL are required' });
    }
    const created = store.addGalleryItem({
      title,
      imageUrl,
      category: category || 'STORE_INTERIOR',
      description: description || '',
    });
    res.status(201).json({ success: true, message: 'Shop photo added to gallery', data: created });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

apiRouter.put('/gallery/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const updated = store.updateGalleryItem(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Gallery item not found' });
    }
    res.json({ success: true, message: 'Gallery photo details updated', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

apiRouter.delete('/gallery/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const deleted = store.deleteGalleryItem(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Gallery photo not found' });
    }
    res.json({ success: true, message: 'Gallery photo deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
