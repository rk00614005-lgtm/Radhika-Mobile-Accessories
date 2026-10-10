import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase.js';
import {
  Product,
  Category,
  Order,
  Coupon,
  Review,
  GalleryItem,
  ContactMessage,
  AdminStats,
  User,
} from '../types/index.js';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_COUPONS,
  INITIAL_GALLERY,
} from '../../server/data/initialData.js';

let isSeeding = false;

/**
 * Automatically seeds Firestore if the collections are empty.
 */
export async function seedFirestoreIfEmpty(): Promise<void> {
  if (isSeeding) return;
  try {
    const productsRef = collection(db, 'products');
    const existingSnap = await getDocs(query(productsRef, limit(1)));
    if (!existingSnap.empty) {
      return; // Database already seeded with real data
    }

    isSeeding = true;
    console.log('📦 Seeding initial Radhika Mobile Accessories catalogue into Cloud Firestore...');

    // 1. Categories
    for (const cat of INITIAL_CATEGORIES) {
      await setDoc(doc(db, 'categories', cat.id), cat);
    }

    // 2. Products
    for (const prod of INITIAL_PRODUCTS) {
      await setDoc(doc(db, 'products', prod.id), prod);
    }

    // 3. Coupons
    for (const coupon of INITIAL_COUPONS) {
      await setDoc(doc(db, 'coupons', coupon.id), coupon);
    }

    // 4. Gallery
    for (const item of INITIAL_GALLERY) {
      await setDoc(doc(db, 'gallery', item.id), item);
    }

    console.log('✅ Cloud Firestore successfully populated with store catalogue!');
  } catch (err) {
    console.warn('Note on seeding Firestore (may require admin rules or already initialized):', err);
  } finally {
    isSeeding = false;
  }
}

