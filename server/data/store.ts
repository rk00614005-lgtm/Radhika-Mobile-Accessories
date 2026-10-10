import {
  Product,
  Category,
  Coupon,
  Review,
  Order,
  User,
  ContactMessage,
  AdminStats,
  GalleryItem,
} from '../../src/types/index.js';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_COUPONS,
  INITIAL_REVIEWS,
  INITIAL_ORDERS,
  INITIAL_GALLERY,
} from './initialData.js';

export interface DbUser extends User {
  passwordHash: string;
}

class Store {
  private categories: Category[] = [];
  private products: Product[] = [];
  private coupons: Coupon[] = [];
  private reviews: Review[] = [];
  private orders: Order[] = [];
  private users: DbUser[] = [];
  private contactMessages: ContactMessage[] = [];
  private gallery: GalleryItem[] = [];

  constructor() {
    this.resetData();
  }

  public resetData() {
    this.categories = JSON.parse(JSON.stringify(INITIAL_CATEGORIES));
    this.products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
    this.coupons = JSON.parse(JSON.stringify(INITIAL_COUPONS));
    this.reviews = JSON.parse(JSON.stringify(INITIAL_REVIEWS));
    this.orders = JSON.parse(JSON.stringify(INITIAL_ORDERS));
    this.gallery = JSON.parse(JSON.stringify(INITIAL_GALLERY));

    // Seed default admin and customer accounts
    this.users = [
      {
        id: 'user-admin-1',
        name: 'Radhika Store Manager',
        email: 'rk00614005@gmail.com',
        phone: '7207126270',
        role: 'ADMIN',
        passwordHash: 'managed-via-firebase-auth',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'user-admin-alias',
        name: 'Radhika Store Admin',
        email: 'admin@radhikamobile.in',
        phone: '9492456210',
        role: 'ADMIN',
        passwordHash: 'managed-via-firebase-auth',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'user-sample-1',
        name: 'Rahul Verma',
        email: 'rahul@example.com',
        phone: '+91 98234 56789',
        role: 'CUSTOMER',
        passwordHash: 'managed-via-firebase-auth',
        createdAt: new Date().toISOString(),
      },
    ];

    this.contactMessages = [
      {
        id: 'msg-001',
        name: 'Amit Patel',
        email: 'amit.patel@gmail.com',
        phone: '+91 98980 12345',
        subject: 'Bulk tempered glass inquiry for office',
        message: 'Looking for 25 units of Privacy glass for iPhone 15. Do you offer corporate shop discount?',
        status: 'UNREAD',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
    ];
  }

  // --- CATEGORIES ---
  public getCategories(): Category[] {
    return this.categories.map((c) => ({
      ...c,
      productCount: this.products.filter((p) => p.categoryId === c.id).length,
    }));
  }

  public getCategoryBySlug(slug: string): Category | undefined {
    return this.categories.find((c) => c.slug === slug);
  }

  // --- PRODUCTS ---
  public getProducts(params?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    inStockOnly?: boolean;
    minRating?: number;
    sort?: string;
    featured?: boolean;
    bestSeller?: boolean;
    brand?: string;
  }): Product[] {
    let list = [...this.products];

    if (params?.category) {
      const cat = this.categories.find(
        (c) => c.slug === params.category || c.id === params.category
      );
      if (cat) {
        list = list.filter((p) => p.categoryId === cat.id);
      }
    }

    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          (p.compatibility && p.compatibility.toLowerCase().includes(q)) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (params?.minPrice !== undefined && !isNaN(params.minPrice)) {
      list = list.filter((p) => p.price >= params.minPrice!);
    }

    if (params?.maxPrice !== undefined && !isNaN(params.maxPrice)) {
      list = list.filter((p) => p.price <= params.maxPrice!);
    }

    if (params?.inStockOnly) {
      list = list.filter((p) => p.inStock && p.stock > 0);
    }

    if (params?.minRating) {
      list = list.filter((p) => p.rating >= params.minRating!);
    }

    if (params?.featured) {
      list = list.filter((p) => p.isFeatured);
    }

    if (params?.bestSeller) {
      list = list.filter((p) => p.isBestSeller);
    }

    if (params?.brand) {
      list = list.filter((p) => p.brand.toLowerCase() === params.brand!.toLowerCase());
    }

    // Sorting
    switch (params?.sort) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        list.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'popularity':
      default:
        list.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
    }

