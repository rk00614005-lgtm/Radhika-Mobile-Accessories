import React, { useState } from 'react';
import { useShop } from '../context/ShopContext.js';
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Menu,
  X,
  MapPin,
  Phone,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  LogOut,
  Package,
  LayoutDashboard,
  Compass,
  Clock,
  Camera,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    navigateTo,
    cartCount,
    total,
    wishlist,
    user,
    isAdmin,
    logout,
    setIsAuthModalOpen,
    setAuthModalMode,
    loginDemoCustomer,
    loginDemoAdmin,
  } = useShop();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigateTo('shop', { category: undefined });
      // Custom event or state passed to shop
      window.dispatchEvent(
        new CustomEvent('radhika-search', { detail: searchQuery.trim() })
      );
    }
  };

  const navCategories = [
    { name: 'All Products', slug: '' },
    { name: 'Cases & Covers', slug: 'mobile-cases-covers' },
    { name: 'Tempered Glass', slug: 'tempered-glass-screen-protectors' },
    { name: 'Fast Chargers', slug: 'chargers-adapters' },
    { name: 'Cables', slug: 'cables-data-leads' },
    { name: 'Earphones & TWS', slug: 'earphones-tws-earbuds' },
    { name: 'Headphones', slug: 'bluetooth-headphones' },
    { name: 'Power Banks', slug: 'power-banks' },
    { name: 'Speakers', slug: 'bluetooth-speakers' },
    { name: 'Smartwatches', slug: 'smartwatches' },
    { name: 'Stands & Mounts', slug: 'stands-mounts' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white text-[12px] py-1.5 px-4 font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
            <span className="flex items-center gap-1.5 text-pink-300 whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Free Express Delivery across India on orders &gt; ₹499!</span>
            </span>
            <span className="hidden md:flex items-center gap-1.5 text-slate-300 whitespace-nowrap">
              <MapPin className="w-3.5 h-3.5 text-purple-400" />
              <span>Shop: Market Road, Opp. Current Office, Bhadrachalam</span>
            </span>
            <span className="hidden lg:flex items-center gap-1 text-slate-400 text-[11px] whitespace-nowrap">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>Open Daily: 9:00 AM – 10:00 PM</span>
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="tel:7207126270"
              className="hidden sm:flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
            >
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>7207126270</span>
            </a>
            <span className="text-slate-600">|</span>
            <span className="bg-purple-800/80 px-2 py-0.5 rounded text-[11px] font-bold text-purple-200">
              ₹ INR
            </span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => navigateTo('home')}
          className="cursor-pointer flex items-center gap-3 shrink-0 group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-rose-500 p-0.5 shadow-md group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-purple-400 to-pink-400">
                R
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 group-hover:text-purple-600 transition-colors">
                Radhika
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                Mobile
              </span>
            </div>
            <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase -mt-0.5">
              Accessories &amp; Gadgets • Bhadrachalam
            </p>
          </div>
        </div>

        {/* Search Bar (Desktop) */}
        <div className="hidden lg:block flex-1 max-w-xl">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search phone cases, 65W chargers, tempered glass, earbuds..."
              className="w-full bg-slate-50 border border-slate-200 rounded-full py-2.5 pl-11 pr-24 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm transition-transform active:scale-95"
            >
              Search
            </button>
          </form>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Quick Track Order Link */}
          <button
            onClick={() => navigateTo('track')}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-purple-600 transition-colors"
          >
            <Compass className="w-4 h-4 text-purple-600" />
            <span>Track Order</span>
          </button>

          {/* Wishlist Button */}
          <button
            onClick={() => navigateTo('shop')}
            className="relative p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            title="Wishlist"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5 text-slate-700 hover:text-rose-600" />
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart Button */}
          <button
            onClick={() => navigateTo('cart')}
            className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200/60 text-purple-950 font-bold text-xs transition-colors"
            title="Cart"
            aria-label="Cart"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-purple-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-pink-600 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-[10px] text-purple-600 font-medium block leading-none">
                Cart
              </span>
              <span className="text-xs font-extrabold">₹{total.toLocaleString('en-IN')}</span>
            </div>
          </button>

          {/* User Account / Login */}
          <div className="relative">
            {user ? (
              <button
                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all text-xs font-bold text-slate-800"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center font-black text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:inline max-w-[100px] truncate">{user.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setAuthModalMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-purple-900 text-white text-xs font-bold shadow-sm transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Login</span>
                </button>
              </div>
            )}

            {/* Account Dropdown */}
            {accountDropdownOpen && user && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                onClick={() => setAccountDropdownOpen(false)}
              >
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-400">Signed in as</p>
                  <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                  <span className="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                    {user.role}
                  </span>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => navigateTo('account')}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-purple-600 flex items-center gap-2.5"
                  >
                    <Package className="w-4 h-4 text-purple-600" />
                    <span>My Orders & History</span>
                  </button>

                  <button
                    onClick={() => navigateTo('track')}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-purple-600 flex items-center gap-2.5"
                  >
                    <Compass className="w-4 h-4 text-emerald-600" />
                    <span>Track Shipment</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => navigateTo('admin')}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-purple-700 bg-purple-50/70 hover:bg-purple-100 flex items-center gap-2.5"
                    >
                      <LayoutDashboard className="w-4 h-4 text-purple-700" />
                      <span>Admin Management</span>
                    </button>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100"
            aria-label="Open mobile menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Categories Navigation Bar (Desktop) */}
      <div className="hidden lg:block border-t border-slate-100 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between overflow-x-auto no-scrollbar py-2 text-xs">
          <div className="flex items-center gap-1 whitespace-nowrap">
            {navCategories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => navigateTo('shop', { category: cat.slug || undefined })}
                className="px-3 py-1.5 rounded-lg font-semibold text-slate-600 hover:text-purple-700 hover:bg-purple-50 transition-colors"
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0 pl-4 border-l border-slate-200">
            <button
              onClick={() => navigateTo('gallery')}
              className="text-purple-700 hover:text-purple-950 font-bold px-2.5 py-1 flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200/60"
            >
              <Camera className="w-3.5 h-3.5 text-pink-500" />
              <span>Store Gallery</span>
            </button>
            <button
              onClick={() => navigateTo('about')}
              className="text-slate-500 hover:text-purple-600 font-medium px-2 py-1"
            >
              About Shop
            </button>
            <button
              onClick={() => navigateTo('contact')}
              className="text-slate-500 hover:text-purple-600 font-medium px-2 py-1"
            >
              Contact
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-4 shadow-xl animate-in slide-in-from-top-4 duration-200">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-20 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <button
              type="submit"
              className="absolute right-1 top-1 bg-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
            >
              Search
            </button>
          </form>

          {/* Quick Demo Login Buttons for Tester */}
          {!user && (
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200/70 space-y-2">
              <p className="text-[11px] font-bold text-purple-900">🚀 Quick One-Click Demo Logins:</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    loginDemoCustomer();
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-1.5 bg-white border border-purple-300 rounded-lg text-xs font-bold text-purple-700 hover:bg-purple-100"
                >
                  Customer Demo
                </button>
                <button
                  onClick={() => {
                    loginDemoAdmin();
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-1.5 bg-purple-700 rounded-lg text-xs font-bold text-white hover:bg-purple-800"
                >
                  Admin Demo
                </button>
              </div>
            </div>
          )}

          {/* Category Links */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Categories
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {navCategories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => {
                    navigateTo('shop', { category: cat.slug || undefined });
                    setMobileMenuOpen(false);
                  }}
                  className="text-left text-xs font-medium text-slate-700 hover:text-purple-600 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Direct Shop Phone & Timing (Mobile) */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-700 font-bold">
              <span className="flex items-center gap-1.5 text-purple-700">
                <MapPin className="w-4 h-4 text-purple-600" />
                <span>Bhadrachalam Store</span>
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Open Daily: 9:00 AM – 10:00 PM</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Market Road, Opp. Current Office</p>
            <div className="flex gap-2 pt-1">
              <a
                href="tel:7207126270"
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-center font-bold text-xs flex items-center justify-center gap-1"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call 7207126270</span>
              </a>
              <a
                href="tel:9492456210"
                className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-center font-bold text-xs flex items-center justify-center gap-1"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call 9492456210</span>
              </a>
            </div>
          </div>

          {/* Extra pages */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => {
                navigateTo('gallery');
                setMobileMenuOpen(false);
              }}
              className="text-purple-900 font-extrabold p-1 bg-purple-100/80 rounded px-2 flex items-center gap-1"
            >
              <Camera className="w-3.5 h-3.5 text-pink-500" />
              <span>Store Photo Gallery</span>
            </button>
            <button
              onClick={() => {
                navigateTo('contact');
                setMobileMenuOpen(false);
              }}
              className="text-purple-700 font-extrabold p-1 bg-purple-50 rounded px-2"
            >
              Contact Us &amp; Location
            </button>
            <button
              onClick={() => {
                navigateTo('track');
                setMobileMenuOpen(false);
              }}
              className="text-purple-600 font-bold p-1"
            >
              Track Order
            </button>
            <button
              onClick={() => {
                navigateTo('about');
                setMobileMenuOpen(false);
              }}
              className="text-slate-600 font-medium p-1"
            >
              About Us
            </button>
            <button
              onClick={() => {
                navigateTo('faq');
                setMobileMenuOpen(false);
              }}
              className="text-slate-600 font-medium p-1"
            >
              FAQs
            </button>
            {isAdmin && (
              <button
                onClick={() => {
                  navigateTo('admin');
                  setMobileMenuOpen(false);
                }}
                className="text-pink-600 font-bold p-1"
              >
                Admin Panel
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