// ==========================================
// CATEGORIES
// ==========================================
export async function getCategories(): Promise<Category[]> {
  const path = 'categories';
  try {
    await seedFirestoreIfEmpty();
    const snap = await getDocs(collection(db, path));
    if (snap.empty) {
      return INITIAL_CATEGORIES;
    }
    const categories: Category[] = [];
    snap.forEach((docSnap) => {
      categories.push(docSnap.data() as Category);
    });
    return categories.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// ==========================================
// PRODUCTS
// ==========================================
export async function getProducts(params?: Record<string, any>): Promise<Product[]> {
  const path = 'products';
  try {
    await seedFirestoreIfEmpty();
    const snap = await getDocs(collection(db, path));
    let products: Product[] = [];
    snap.forEach((docSnap) => {
      products.push(docSnap.data() as Product);
    });

    if (products.length === 0) {
      products = INITIAL_PRODUCTS;
    }

    // Client-side / filter processing
    if (params) {
      const {
        search,
        category,
        brand,
        model,
        minPrice,
        maxPrice,
        inStockOnly,
        minRating,
        sort,
        featured,
        bestSeller,
      } = params;

      if (category) {
        products = products.filter(
          (p) => p.categoryId === category || p.categoryName?.toLowerCase() === String(category).toLowerCase()
        );
      }

      if (brand) {
        products = products.filter(
          (p) => p.brand?.toLowerCase() === String(brand).toLowerCase()
        );
      }

      if (model) {
        const modelTerm = String(model).toLowerCase();
        products = products.filter(
          (p) =>
            p.compatibility?.toLowerCase().includes(modelTerm) ||
            p.name.toLowerCase().includes(modelTerm)
        );
      }

      if (search) {
        const term = String(search).toLowerCase().trim();
        products = products.filter(
          (p) =>
            p.name.toLowerCase().includes(term) ||
            p.description.toLowerCase().includes(term) ||
            p.brand.toLowerCase().includes(term) ||
            (p.compatibility && p.compatibility.toLowerCase().includes(term)) ||
            (p.tags && p.tags.some((t) => t.toLowerCase().includes(term)))
        );
      }

      if (minPrice !== undefined && minPrice !== null) {
        products = products.filter((p) => p.price >= Number(minPrice));
      }

      if (maxPrice !== undefined && maxPrice !== null) {
        products = products.filter((p) => p.price <= Number(maxPrice));
      }

      if (inStockOnly) {
        products = products.filter((p) => p.inStock && p.stock > 0);
      }

      if (minRating !== undefined && minRating !== null) {
        products = products.filter((p) => p.rating >= Number(minRating));
      }

      if (featured) {
        products = products.filter((p) => p.isFeatured);
      }

      if (bestSeller) {
        products = products.filter((p) => p.isBestSeller);
      }

      if (sort) {
        switch (sort) {
          case 'price_asc':
            products.sort((a, b) => a.price - b.price);
            break;
          case 'price_desc':
            products.sort((a, b) => b.price - a.price);
            break;
          case 'rating':
            products.sort((a, b) => b.rating - a.rating);
            break;
          case 'newest':
            products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
          case 'popularity':
          default:
            products.sort((a, b) => b.reviewCount - a.reviewCount);
            break;
        }
      }
    }

    return products;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function getProductById(
  id: string
): Promise<Product & { related: Product[]; reviews: Review[] }> {
  const path = `products/${id}`;
  try {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);

    let product: Product;
    if (docSnap.exists()) {
      product = docSnap.data() as Product;
    } else {
      const fallback = INITIAL_PRODUCTS.find((p) => p.id === id);
      if (!fallback) {
        throw new Error(`Product with ID "${id}" not found`);
      }
      product = fallback;
    }

    // Fetch related products
    const all = await getProducts();
    const related = all
      .filter((p) => p.id !== product.id && p.categoryId === product.categoryId)
      .slice(0, 4);

    // Fetch reviews
    const reviews = await getReviewsForProduct(product.id);

    return {
      ...product,
      related,
      reviews,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function addProduct(productData: Partial<Product>): Promise<Product> {
  const id = productData.id || `prod-${Date.now()}`;
  const path = `products/${id}`;
  try {
    const now = new Date().toISOString();
    const fullProduct: Product = {
      id,
      name: productData.name || 'Unnamed Accessory',
      slug: productData.slug || productData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'product',
      description: productData.description || '',
      shortDescription: productData.shortDescription || (productData.description ? productData.description.slice(0, 120) : ''),
      price: Number(productData.price) || 0,
      originalPrice: Number(productData.originalPrice || productData.price) || 0,
      discountPercent: productData.originalPrice && productData.price
        ? Math.round(((productData.originalPrice - productData.price) / productData.originalPrice) * 100)
        : 0,
      brand: productData.brand || 'Radhika Genuine',
      compatibility: productData.compatibility || 'Universal Smartphone',
      stock: Number(productData.stock ?? 10),
      inStock: (productData.stock ?? 10) > 0,
      rating: productData.rating || 5.0,
      reviewCount: productData.reviewCount || 1,
      isFeatured: !!productData.isFeatured,
      isBestSeller: !!productData.isBestSeller,
      sku: productData.sku || `RMA-${Math.floor(1000 + Math.random() * 9000)}`,
      tags: productData.tags || ['accessories', 'new-arrival'],
      categoryId: productData.categoryId || 'cat-cases',
      categoryName: productData.categoryName || 'Mobile Cases & Covers',
      images: productData.images || [
        { id: `img-${Date.now()}`, url: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=600&q=80', isPrimary: true },
      ],
      specifications: productData.specifications || { Warranty: '6 Months Replacement' },
      colors: productData.colors || ['Black', 'Clear'],
      createdAt: now,
    };

    await setDoc(doc(db, 'products', id), fullProduct);
    return fullProduct;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  const path = `products/${id}`;
  try {
    const docRef = doc(db, 'products', id);
    const existingSnap = await getDoc(docRef);

    if (!existingSnap.exists()) {
      throw new Error(`Product not found with ID ${id}`);
    }

    const current = existingSnap.data() as Product;
    const stockVal = updates.stock !== undefined ? Number(updates.stock) : current.stock;
    const inStockVal = updates.inStock !== undefined ? updates.inStock : stockVal > 0;

    const merged: Product = {
      ...current,
      ...updates,
      stock: stockVal,
      inStock: inStockVal,
    };

    await setDoc(docRef, merged);
    return merged;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const path = `products/${id}`;
  try {
    await deleteDoc(doc(db, 'products', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==========================================
// COUPONS
// ==========================================
export async function getCoupons(): Promise<Coupon[]> {
  const path = 'coupons';
  try {
    await seedFirestoreIfEmpty();
    const snap = await getDocs(collection(db, path));
    if (snap.empty) {
      return INITIAL_COUPONS;
    }
    const coupons: Coupon[] = [];
    snap.forEach((d) => coupons.push(d.data() as Coupon));
    return coupons;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<{ valid: boolean; discount: number; message: string; coupon?: Coupon }> {
  try {
    const coupons = await getCoupons();
    const coupon = coupons.find(
      (c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive
    );

    if (!coupon) {
      return { valid: false, discount: 0, message: 'Invalid or expired coupon code' };
    }

    if (subtotal < coupon.minOrderValue) {
      return {
        valid: false,
        discount: 0,
        message: `Coupon "${coupon.code}" requires minimum order of ₹${coupon.minOrderValue}`,
      };
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    discount = Math.min(discount, subtotal);
    return {
      valid: true,
      discount,
      message: `Coupon applied: ₹${discount} saved! 🎉`,
      coupon,
    };
  } catch (error) {
    return { valid: false, discount: 0, message: 'Failed to validate coupon' };
  }
}

export async function addCoupon(couponData: Partial<Coupon>): Promise<Coupon> {
  const id = couponData.id || `coupon-${Date.now()}`;
  const path = `coupons/${id}`;
  try {
    const coupon: Coupon = {
      id,
      code: couponData.code?.toUpperCase() || 'PROMO',
      description: couponData.description || 'Special Discount',
      discountType: couponData.discountType || 'PERCENTAGE',
      discountValue: Number(couponData.discountValue) || 10,
      minOrderValue: Number(couponData.minOrderValue) || 499,
      maxDiscount: couponData.maxDiscount ? Number(couponData.maxDiscount) : undefined,
      isActive: couponData.isActive !== false,
      expiresAt: couponData.expiresAt || new Date(Date.now() + 30 * 86400000).toISOString(),
    };
    await setDoc(doc(db, 'coupons', id), coupon);
    return coupon;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteCoupon(id: string): Promise<void> {
  const path = `coupons/${id}`;
  try {
    await deleteDoc(doc(db, 'coupons', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==========================================
// ORDERS
// ==========================================
export async function createOrder(orderPayload: any): Promise<Order> {
  const id = `order-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const path = `orders/${id}`;
  try {
    const orderNumber = `RMA-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();

    const order: Order = {
      id,
      orderNumber,
      userId: auth.currentUser?.uid || orderPayload.userId || undefined,
      customerName: orderPayload.customerName || orderPayload.customer?.name || 'Valued Customer',
      customerEmail: orderPayload.customerEmail || orderPayload.customer?.email || 'customer@example.com',
      customerPhone: orderPayload.customerPhone || orderPayload.customer?.phone || '9492456210',
      status: 'PENDING',
      paymentMethod: orderPayload.paymentMethod || 'COD',
      paymentStatus: orderPayload.paymentMethod === 'COD' ? 'PENDING' : 'COMPLETED',
      items: (orderPayload.items || []).map((item: any, idx: number) => ({
        id: item.id || `item-${idx}`,
        productId: item.productId || item.product?.id || `prod-${idx}`,
        productName: item.name || item.product?.name || 'Mobile Accessory',
        productImage: item.image || item.product?.images?.[0]?.url || item.product?.imageUrl || '',
        price: Number(item.price || item.product?.price || 0),
        quantity: Number(item.quantity || 1),
        total: Number(item.price || item.product?.price || 0) * Number(item.quantity || 1),
        selectedColor: item.selectedColor,
      })),
      subtotal: Number(orderPayload.subtotal || 0),
      discountAmount: Number(orderPayload.discountAmount || orderPayload.discount || 0),
      shippingFee: Number(orderPayload.shippingFee || 0),
      totalAmount: Number(orderPayload.totalAmount || orderPayload.total || 0),
      shippingAddress: orderPayload.shippingAddress || {
        fullName: orderPayload.customerName || 'Customer',
        phone: orderPayload.customerPhone || '9492456210',
        street: 'Market Road, Opposite Current Office',
        city: 'Bhadrachalam',
        state: 'Telangana',
        pincode: '507111',
      },
      courierPartner: 'Radhika Express Delivery / DTDC',
      trackingNumber: `TRK-RMA-${Math.floor(10000000 + Math.random() * 90000000)}`,
      estimatedDelivery: new Date(Date.now() + 3 * 86400000).toISOString(),
      createdAt: now,
      updatedAt: now,
    };

    // Recalculate total if empty
    if (!order.totalAmount && order.items.length > 0) {
      order.subtotal = order.items.reduce((s, it) => s + it.total, 0);
      order.totalAmount = Math.max(0, order.subtotal - order.discountAmount + order.shippingFee);
    }

    // Save order in Firestore
    await setDoc(doc(db, 'orders', id), order);

    // Update product stock counts in Firestore
    for (const item of order.items) {
      try {
        const prodRef = doc(db, 'products', item.productId);
        const prodSnap = await getDoc(prodRef);
        if (prodSnap.exists()) {
          const currentProd = prodSnap.data() as Product;
          const newStock = Math.max(0, currentProd.stock - item.quantity);
          await updateDoc(prodRef, {
            stock: newStock,
            inStock: newStock > 0,
          });
        }
      } catch (stockErr) {
        console.warn('Error adjusting product stock after order:', stockErr);
      }
    }

    return order;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function getOrders(userId?: string): Promise<Order[]> {
  const path = 'orders';
  try {
    const ordersCol = collection(db, path);
    const currentUser = auth.currentUser;
    const isAdmin =
      currentUser?.email?.toLowerCase() === 'rk00614005@gmail.com' ||
      localStorage.getItem('radhika_admin_session') === 'true';

    let snap;
    if (userId || (!isAdmin && currentUser)) {
      const targetUid = userId || currentUser?.uid;
      const q = query(ordersCol, where('userId', '==', targetUid));
      snap = await getDocs(q);
    } else {
      snap = await getDocs(ordersCol);
    }

    const orders: Order[] = [];
    snap.forEach((d) => orders.push(d.data() as Order));

    // Sort by newest first
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return orders;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function trackOrder(orderNumber: string): Promise<Order> {
  const path = 'orders';
  try {
    const term = orderNumber.trim().toUpperCase();
    const snap = await getDocs(collection(db, path));
    let matched: Order | undefined;
    snap.forEach((d) => {
      const ord = d.data() as Order;
      if (ord.orderNumber.toUpperCase() === term || ord.id.toUpperCase() === term) {
        matched = ord;
      }
    });

    if (!matched) {
      throw new Error(`No order found matching "${orderNumber}". Please double-check the order ID.`);
    }
    return matched;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function updateOrderStatus(
  id: string,
  status: string,
  trackingNumber?: string
): Promise<Order> {
  const path = `orders/${id}`;
  try {
    const orderRef = doc(db, 'orders', id);
    const orderSnap = await getDoc(orderRef);
    if (!orderSnap.exists()) {
      throw new Error(`Order with ID ${id} not found`);
    }

    const current = orderSnap.data() as Order;
    const updates: Partial<Order> = {
      status: status as any,
      updatedAt: new Date().toISOString(),
    };
    if (trackingNumber) {
      updates.trackingNumber = trackingNumber;
    }

    const merged = { ...current, ...updates };
    await setDoc(orderRef, merged);
    return merged;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ==========================================
// REVIEWS
// ==========================================
export async function getReviewsForProduct(productId: string): Promise<Review[]> {
  const path = 'reviews';
  try {
    const snap = await getDocs(collection(db, path));
    const reviews: Review[] = [];
    snap.forEach((d) => {
      const rev = d.data() as Review;
      if (rev.productId === productId) {
        reviews.push(rev);
      }
    });

    return reviews.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function addReview(
  productId: string,
  reviewInput: { userName: string; rating: number; title: string; comment: string }
): Promise<Review> {
  const id = `rev-${Date.now()}`;
  const path = `reviews/${id}`;
  try {
    const review: Review = {
      id,
      productId,
      userName: reviewInput.userName || auth.currentUser?.displayName || 'Verified Buyer',
      rating: Number(reviewInput.rating) || 5,
      title: reviewInput.title || 'Verified Purchase Review',
      comment: reviewInput.comment || '',
      isVerifiedPurchase: true,
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'reviews', id), review);

    // Update product rating aggregate in Firestore
    try {
      const prodRef = doc(db, 'products', productId);
      const prodSnap = await getDoc(prodRef);
      if (prodSnap.exists()) {
        const prod = prodSnap.data() as Product;
        const currentCount = prod.reviewCount || 0;
        const currentRating = prod.rating || 5;
        const newCount = currentCount + 1;
        const newRating = Number(((currentRating * currentCount + review.rating) / newCount).toFixed(1));
        await updateDoc(prodRef, {
          rating: newRating,
          reviewCount: newCount,
        });
      }
    } catch (aggErr) {
      console.warn('Error updating aggregate review rating:', aggErr);
    }

    return review;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// ==========================================
// GALLERY
// ==========================================
export async function getGallery(category?: string): Promise<GalleryItem[]> {
  const path = 'gallery';
  try {
    await seedFirestoreIfEmpty();
    const snap = await getDocs(collection(db, path));
    let items: GalleryItem[] = [];
    snap.forEach((d) => items.push(d.data() as GalleryItem));

    if (items.length === 0) {
      items = INITIAL_GALLERY;
    }

    if (category) {
      items = items.filter((it) => it.category === category);
    }

    return items.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function addGalleryItem(itemData: Partial<GalleryItem>): Promise<GalleryItem> {
  const id = itemData.id || `gal-${Date.now()}`;
  const path = `gallery/${id}`;
  try {
    const item: GalleryItem = {
      id,
      title: itemData.title || 'Store Photo',
      description: itemData.description || 'Radhika Mobile Accessories Shop Display',
      category: itemData.category || 'STORE_INTERIOR',
      imageUrl: itemData.imageUrl || '',
      altText: itemData.altText || itemData.title,
      displayOrder: itemData.displayOrder || 99,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'gallery', id), item);
    return item;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateGalleryItem(id: string, updates: Partial<GalleryItem>): Promise<GalleryItem> {
  const path = `gallery/${id}`;
  try {
    const ref = doc(db, 'gallery', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      throw new Error(`Gallery photo with ID ${id} not found`);
    }
    const merged = { ...(snap.data() as GalleryItem), ...updates };
    await setDoc(ref, merged);
    return merged;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteGalleryItem(id: string): Promise<void> {
  const path = `gallery/${id}`;
  try {
    await deleteDoc(doc(db, 'gallery', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==========================================
// CONTACT MESSAGES
// ==========================================
export async function submitContact(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}): Promise<void> {
  const id = `msg-${Date.now()}`;
  const path = `contact_messages/${id}`;
  try {
    const message: ContactMessage = {
      id,
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      subject: data.subject || 'Customer Inquiry',
      message: data.message,
      createdAt: new Date().toISOString(),
      status: 'UNREAD',
    };
    await setDoc(doc(db, 'contact_messages', id), message);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  const path = 'contact_messages';
  try {
    const snap = await getDocs(collection(db, path));
    const messages: ContactMessage[] = [];
    snap.forEach((d) => messages.push(d.data() as ContactMessage));
    return messages.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// ==========================================
// ADMIN DASHBOARD ANALYTICS (REAL DATABASE STATS)
// ==========================================
export async function getAdminStats(): Promise<AdminStats> {
  try {
    const [products, orders, categories] = await Promise.all([
      getProducts(),
      getOrders(),
      getCategories(),
    ]);

    const totalRevenue = orders.reduce((sum, ord) => sum + (ord.totalAmount || 0), 0);
    const lowStockCount = products.filter((p) => p.stock <= 10).length;
    const pendingOrdersCount = orders.filter((o) => o.status === 'PENDING').length;

    // Build real sales data grouped by date
    const dateMap = new Map<string, { amount: number; orders: number }>();
    for (const ord of orders) {
      const dateKey = ord.createdAt.slice(0, 10);
      const curr = dateMap.get(dateKey) || { amount: 0, orders: 0 };
      curr.amount += ord.totalAmount || 0;
      curr.orders += 1;
      dateMap.set(dateKey, curr);
    }

    const salesData = Array.from(dateMap.entries())
      .slice(-7)
      .map(([date, val]) => ({
        date,
        amount: val.amount,
        orders: val.orders,
      }));

    // If fewer than 7 days, provide today
    if (salesData.length === 0) {
      salesData.push({
        date: new Date().toISOString().slice(0, 10),
        amount: totalRevenue,
        orders: orders.length,
      });
    }

    // Category distribution
    const categoryDistribution = categories.map((cat) => ({
      name: cat.name,
      count: products.filter((p) => p.categoryId === cat.id).length,
    }));

    return {
      totalRevenue,
      totalOrders: orders.length,
      totalProducts: products.length,
      lowStockCount,
      pendingOrdersCount,
      salesData,
      categoryDistribution,
    };
  } catch (error) {
    return {
      totalRevenue: 0,
      totalOrders: 0,
      totalProducts: 0,
      lowStockCount: 0,
      pendingOrdersCount: 0,
      salesData: [],
      categoryDistribution: [],
    };
  }
}
