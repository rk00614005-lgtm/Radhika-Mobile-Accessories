import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext.js';
import { api } from '../services/api.js';
import {
  Product,
  Order,
  Coupon,
  ContactMessage,
  AdminStats,
  Category,
  GalleryItem,
  GalleryCategory,
  ProductImage,
} from '../types/index.js';
import { ImageUploader } from '../components/ImageUploader.js';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Ticket,
  Mail,
  RotateCcw,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Users,
  Eye,
  Check,
  X,
  ShieldCheck,
  Lock,
  Camera,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Layers,
  Star,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user, isAdmin, loginWithGoogle, setIsAuthModalOpen, showToast, navigateTo } = useShop();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'gallery' | 'coupons' | 'messages'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Gallery search & filter
  const [gallerySearch, setGallerySearch] = useState('');
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState('ALL');

  // Gallery Add / Edit Modal
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);
  const [galleryFormTitle, setGalleryFormTitle] = useState('');
  const [galleryFormCategory, setGalleryFormCategory] = useState<GalleryCategory>('STORE_INTERIOR');
  const [galleryFormDescription, setGalleryFormDescription] = useState('');
  const [galleryFormImageUrl, setGalleryFormImageUrl] = useState('');
  const [galleryFormOrder, setGalleryFormOrder] = useState(1);

  // Search in admin tables
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');

  // Product Add / Edit Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodFormName, setProdFormName] = useState('');
  const [prodFormCategory, setProdFormCategory] = useState('cat-cases');
  const [prodFormPrice, setProdFormPrice] = useState(499);
  const [prodFormOriginalPrice, setProdFormOriginalPrice] = useState(999);
  const [prodFormStock, setProdFormStock] = useState(50);
  const [prodFormBrand, setProdFormBrand] = useState('Radhika Elite');
  const [prodFormDesc, setProdFormDesc] = useState('');
  const [prodImages, setProdImages] = useState<ProductImage[]>([]);
  const [prodFormCompatibility, setProdFormCompatibility] = useState('Universal');

  // Coupon Add Modal
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState(10);
  const [newCouponMinOrder, setNewCouponMinOrder] = useState(499);
  const [newCouponType, setNewCouponType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [sData, pData, oData, cData, mData, catData, gData] = await Promise.all([
        api.getAdminStats(),
        api.getProducts(),
        api.getOrders(),
        api.getCoupons(),
        api.getContactMessages(),
        api.getCategories(),
        api.getGallery(),
      ]);
      setStats(sData);
      setProducts(pData);
      setOrders(oData);
      setCoupons(cData);
      setMessages(mData);
      setCategories(catData);
      setGalleryItems(gData);
    } catch (e) {
      console.error('Failed to load admin dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAllAdminData();
    }
  }, [isAdmin]);

  // Auth Guard
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-purple-950 text-purple-300 flex items-center justify-center mx-auto shadow-xl">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-900">Protected Admin Area</h2>
          <p className="text-xs text-slate-500">
            This management console requires store administrator credentials.
          </p>
        </div>
        <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 text-left space-y-3">
          <p className="text-xs text-purple-900 font-bold">
            💡 Store Owner Access via Firebase Authentication:
          </p>
          <button
            onClick={() => loginWithGoogle()}
            className="w-full py-3 bg-purple-950 hover:bg-purple-900 text-white font-black text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-purple-300" />
            <span>Sign in with Google (rk00614005@gmail.com)</span>
          </button>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full py-2 bg-white hover:bg-slate-50 border border-purple-200 text-purple-900 font-bold text-xs rounded-xl transition-colors"
          >
            Sign in with Email / Password
          </button>
        </div>
        <button
          onClick={() => navigateTo('home')}
          className="text-xs text-slate-500 hover:text-slate-800 underline"
        >
          Return to Customer Storefront
        </button>
      </div>
    );
  }

  // Product Photo Helpers
  const handleAddProductPhoto = (url: string) => {
    if (!url) return;
    const newImg: ProductImage = {
      id: `img-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      url,
      isPrimary: prodImages.length === 0,
    };
    setProdImages((prev) => [...prev, newImg]);
    showToast('Photo added to product images list', 'success');
  };

  const handleSetPrimaryPhoto = (index: number) => {
    setProdImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    );
    showToast('Cover photo updated', 'info');
  };

  const handleRemoveProductPhoto = (index: number) => {
    setProdImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
    showToast('Photo removed from product', 'info');
  };

  // Handle Product Save (Add or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Partial<Product> = {
        name: prodFormName,
        categoryId: prodFormCategory,
        price: Number(prodFormPrice),
        originalPrice: Number(prodFormOriginalPrice),
        stock: Number(prodFormStock),
        brand: prodFormBrand,
        description: prodFormDesc,
        compatibility: prodFormCompatibility,
        images: prodImages.length > 0 ? prodImages : undefined,
      };

      if (editingProductId) {
        await api.updateProduct(editingProductId, payload);
        showToast('Product updated successfully with photos', 'success');
      } else {
        await api.addProduct(payload);
        showToast('New accessory added to store catalog with photos', 'success');
      }
      setIsProductModalOpen(false);
      setEditingProductId(null);
      loadAllAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save product', 'error');
    }
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProductId(p.id);
    setProdFormName(p.name);
    setProdFormCategory(p.categoryId);
    setProdFormPrice(p.price);
    setProdFormOriginalPrice(p.originalPrice);
    setProdFormStock(p.stock);
    setProdFormBrand(p.brand);
    setProdFormDesc(p.description);
    setProdImages(
      p.images && p.images.length > 0
        ? p.images.map((img, i) => ({ ...img, isPrimary: i === 0 || img.isPrimary }))
        : [
            {
              id: `img-${p.id}-1`,
              url: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80',
              isPrimary: true,
            },
          ]
    );
    setProdFormCompatibility(p.compatibility || '');
    setIsProductModalOpen(true);
  };

  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProdFormName('');
    setProdFormCategory('cat-cases');
    setProdFormPrice(499);
    setProdFormOriginalPrice(999);
    setProdFormStock(50);
    setProdFormBrand('Radhika Elite');
    setProdFormDesc('');
    setProdImages([
      {
        id: `img-${Date.now()}`,
        url: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80',
        isPrimary: true,
      },
    ]);
    setProdFormCompatibility('Universal');
    setIsProductModalOpen(true);
  };

  // Gallery Management Handlers
  const handleOpenAddGallery = () => {
    setEditingGalleryId(null);
    setGalleryFormTitle('');
    setGalleryFormCategory('STORE_INTERIOR');
    setGalleryFormDescription('');
    setGalleryFormImageUrl('');
    setGalleryFormOrder(galleryItems.length + 1);
    setIsGalleryModalOpen(true);
  };

  const handleOpenEditGallery = (item: GalleryItem) => {
    setEditingGalleryId(item.id);
    setGalleryFormTitle(item.title);
    setGalleryFormCategory(item.category);
    setGalleryFormDescription(item.description);
    setGalleryFormImageUrl(item.imageUrl);
    setGalleryFormOrder(item.displayOrder || 1);
    setIsGalleryModalOpen(true);
  };

  const handleSaveGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryFormImageUrl) {
      showToast('Please upload or provide a photo for the gallery', 'error');
      return;
    }
    try {
      if (editingGalleryId) {
        await api.updateGalleryItem(editingGalleryId, {
          title: galleryFormTitle,
          category: galleryFormCategory,
          description: galleryFormDescription,
          imageUrl: galleryFormImageUrl,
          displayOrder: Number(galleryFormOrder),
        });
        showToast('Gallery photo updated successfully', 'success');
      } else {
        await api.addGalleryItem({
          title: galleryFormTitle,
          category: galleryFormCategory,
          description: galleryFormDescription,
          imageUrl: galleryFormImageUrl,
          displayOrder: Number(galleryFormOrder),
        });
        showToast('New store photo added to gallery', 'success');
      }
      setIsGalleryModalOpen(false);
      loadAllAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save gallery photo', 'error');
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (confirm('Are you sure you want to delete this photo from the store gallery?')) {
      try {
        await api.deleteGalleryItem(id);
        showToast('Photo removed from store gallery', 'info');
        loadAllAdminData();
      } catch (err: any) {
        showToast(err.message || 'Failed to delete photo', 'error');
      }
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product from catalog?')) {
      try {
        await api.deleteProduct(id);
        showToast('Product deleted from inventory', 'info');
        loadAllAdminData();
      } catch (err: any) {
        showToast(err.message || 'Failed to delete product', 'error');
      }
    }
  };

  const handleResetCatalog = async () => {
    if (confirm('Reset store inventory to initial realistic factory sample catalog?')) {
      try {
        await api.resetSampleProducts();
        showToast('Catalog restored to default factory sample data', 'success');
        loadAllAdminData();
      } catch (err: any) {
        showToast(err.message || 'Failed to reset catalog', 'error');
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.updateOrderStatus(orderId, status);
      showToast(`Order status updated to ${status}`, 'success');
      loadAllAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update order status', 'error');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addCoupon({
        code: newCouponCode.trim().toUpperCase(),
        discountType: newCouponType,
        discountValue: Number(newCouponDiscount),
        minOrderValue: Number(newCouponMinOrder),
        isActive: true,
      });
      showToast(`Coupon ${newCouponCode} created!`, 'success');
      setIsCouponModalOpen(false);
      setNewCouponCode('');
      loadAllAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create coupon', 'error');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      await api.deleteCoupon(id);
      showToast('Coupon deleted', 'info');
      loadAllAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete coupon', 'error');
    }
  };

  // Filtered lists
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerPhone.includes(orderSearch);
    const matchesStatus = orderStatusFilter === 'ALL' || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Admin Header */}
      <div className="bg-slate-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-black tracking-widest bg-purple-500/30 text-purple-300 px-2.5 py-0.5 rounded-full">
              👑 STORE MANAGEMENT CONSOLE
            </span>
            <span className="text-xs text-slate-400">Radhika Mobile Accessories</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Admin Dashboard</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time sales analytics, inventory control, orders dispatch, &amp; store settings
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleResetCatalog}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
            title="Restore sample product inventory"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Factory Catalog</span>
          </button>

          <button
            onClick={handleOpenAddProduct}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            activeTab === 'overview'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Overview &amp; Sales</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            activeTab === 'products'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Products ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            activeTab === 'orders'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            activeTab === 'gallery'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Shop Gallery ({galleryItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            activeTab === 'coupons'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>Coupons &amp; Offers</span>
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            activeTab === 'messages'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Inquiries ({messages.length})</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* KPI Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Total Sales</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900">
                ₹{(stats?.totalRevenue || 52540).toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] text-emerald-600 font-bold block">
                +18.4% from last week
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
                <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-700 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900">
                {stats?.totalOrders || orders.length}
              </p>
              <span className="text-[10px] text-purple-600 font-bold block">
                {stats?.pendingOrdersCount || 3} orders pending dispatch
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Active Inventory</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900">
                {products.length} Products
              </p>
              <span className="text-[10px] text-slate-500 font-medium block">
                Across 11 categories
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Low Stock Alerts</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-amber-600">
                {stats?.lowStockCount || products.filter((p) => p.stock <= 10).length}
              </p>
              <span className="text-[10px] text-amber-700 font-bold block">
                Items need restock
              </span>
            </div>
          </div>

          {/* Interactive Sales Chart */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">7-Day Sales Trend (₹ INR)</h2>
                <p className="text-xs text-slate-400">Daily revenue across online and in-store channels</p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                Live Data
              </span>
            </div>

            {/* SVG Visual Bar Chart */}
            <div className="h-48 flex items-end justify-between gap-3 pt-6 border-b border-slate-100">
              {stats?.salesData?.map((pt) => {
                const maxAmount = 12000;
                const barHeight = Math.max(15, Math.round((pt.amount / maxAmount) * 100));

                return (
                  <div key={pt.date} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-purple-700 bg-purple-50 px-1 rounded">
                      ₹{pt.amount}
                    </div>
                    <div
                      style={{ height: `${barHeight}%` }}
                      className="w-full bg-gradient-to-t from-purple-600 to-pink-500 rounded-xl group-hover:brightness-110 transition-all shadow-sm"
                    />
                    <span className="text-[10px] font-bold text-slate-500 tracking-tight">
                      {pt.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS CRUD */}
      {activeTab === 'products' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products by title, SKU, or brand..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                onClick={handleOpenAddProduct}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px]">
                    <th className="pb-3 font-bold">Product</th>
                    <th className="pb-3 font-bold">Category</th>
                    <th className="pb-3 font-bold">Price</th>
                    <th className="pb-3 font-bold">Stock</th>
                    <th className="pb-3 font-bold">Status</th>
                    <th className="pb-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70">
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images[0]?.url}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block line-clamp-1 max-w-xs">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              SKU: {p.sku} • {p.brand}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-slate-600">{p.categoryName}</td>
                      <td className="py-3">
                        <span className="font-bold text-slate-900">
                          ₹{p.price.toLocaleString('en-IN')}
                        </span>
                        {p.originalPrice > p.price && (
                          <span className="block text-[10px] text-slate-400 line-through">
                            ₹{p.originalPrice}
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        <span
                          className={`font-bold ${
                            p.stock <= 5 ? 'text-amber-600' : 'text-slate-800'
                          }`}
                        >
                          {p.stock} units
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            p.inStock
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {p.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditProduct(p)}
                            className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search by Order ID, customer name or phone..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-bold">Filter Status:</span>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px]">
                    <th className="pb-3 font-bold">Order ID</th>
                    <th className="pb-3 font-bold">Customer Details</th>
                    <th className="pb-3 font-bold">Items</th>
                    <th className="pb-3 font-bold">Total</th>
                    <th className="pb-3 font-bold">Payment</th>
                    <th className="pb-3 font-bold">Current Status</th>
                    <th className="pb-3 font-bold text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/70">
                      <td className="py-3 font-mono font-bold text-slate-900">
                        {ord.orderNumber}
                      </td>
                      <td className="py-3">
                        <span className="font-bold text-slate-800 block">{ord.customerName}</span>
                        <span className="text-[10px] text-slate-400 block">{ord.customerPhone}</span>
                        <span className="text-[10px] text-slate-400 truncate block max-w-xs">
                          {ord.shippingAddress.city}, {ord.shippingAddress.pincode}
                        </span>
                      </td>
                      <td className="py-3 text-slate-600">
                        {ord.items.length} items
                        <span className="text-[10px] text-slate-400 block truncate max-w-[150px]">
                          {ord.items[0]?.productName}
                        </span>
                      </td>
                      <td className="py-3 font-black text-slate-900">
                        ₹{ord.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3">
                        <span className="font-bold text-slate-700 block">{ord.paymentMethod}</span>
                        <span
                          className={`text-[9px] font-bold ${
                            ord.paymentStatus === 'COMPLETED' ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          {ord.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            ord.status === 'DELIVERED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.status === 'SHIPPED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <select
                          value={ord.status}
                          onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-bold text-slate-800 outline-none"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="PROCESSING">Processing</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: SHOP PHOTO GALLERY */}
      {activeTab === 'gallery' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 uppercase">
                    BHADRACHALAM SHOWROOM
                  </span>
                  <span className="text-xs text-slate-400">• {galleryItems.length} photos</span>
                </div>
                <h2 className="text-lg font-black text-slate-900 mt-1">Shop Photo Gallery Management</h2>
                <p className="text-xs text-slate-500">
                  Upload and manage storefront, interior, accessories display racks, and tempered glass counter photos.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateTo('gallery')}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Public Gallery</span>
                </button>
                <button
                  onClick={handleOpenAddGallery}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload Store Photo</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search gallery photos by title or description..."
                  value={gallerySearch}
                  onChange={(e) => setGallerySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <select
                value={galleryCategoryFilter}
                onChange={(e) => setGalleryCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="STORE_INTERIOR">Store Interior</option>
                <option value="ACCESSORIES_DISPLAY">Accessories Display</option>
                <option value="SHOWROOM_FRONT">Showroom Front</option>
                <option value="SERVICE_DESK">Fitting & Service Desk</option>
                <option value="GADGETS_WALL">Gadgets Wall</option>
              </select>
            </div>

            {/* Gallery Grid */}
            {galleryItems.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6 space-y-3">
                <Camera className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No shop photos in gallery yet</p>
                <button
                  onClick={handleOpenAddGallery}
                  className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl"
                >
                  Upload First Shop Photo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {galleryItems
                  .filter((g) => {
                    const matchQ =
                      g.title.toLowerCase().includes(gallerySearch.toLowerCase()) ||
                      g.description.toLowerCase().includes(gallerySearch.toLowerCase());
                    const matchCat = galleryCategoryFilter === 'ALL' || g.category === galleryCategoryFilter;
                    return matchQ && matchCat;
                  })
                  .map((item, idx) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1555421689-d68471e189f2?auto=format&fit=crop&w=600&q=80';
                          }}
                        />
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-0.5 rounded-full bg-slate-950/80 text-white text-[9px] font-black uppercase tracking-wider backdrop-blur-sm">
                            {item.category.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="absolute top-2 right-2">
                          <span className="px-1.5 py-0.5 rounded-md bg-purple-600 text-white text-[9px] font-bold">
                            #{item.displayOrder || idx + 1}
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{item.title}</h4>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <button
                            onClick={() => handleOpenEditGallery(item)}
                            className="px-2.5 py-1 text-slate-700 hover:text-purple-700 bg-slate-50 hover:bg-purple-50 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteGallery(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: COUPONS */}
      {activeTab === 'coupons' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Store Coupons &amp; Promo Codes</h2>
                <p className="text-xs text-slate-400">Offer discounts to attract and reward customers</p>
              </div>
              <button
                onClick={() => setIsCouponModalOpen(true)}
                className="px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create Coupon</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map((c) => (
                <div
                  key={c.id}
                  className="p-5 rounded-2xl bg-purple-50/50 border border-purple-200/80 space-y-2 relative"
                >
                  <button
                    onClick={() => handleDeleteCoupon(c.id)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-rose-600"
                    title="Delete Coupon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <span className="font-mono font-black text-lg text-purple-900 tracking-wider">
                    {c.code}
                  </span>
                  <p className="text-xs text-slate-600">{c.description}</p>
                  <div className="pt-2 border-t border-purple-100 flex justify-between text-xs font-bold text-purple-800">
                    <span>
                      {c.discountType === 'PERCENTAGE'
                        ? `${c.discountValue}% OFF`
                        : `Flat ₹${c.discountValue} OFF`}
                    </span>
                    <span>Min Order: ₹{c.minOrderValue}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: INQUIRIES */}
      {activeTab === 'messages' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">Customer Inquiries from Contact Form</h2>

            {messages.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No inquiries received yet.</p>
            ) : (
              <div className="space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">
                        {m.name} ({m.email}) {m.phone ? `• ${m.phone}` : ''}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(m.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <strong className="text-xs text-purple-700 block">{m.subject}</strong>
                    <p className="text-xs text-slate-600 leading-relaxed">{m.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Add / Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="font-bold text-base text-slate-900">
                {editingProductId ? 'Edit Product Accessory' : 'Add New Accessory to Catalog'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="p-1">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={prodFormName}
                  onChange={(e) => setProdFormName(e.target.value)}
                  placeholder="e.g. Radhika Ultra Crystal Armor Case"
                  className="w-full border rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={prodFormCategory}
                    onChange={(e) => setProdFormCategory(e.target.value)}
                    className="w-full border rounded-xl p-2.5 text-xs outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={prodFormBrand}
                    onChange={(e) => setProdFormBrand(e.target.value)}
                    className="w-full border rounded-xl p-2.5 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={prodFormPrice}
                    onChange={(e) => setProdFormPrice(Number(e.target.value))}
                    className="w-full border rounded-xl p-2.5 text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">MRP Price (₹)</label>
                  <input
                    type="number"
                    value={prodFormOriginalPrice}
                    onChange={(e) => setProdFormOriginalPrice(Number(e.target.value))}
                    className="w-full border rounded-xl p-2.5 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stock Units *</label>
                  <input
                    type="number"
                    required
                    value={prodFormStock}
                    onChange={(e) => setProdFormStock(Number(e.target.value))}
                    className="w-full border rounded-xl p-2.5 text-xs outline-none"
                  />
                </div>
              </div>

              {/* Product Photos Section */}
              <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-800">
                      Product Photos ({prodImages.length})
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Select JPG, PNG, or WebP photo from phone/computer or paste link.
                    </p>
                  </div>
                  {prodImages.length > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200 text-purple-900">
                      Primary Cover Set
                    </span>
                  )}
                </div>

                {/* Upload Action */}
                <ImageUploader
                  label="Upload / Add Photo"
                  helperText="Choose photo from phone or computer (max 5 MB)"
                  onImageUploaded={(url) => {
                    if (url) {
                      handleAddProductPhoto(url);
                    }
                  }}
                  aspectRatio="wide"
                />

                {/* Thumbnail list of photos attached to this product */}
                {prodImages.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-purple-100">
                    <p className="text-[11px] font-bold text-slate-700">Photos in Catalog for this Product:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {prodImages.map((img, idx) => (
                        <div
                          key={img.id || idx}
                          className={`relative rounded-xl overflow-hidden border p-1.5 bg-white flex flex-col justify-between ${
                            img.isPrimary ? 'border-purple-600 ring-2 ring-purple-400' : 'border-slate-200'
                          }`}
                        >
                          <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-100">
                            <img
                              src={img.url}
                              alt={`Product photo ${idx + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=600&q=80';
                              }}
                            />
                            {img.isPrimary && (
                              <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-purple-600 text-white font-black text-[9px] rounded shadow">
                                ★ COVER
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveProductPhoto(idx)}
                              className="absolute top-1 right-1 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow"
                              title="Delete photo"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="pt-1.5 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 font-mono">#{idx + 1}</span>
                            {!img.isPrimary ? (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryPhoto(idx)}
                                className="text-[10px] text-purple-700 hover:text-purple-900 font-bold underline"
                              >
                                Set as Cover
                              </button>
                            ) : (
                              <span className="text-[10px] text-emerald-700 font-bold">Main Photo</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Device Compatibility</label>
                <input
                  type="text"
                  value={prodFormCompatibility}
                  onChange={(e) => setProdFormCompatibility(e.target.value)}
                  placeholder="e.g. iPhone 16 Pro Max, Samsung S25 Ultra"
                  className="w-full border rounded-xl p-2.5 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={prodFormDesc}
                  onChange={(e) => setProdFormDesc(e.target.value)}
                  placeholder="Technical specs, material, drop rating..."
                  className="w-full border rounded-xl p-2.5 text-xs outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="flex-1 py-2.5 border rounded-xl text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700"
                >
                  {editingProductId ? 'Update Product' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900">Create New Coupon Code</h3>
            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value)}
                  placeholder="e.g. SUMMER20"
                  className="w-full border rounded-xl p-2.5 text-xs font-mono uppercase font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={newCouponType}
                    onChange={(e: any) => setNewCouponType(e.target.value)}
                    className="w-full border rounded-xl p-2 text-xs font-semibold"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Flat (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Value</label>
                  <input
                    type="number"
                    required
                    value={newCouponDiscount}
                    onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                    className="w-full border rounded-xl p-2 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Min Order Value (₹)</label>
                <input
                  type="number"
                  value={newCouponMinOrder}
                  onChange={(e) => setNewCouponMinOrder(Number(e.target.value))}
                  className="w-full border rounded-xl p-2.5 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="flex-1 py-2.5 border rounded-xl text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shop Gallery Add / Edit Modal */}
      {isGalleryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {editingGalleryId ? 'Edit Shop Photo' : 'Upload New Shop Photo'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Bhadrachalam Store Showroom Gallery</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGalleryModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGallery} className="space-y-4">
              {/* Photo Uploader */}
              <ImageUploader
                label="Shop / Showroom Photo *"
                helperText="Upload high-res photo from phone or computer (JPG, PNG, WebP up to 5 MB)"
                currentImageUrl={galleryFormImageUrl}
                onImageUploaded={(url) => setGalleryFormImageUrl(url)}
                aspectRatio="wide"
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Photo Title *</label>
                <input
                  type="text"
                  required
                  value={galleryFormTitle}
                  onChange={(e) => setGalleryFormTitle(e.target.value)}
                  placeholder="e.g. 2000+ Mobile Cases Display Wall"
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={galleryFormCategory}
                    onChange={(e: any) => setGalleryFormCategory(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                  >
                    <option value="STORE_INTERIOR">Store Interior</option>
                    <option value="ACCESSORIES_DISPLAY">Accessories Display</option>
                    <option value="SHOWROOM_FRONT">Showroom Front</option>
                    <option value="SERVICE_DESK">Fitting & Service Desk</option>
                    <option value="GADGETS_WALL">Gadgets Wall</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    min="1"
                    value={galleryFormOrder}
                    onChange={(e) => setGalleryFormOrder(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Caption</label>
                <textarea
                  rows={3}
                  value={galleryFormDescription}
                  onChange={(e) => setGalleryFormDescription(e.target.value)}
                  placeholder="Details about what is featured in this showroom area..."
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsGalleryModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl text-xs font-bold shadow-md transition-all"
                >
                  {editingGalleryId ? 'Save Changes' : 'Publish to Gallery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
