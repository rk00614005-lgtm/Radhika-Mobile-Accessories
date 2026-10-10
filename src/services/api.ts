import {
  Product,
  Category,
  Order,
  Coupon,
  Review,
  ContactMessage,
  AdminStats,
  User,
  GalleryItem,
} from '../types/index.js';
import * as firestoreService from './firestoreService.js';
import { auth } from './firebase.js';

const API_BASE = '/api';

export const api = {
  // Categories (Cloud Firestore)
  async getCategories(): Promise<Category[]> {
    return await firestoreService.getCategories();
  },

  // Products (Cloud Firestore)
  async getProducts(params?: Record<string, any>): Promise<Product[]> {
    return await firestoreService.getProducts(params);
  },

  async getProductById(id: string): Promise<Product & { related: Product[]; reviews: Review[] }> {
    return await firestoreService.getProductById(id);
  },

  // Admin Product CRUD (Cloud Firestore)
  async addProduct(product: Partial<Product>): Promise<Product> {
    return await firestoreService.addProduct(product);
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    return await firestoreService.updateProduct(id, product);
  },

  async deleteProduct(id: string): Promise<void> {
    return await firestoreService.deleteProduct(id);
  },

  async resetSampleProducts(): Promise<void> {
    // Calls server reset route if needed, and re-syncs Firestore
    try {
      await fetch(`${API_BASE}/products/reset`, { method: 'POST' });
    } catch {}
    await firestoreService.seedFirestoreIfEmpty();
  },

  // Reviews (Cloud Firestore)
  async addReview(
    productId: string,
    review: { userName: string; rating: number; title: string; comment: string }
  ): Promise<Review> {
    return await firestoreService.addReview(productId, review);
  },

  async getReviewsForProduct(productId: string): Promise<Review[]> {
    return await firestoreService.getReviewsForProduct(productId);
  },

  // Coupons (Cloud Firestore)
  async validateCoupon(
    code: string,
    subtotal: number
  ): Promise<{ valid: boolean; discount: number; message: string; coupon?: Coupon }> {
    return await firestoreService.validateCoupon(code, subtotal);
  },

  async getCoupons(): Promise<Coupon[]> {
    return await firestoreService.getCoupons();
  },

  async addCoupon(coupon: Partial<Coupon>): Promise<Coupon> {
    return await firestoreService.addCoupon(coupon);
  },

  async deleteCoupon(id: string): Promise<void> {
    return await firestoreService.deleteCoupon(id);
  },

  // Orders (Cloud Firestore)
  async createOrder(orderData: any): Promise<Order> {
    return await firestoreService.createOrder(orderData);
  },

  async getOrders(userId?: string): Promise<Order[]> {
    return await firestoreService.getOrders(userId);
  },

  async trackOrder(orderNumber: string): Promise<Order> {
    return await firestoreService.trackOrder(orderNumber);
  },

  async updateOrderStatus(id: string, status: string, trackingNumber?: string): Promise<Order> {
    return await firestoreService.updateOrderStatus(id, status, trackingNumber);
  },

  // Gallery (Cloud Firestore)
  async getGallery(category?: string): Promise<GalleryItem[]> {
    return await firestoreService.getGallery(category);
  },

  async addGalleryItem(item: Partial<GalleryItem>): Promise<GalleryItem> {
    return await firestoreService.addGalleryItem(item);
  },

  async updateGalleryItem(id: string, item: Partial<GalleryItem>): Promise<GalleryItem> {
    return await firestoreService.updateGalleryItem(id, item);
  },

  async deleteGalleryItem(id: string): Promise<void> {
    return await firestoreService.deleteGalleryItem(id);
  },

  // Contact (Cloud Firestore)
  async submitContact(data: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }): Promise<void> {
    return await firestoreService.submitContact(data);
  },

  async getContactMessages(): Promise<ContactMessage[]> {
    return await firestoreService.getContactMessages();
  },

  // Admin Stats (Cloud Firestore Live Data)
  async getAdminStats(): Promise<AdminStats> {
    return await firestoreService.getAdminStats();
  },

  // Photo Upload API (Backend Express Multer with Magic Bytes verification & Cloudinary storage)
  async uploadImage(file: File, token?: string): Promise<{ url: string; filename: string; size: number; provider?: string; publicId?: string }> {
    const formData = new FormData();
    formData.append('photo', file);

    let idToken = token;
    if (!idToken && auth.currentUser) {
      try {
        idToken = await auth.currentUser.getIdToken();
      } catch {}
    }
    if (!idToken && typeof window !== 'undefined') {
      idToken = localStorage.getItem('radhika_token') || undefined;
    }

    const headers: Record<string, string> = idToken ? { Authorization: `Bearer ${idToken}` } : {};

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const json = await res.json();
    if (!json.success) {
      throw new Error(json.message || 'Image upload failed');
    }
    return json.data;
  },

  // Razorpay Gateway (Test Mode)
  async createRazorpayOrder(params: {
    items: any[];
    couponCode?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    amount?: number;
  }) {
    const res = await fetch(`${API_BASE}/razorpay/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to create Razorpay order');
    }
    return data;
  },

  async verifyRazorpayPayment(params: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature?: string;
  }) {
    const res = await fetch(`${API_BASE}/razorpay/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Payment signature verification failed');
    }
    return data;
  },
};
