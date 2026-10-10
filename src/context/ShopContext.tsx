import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, User, Coupon, Order } from '../types/index.js';
import { api } from '../services/api.js';
import {
  auth,
  db,
  googleProvider,
  testConnection,
} from '../services/firebase.js';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export type PageRoute =
  | 'home'
  | 'shop'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'account'
  | 'track'
  | 'about'
  | 'contact'
  | 'faq'
  | 'policies'
  | 'gallery'
  | 'admin';

interface ShopContextType {
  // Navigation
  currentPage: PageRoute;
  selectedProductId: string | null;
  selectedCategorySlug: string | null;
  trackOrderNumber: string;
  navigateTo: (page: PageRoute, params?: { productId?: string; category?: string; orderNumber?: string }) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedColor?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  freeShippingThreshold: number;

  // Coupons
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;

  // Wishlist
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;

  // Auth (Real Firebase Authentication)
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  authLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<boolean>;
  logout: () => void;
  loginDemoCustomer: () => void;
  loginDemoAdmin: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register';
  setAuthModalMode: (mode: 'login' | 'register') => void;

  // Toasts
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;

  // Quick order state after checkout
  lastCompletedOrder: Order | null;
  setLastCompletedOrder: (order: Order | null) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const ADMIN_EMAIL = 'rk00614005@gmail.com';

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation state
  const [currentPage, setCurrentPage] = useState<PageRoute>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [trackOrderNumber, setTrackOrderNumber] = useState<string>('');

  // Cart state persisted to localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('radhika_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Wishlist persisted
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('radhika_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Auth state managed by Firebase Authentication
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const freeShippingThreshold = 499;

  // Startup test connection to Firestore
  useEffect(() => {
    testConnection().catch((err) => console.warn('Connection check note:', err));
  }, []);

  // Listen to real Firebase Auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      setAuthLoading(true);
      if (fbUser) {
        try {
          const idToken = await fbUser.getIdToken();
          setToken(idToken);
          localStorage.setItem('radhika_token', idToken);

          // Determine admin role
          let role: 'ADMIN' | 'CUSTOMER' = 'CUSTOMER';
          const isEmailAdmin = fbUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

          if (isEmailAdmin) {
            role = 'ADMIN';
            // Auto-register in /admins/{uid} for Firestore rules verification
            try {
              await setDoc(doc(db, 'admins', fbUser.uid), {
                email: fbUser.email,
                role: 'ADMIN',
                addedAt: new Date().toISOString(),
              }, { merge: true });
            } catch (err) {
              console.warn('Admin doc sync note:', err);
            }
          } else {
            // Check /admins collection doc
            try {
              const adminSnap = await getDoc(doc(db, 'admins', fbUser.uid));
              if (adminSnap.exists()) {
                role = 'ADMIN';
              }
            } catch {}
          }

          const appUser: User = {
            id: fbUser.uid,
            name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Customer',
            email: fbUser.email || '',
            phone: fbUser.phoneNumber || undefined,
            role,
            createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
          };

          setUser(appUser);
          localStorage.setItem('radhika_user', JSON.stringify(appUser));
        } catch (e) {
          console.error('Error fetching token on auth state change:', e);
        }
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem('radhika_user');
        localStorage.removeItem('radhika_token');
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('radhika_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('radhika_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Toast handler
  const showToast = (message: string, type: ToastMessage['type'] = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Navigation helper
  const navigateTo = (
    page: PageRoute,
    params?: { productId?: string; category?: string; orderNumber?: string }
  ) => {
    setCurrentPage(page);
    if (params?.productId) setSelectedProductId(params.productId);
    if (params?.category !== undefined) setSelectedCategorySlug(params.category);
    if (params?.orderNumber) setTrackOrderNumber(params.orderNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1, selectedColor?: string) => {
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.product.id === product.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          quantity: next[idx].quantity + quantity,
          selectedColor: selectedColor || next[idx].selectedColor,
        };
        return next;
      }
      return [
        ...prev,
        {
          product,
          quantity,
          selectedColor: selectedColor || (product.colors && product.colors[0]),
        },
      ];
    });
    showToast(`Added "${product.name.slice(0, 32)}..." to your cart! 🛍️`, 'success');
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Item removed from cart', 'info');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Recalculate discount
  let discount = 0;
  if (appliedCoupon && subtotal > 0) {
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      discount = (subtotal * appliedCoupon.discountValue) / 100;
      if (appliedCoupon.maxDiscount && discount > appliedCoupon.maxDiscount) {
        discount = appliedCoupon.maxDiscount;
      }
    } else {
      discount = appliedCoupon.discountValue;
    }
    discount = Math.min(discount, subtotal);
  }

  const netSubtotal = Math.max(0, subtotal - discount);
  const shippingFee = cart.length === 0 ? 0 : netSubtotal >= freeShippingThreshold ? 0 : 49;
  const total = netSubtotal + shippingFee;

  // Coupon handling
  const applyCoupon = async (code: string): Promise<boolean> => {
    try {
      const result = await api.validateCoupon(code, subtotal);
      if (result.valid && result.coupon) {
        setAppliedCoupon(result.coupon);
        showToast(result.message, 'success');
        return true;
      } else {
        showToast(result.message || 'Invalid coupon code', 'error');
        return false;
      }
    } catch {
      showToast('Could not validate coupon. Please try again.', 'error');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed', 'info');
  };

  // Wishlist
  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        showToast(`Removed from wishlist`, 'info');
        return prev.filter((p) => p.id !== product.id);
      } else {
        showToast(`Added to your wishlist ❤️`, 'success');
        return [...prev, product];
      }
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((p) => p.id === productId);
  };

