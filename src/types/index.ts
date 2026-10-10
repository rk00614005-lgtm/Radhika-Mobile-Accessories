export type Role = 'CUSTOMER' | 'ADMIN';

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export type PaymentMethod = 'RAZORPAY' | 'COD' | 'UPI';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export type DiscountType = 'PERCENTAGE' | 'FIXED';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  imageUrl: string;
  displayOrder: number;
  productCount?: number;
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  isPrimary?: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  brand: string;
  compatibility?: string;
  stock: number;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  sku: string;
  tags: string[];
  categoryId: string;
  categoryName?: string;
  images: ProductImage[];
  specifications: Record<string, string>;
  colors?: string[];
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: Role;
  avatarUrl?: string;
  createdAt: string;
}

export interface Address {
  fullName: string;
  phone: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  total: number;
  selectedColor?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  couponCode?: string;
  shippingAddress: Address;
  courierPartner: string;
  trackingNumber: string;
  estimatedDelivery: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  expiresAt?: string;
  isActive: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'UNREAD' | 'REPLIED';
}

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  lowStockCount: number;
  pendingOrdersCount: number;
  salesData: { date: string; amount: number; orders: number }[];
  categoryDistribution: { name: string; count: number }[];
}

export type GalleryCategory =
  | 'STORE_INTERIOR'
  | 'ACCESSORIES_DISPLAY'
  | 'SHOWROOM_FRONT'
  | 'SERVICE_DESK'
  | 'GADGETS_WALL';

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  category: GalleryCategory;
  imageUrl: string;
  altText?: string;
  displayOrder?: number;
  createdAt: string;
}