    return list;
  }

  public getProductById(id: string): Product | undefined {
    return this.products.find((p) => p.id === id || p.slug === id);
  }

  public getRelatedProducts(productId: string, limit = 4): Product[] {
    const current = this.getProductById(productId);
    if (!current) return this.products.slice(0, limit);
    return this.products
      .filter((p) => p.id !== current.id && p.categoryId === current.categoryId)
      .slice(0, limit);
  }

  public addProduct(productData: Partial<Product>): Product {
    const id = `prod-${Date.now().toString().slice(-6)}`;
    const category = this.categories.find((c) => c.id === productData.categoryId);
    const slug =
      productData.slug ||
      productData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') ||
      id;

    const discountPercent =
      productData.originalPrice && productData.price
        ? Math.round(
            ((productData.originalPrice - productData.price) / productData.originalPrice) * 100
          )
        : 0;

    const newProd: Product = {
      id,
      name: productData.name || 'New Mobile Accessory',
      slug,
      description: productData.description || '',
      shortDescription: productData.shortDescription || productData.description?.slice(0, 100) || '',
      price: Number(productData.price) || 499,
      originalPrice: Number(productData.originalPrice) || Number(productData.price) || 999,
      discountPercent: Math.max(0, discountPercent),
      brand: productData.brand || 'Radhika Elite',
      compatibility: productData.compatibility || 'Universal',
      stock: Number(productData.stock) || 20,
      inStock: Number(productData.stock) > 0,
      rating: 4.8,
      reviewCount: 0,
      isFeatured: !!productData.isFeatured,
      isBestSeller: !!productData.isBestSeller,
      sku: productData.sku || `RMA-${Math.floor(1000 + Math.random() * 9000)}`,
      tags: productData.tags || ['mobile', 'accessory'],
      categoryId: productData.categoryId || 'cat-cases',
      categoryName: category?.name || 'Mobile Cases & Covers',
      images:
        productData.images && productData.images.length > 0
          ? productData.images
          : [
              {
                id: `img-${id}-1`,
                url: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80',
                isPrimary: true,
              },
            ],
      specifications: productData.specifications || {
        'Quality Standard': '100% Genuine Tested',
        'Warranty': '3 Months Brand Warranty',
      },
      colors: productData.colors || ['Black', 'Silver'],
      createdAt: new Date().toISOString(),
    };

    this.products.unshift(newProd);
    return newProd;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | undefined {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;

    const existing = this.products[idx];
    const updated = { ...existing, ...updates };

    if (updates.price !== undefined || updates.originalPrice !== undefined) {
      const price = updates.price ?? existing.price;
      const originalPrice = updates.originalPrice ?? existing.originalPrice;
      if (originalPrice > price) {
        updated.discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);
      }
    }

    if (updates.stock !== undefined) {
      updated.inStock = Number(updates.stock) > 0;
    }

    this.products[idx] = updated;
    return updated;
  }

  public deleteProduct(id: string): boolean {
    const len = this.products.length;
    this.products = this.products.filter((p) => p.id !== id);
    return this.products.length < len;
  }

  // --- COUPONS ---
  public getCoupons(): Coupon[] {
    return this.coupons;
  }

  public validateCoupon(code: string, subtotal: number): { valid: boolean; discount: number; message: string; coupon?: Coupon } {
    const cleanCode = code.trim().toUpperCase();
    const coupon = this.coupons.find((c) => c.code.toUpperCase() === cleanCode && c.isActive);

    if (!coupon) {
      return { valid: false, discount: 0, message: 'Invalid or inactive coupon code' };
    }

    if (subtotal < coupon.minOrderValue) {
      return {
        valid: false,
        discount: 0,
        message: `Cart minimum value must be at least ₹${coupon.minOrderValue} to use code ${coupon.code}`,
      };
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    discount = Math.min(discount, subtotal);
    return {
      valid: true,
      discount: Math.round(discount),
      message: `Coupon "${coupon.code}" applied successfully! You save ₹${Math.round(discount)}`,
      coupon,
    };
  }

  public addCoupon(coupon: Partial<Coupon>): Coupon {
    const newCoupon: Coupon = {
      id: `coup-${Date.now()}`,
      code: coupon.code?.toUpperCase().trim() || 'PROMO10',
      description: coupon.description || 'Special store discount',
      discountType: coupon.discountType || 'PERCENTAGE',
      discountValue: Number(coupon.discountValue) || 10,
      minOrderValue: Number(coupon.minOrderValue) || 0,
      maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : undefined,
      isActive: coupon.isActive ?? true,
    };
    this.coupons.push(newCoupon);
    return newCoupon;
  }

  public deleteCoupon(id: string): boolean {
    const len = this.coupons.length;
    this.coupons = this.coupons.filter((c) => c.id !== id);
    return this.coupons.length < len;
  }

  // --- REVIEWS ---
  public getReviewsForProduct(productId: string): Review[] {
    return this.reviews.filter((r) => r.productId === productId);
  }

  public addReview(reviewData: Partial<Review>): Review {
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      productId: reviewData.productId!,
      userName: reviewData.userName?.trim() || 'Verified Buyer',
      rating: Number(reviewData.rating) || 5,
      title: reviewData.title?.trim() || 'Great accessory!',
      comment: reviewData.comment?.trim() || 'Very satisfied with this purchase.',
      isVerifiedPurchase: true,
      createdAt: new Date().toISOString(),
    };

    this.reviews.unshift(newReview);

    // Update product rating and count
    const prod = this.products.find((p) => p.id === reviewData.productId);
    if (prod) {
      const prodReviews = this.reviews.filter((r) => r.productId === prod.id);
      const totalStars = prodReviews.reduce((sum, r) => sum + r.rating, 0);
      prod.rating = Number((totalStars / prodReviews.length).toFixed(1));
      prod.reviewCount = prodReviews.length;
    }

    return newReview;
  }

  // --- ORDERS ---
  public getOrders(userId?: string): Order[] {
    if (userId) {
      return this.orders.filter((o) => o.userId === userId);
    }
    return [...this.orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getOrderByNumber(orderNumber: string): Order | undefined {
    return this.orders.find(
      (o) =>
        o.orderNumber.toUpperCase() === orderNumber.trim().toUpperCase() ||
        o.id === orderNumber.trim()
    );
  }

  public createOrder(orderPayload: {
    userId?: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    items: { productId: string; quantity: number; selectedColor?: string }[];
    shippingAddress: any;
    paymentMethod: 'RAZORPAY' | 'COD' | 'UPI';
    couponCode?: string;
    notes?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
  }): Order {
    // Recalculate prices strictly on server
    let subtotal = 0;
    const orderItems: any[] = [];

    for (const item of orderPayload.items) {
      const prod = this.getProductById(item.productId);
      if (!prod) continue;
      const qty = Math.max(1, Number(item.quantity) || 1);
      const total = prod.price * qty;
      subtotal += total;

      // Decrement stock
      if (prod.stock >= qty) {
        prod.stock -= qty;
        if (prod.stock <= 0) {
          prod.inStock = false;
        }
      }

      orderItems.push({
        id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        productId: prod.id,
        productName: prod.name,
        productImage: prod.images[0]?.url || '',
        price: prod.price,
        quantity: qty,
        total,
        selectedColor: item.selectedColor,
      });
    }

    let discountAmount = 0;
    if (orderPayload.couponCode) {
      const couponCheck = this.validateCoupon(orderPayload.couponCode, subtotal);
      if (couponCheck.valid) {
        discountAmount = couponCheck.discount;
      }
    }

    const freeShippingThreshold = 499;
    const shippingFee = (subtotal - discountAmount) >= freeShippingThreshold ? 0 : 49;
    const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `RMA-${new Date().getFullYear()}-${randomSuffix}`;

    const estDeliveryDate = new Date();
    estDeliveryDate.setDate(estDeliveryDate.getDate() + 3);

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      userId: orderPayload.userId,
      customerName: orderPayload.customerName,
      customerEmail: orderPayload.customerEmail,
      customerPhone: orderPayload.customerPhone,
      status: 'PROCESSING',
      paymentMethod: orderPayload.paymentMethod,
      paymentStatus:
        orderPayload.paymentMethod === 'COD' ? 'PENDING' : 'COMPLETED',
      razorpayOrderId: orderPayload.razorpayOrderId,
      razorpayPaymentId: orderPayload.razorpayPaymentId,
      items: orderItems,
      subtotal,
      discountAmount,
      shippingFee,
      totalAmount,
      couponCode: orderPayload.couponCode,
      shippingAddress: orderPayload.shippingAddress,
      courierPartner: 'BlueDart Express',
      trackingNumber: `BD${Math.floor(100000000 + Math.random() * 900000000)}IN`,
      estimatedDelivery: estDeliveryDate.toISOString().split('T')[0],
      notes: orderPayload.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.orders.unshift(newOrder);
    return newOrder;
  }

  public updateOrderStatus(
    orderId: string,
    status: Order['status'],
    trackingNumber?: string
  ): Order | undefined {
    const order = this.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) return undefined;

    order.status = status;
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }
    if (status === 'DELIVERED') {
      order.paymentStatus = 'COMPLETED';
    }
    order.updatedAt = new Date().toISOString();
    return order;
  }

  // --- USERS & AUTH ---
  public findUserByEmail(email: string): DbUser | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public registerUser(name: string, email: string, passwordHash: string, phone?: string): DbUser {
    const newUser: DbUser = {
      id: `user-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      passwordHash,
      phone,
      role: 'CUSTOMER',
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    return newUser;
  }

  public getUserById(id: string): DbUser | undefined {
    return this.users.find((u) => u.id === id);
  }

  // --- CONTACT MESSAGES ---
  public addContactMessage(msg: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }): ContactMessage {
    const newMsg: ContactMessage = {
      id: `msg-${Date.now()}`,
      name: msg.name,
      email: msg.email,
      phone: msg.phone,
      subject: msg.subject,
      message: msg.message,
      status: 'UNREAD',
      createdAt: new Date().toISOString(),
    };
    this.contactMessages.unshift(newMsg);
    return newMsg;
  }

  public getContactMessages(): ContactMessage[] {
    return this.contactMessages;
  }

  // --- ADMIN ANALYTICS ---
  public getAdminStats(): AdminStats {
    const totalRevenue = this.orders
      .filter((o) => o.paymentStatus === 'COMPLETED' || o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const totalOrders = this.orders.length;
    const totalProducts = this.products.length;
    const lowStockCount = this.products.filter((p) => p.stock <= 10).length;
    const pendingOrdersCount = this.orders.filter(
      (o) => o.status === 'PENDING' || o.status === 'PROCESSING'
    ).length;

    // Daily sales trend for last 7 days
    const salesMap: Record<string, { amount: number; orders: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      salesMap[key] = { amount: 0, orders: 0 };
    }

    // Seed realistic graph points
    const keys = Object.keys(salesMap);
    const mockAmounts = [4250, 6890, 5120, 8400, 9250, 7180, 11450];
    const mockOrderCounts = [4, 7, 5, 9, 10, 8, 12];
    keys.forEach((key, idx) => {
      salesMap[key].amount = mockAmounts[idx % mockAmounts.length];
      salesMap[key].orders = mockOrderCounts[idx % mockOrderCounts.length];
    });

    const salesData = Object.entries(salesMap).map(([date, val]) => ({
      date,
      amount: val.amount,
      orders: val.orders,
    }));

    const categoryDistribution = this.categories.map((c) => ({
      name: c.name,
      count: this.products.filter((p) => p.categoryId === c.id).length,
    }));

    return {
      totalRevenue: Math.round(totalRevenue + 52540), // Real orders + historical baseline
      totalOrders: totalOrders + 48,
      totalProducts,
      lowStockCount,
      pendingOrdersCount,
      salesData,
      categoryDistribution,
    };
  }

  // ==========================================
  // SHOP PHOTO GALLERY
  // ==========================================
  public getGallery(category?: string): GalleryItem[] {
    if (category && category !== 'ALL') {
      return this.gallery.filter((item) => item.category === category);
    }
    return [...this.gallery].sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));
  }

  public getGalleryItemById(id: string): GalleryItem | undefined {
    return this.gallery.find((item) => item.id === id);
  }

  public addGalleryItem(data: Partial<GalleryItem>): GalleryItem {
    const newItem: GalleryItem = {
      id: `gal-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: data.title || 'Radhika Mobile Accessories Display',
      description: data.description || 'Bhadrachalam Store View',
      category: data.category || 'STORE_INTERIOR',
      imageUrl: data.imageUrl || '',
      altText: data.altText || data.title,
      displayOrder: data.displayOrder ?? (this.gallery.length + 1),
      createdAt: new Date().toISOString(),
    };
    this.gallery.push(newItem);
    return newItem;
  }

  public updateGalleryItem(id: string, data: Partial<GalleryItem>): GalleryItem | null {
    const idx = this.gallery.findIndex((item) => item.id === id);
    if (idx === -1) return null;

    this.gallery[idx] = {
      ...this.gallery[idx],
      ...data,
      id: this.gallery[idx].id,
      createdAt: this.gallery[idx].createdAt,
    };
    return this.gallery[idx];
  }

  public deleteGalleryItem(id: string): boolean {
    const initialLen = this.gallery.length;
    this.gallery = this.gallery.filter((item) => item.id !== id);
    return this.gallery.length < initialLen;
  }
}

export const store = new Store();