  // Firebase Authentication methods
  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      showToast(`Welcome, ${res.user.displayName || 'Friend'}! Signed in with Google 🎉`, 'success');
      setIsAuthModalOpen(false);
      return true;
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      showToast(err.message || 'Google Sign-In was cancelled or failed.', 'error');
      return false;
    }
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const res = await signInWithEmailAndPassword(auth, email.trim(), pass);
      showToast(`Welcome back, ${res.user.displayName || res.user.email}! 👋`, 'success');
      setIsAuthModalOpen(false);
      return true;
    } catch (err: any) {
      console.error('Login error:', err);
      let msg = err.message || 'Login failed';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        msg = 'Invalid email or password. You can also sign in instantly with Google!';
      } else if (err.code === 'auth/operation-not-allowed') {
        msg = 'Email/Password provider is disabled in Firebase Console. Please use "Sign in with Google" button below!';
      }
      showToast(msg, 'error');
      return false;
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<boolean> => {
    try {
      const res = await createUserWithEmailAndPassword(auth, data.email.trim(), data.password);
      if (data.name) {
        await updateProfile(res.user, { displayName: data.name });
      }

      // Save user profile in Firestore
      try {
        await setDoc(doc(db, 'users', res.user.uid), {
          id: res.user.uid,
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          role: 'CUSTOMER',
          createdAt: new Date().toISOString(),
        });
      } catch (docErr) {
        console.warn('Profile write note:', docErr);
      }

      showToast(`Account created! Welcome to Radhika Mobile Accessories 🎉`, 'success');
      setIsAuthModalOpen(false);
      return true;
    } catch (err: any) {
      console.error('Registration error:', err);
      let msg = err.message || 'Registration failed';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Please sign in instead.';
      } else if (err.code === 'auth/operation-not-allowed') {
        msg = 'Email registration is not enabled in Firebase project. Please use "Sign in with Google" button below!';
      }
      showToast(msg, 'error');
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {}
    setUser(null);
    setToken(null);
    localStorage.removeItem('radhika_user');
    localStorage.removeItem('radhika_token');
    showToast('You have been logged out safely.', 'info');
    if (currentPage === 'admin' || currentPage === 'account') {
      setCurrentPage('home');
    }
  };

  const loginDemoCustomer = () => {
    // Helpful guidance to sign in with Google or create an account
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
    showToast('Please click "Sign in with Google" or create an account to start shopping!', 'info');
  };

  const loginDemoAdmin = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
    showToast(`Store Admin Account: Sign in with the shop owner Google account (${ADMIN_EMAIL})`, 'info');
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <ShopContext.Provider
      value={{
        currentPage,
        selectedProductId,
        selectedCategorySlug,
        trackOrderNumber,
        navigateTo,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        subtotal,
        discount,
        shippingFee,
        total,
        freeShippingThreshold,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        wishlist,
        toggleWishlist,
        isInWishlist,
        user,
        token,
        isAdmin,
        authLoading,
        login,
        loginWithGoogle,
        register,
        logout,
        loginDemoCustomer,
        loginDemoAdmin,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        toasts,
        showToast,
        removeToast,
        lastCompletedOrder,
        setLastCompletedOrder,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
