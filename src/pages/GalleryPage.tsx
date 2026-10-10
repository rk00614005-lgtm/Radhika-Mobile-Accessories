import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext.js';
import { api } from '../services/api.js';
import { GalleryItem, GalleryCategory } from '../types/index.js';
import {
  MapPin,
  Clock,
  Phone,
  ZoomIn,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Camera,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

const CATEGORY_TABS: { label: string; value: string }[] = [
  { label: 'All Photos', value: 'ALL' },
  { label: 'Store Interior', value: 'STORE_INTERIOR' },
  { label: 'Accessories Display', value: 'ACCESSORIES_DISPLAY' },
  { label: 'Showroom Front', value: 'SHOWROOM_FRONT' },
  { label: 'Service & Fitting Desk', value: 'SERVICE_DESK' },
  { label: 'Gadgets Wall', value: 'GADGETS_WALL' },
];

export const GalleryPage: React.FC = () => {
  const { navigateTo, isAdmin } = useShop();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Lightbox Modal state
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    loadGallery();
  }, [selectedCategory]);

  const loadGallery = async () => {
    setLoading(true);
    try {
      const data = await api.getGallery(selectedCategory);
      setItems(data);
    } catch (err) {
      console.error('Failed to load gallery items', err);
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (index: number) => {
    setActiveLightboxIndex(index);
  };

  const closeLightbox = () => {
    setActiveLightboxIndex(null);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeLightboxIndex !== null && items.length > 0) {
      setActiveLightboxIndex((activeLightboxIndex - 1 + items.length) % items.length);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeLightboxIndex !== null && items.length > 0) {
      setActiveLightboxIndex((activeLightboxIndex + 1) % items.length);
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeLightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') {
        setActiveLightboxIndex((prev) => (prev !== null ? (prev - 1 + items.length) % items.length : null));
      }
      if (e.key === 'ArrowRight') {
        setActiveLightboxIndex((prev) => (prev !== null ? (prev + 1) % items.length : null));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxIndex, items.length]);

  const formatCategoryBadge = (cat: GalleryCategory) => {
    switch (cat) {
      case 'STORE_INTERIOR':
        return 'Store Interior';
      case 'ACCESSORIES_DISPLAY':
        return 'Accessories Display';
      case 'SHOWROOM_FRONT':
        return 'Showroom Front';
      case 'SERVICE_DESK':
        return 'Fitting & Repair Desk';
      case 'GADGETS_WALL':
        return 'Gadgets Wall';
      default:
        return cat;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Header Banner */}
      <section className="relative bg-gradient-to-br from-purple-950 via-slate-900 to-navy-950 text-white pt-12 pb-16 px-4 overflow-hidden border-b border-purple-900/50">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ec4899_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-7xl mx-auto relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-bold tracking-wide">
            <Camera className="w-3.5 h-3.5 text-pink-400" />
            <span>OFFICIAL STORE TOUR & SHOWCASE</span>
          </div>

          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Radhika Mobile Accessories{' '}
              <span className="bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                Photo Gallery
              </span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Step inside our physical showroom on Market Road, Bhadrachalam. Browse our live accessory display walls,
              certified fast charging counters, precision tempered glass installation stations, and hands-on audio experience zone.
            </p>
          </div>

          {/* Store Location & Timings Badge */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-pink-400" />
              </div>
              <div className="text-xs">
                <p className="text-slate-400 font-medium">Store Location</p>
                <p className="text-white font-bold truncate">Opp. Current Office, Market Road, Bhadrachalam</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-pink-400" />
              </div>
              <div className="text-xs">
                <p className="text-slate-400 font-medium">Store Timings</p>
                <p className="text-white font-bold">Open Daily: 9:00 AM – 10:00 PM</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-pink-400" />
              </div>
              <div className="text-xs">
                <p className="text-slate-400 font-medium">Shop Helpline</p>
                <div className="flex items-center gap-2">
                  <a href="tel:7207126270" className="text-pink-300 hover:text-pink-200 font-bold underline">
                    7207126270
                  </a>
                  <span className="text-slate-500">/</span>
                  <a href="tel:9492456210" className="text-pink-300 hover:text-pink-200 font-bold underline">
                    9492456210
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 -mt-6">
        {/* Category Pills & Admin Control Bar */}
        <div className="bg-white rounded-3xl p-4 shadow-xl border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSelectedCategory(tab.value)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === tab.value
                    ? 'bg-purple-950 text-white shadow-md shadow-purple-950/20 scale-[1.02]'
                    : 'bg-slate-50 text-slate-600 hover:bg-purple-50 hover:text-purple-950'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <span className="text-xs text-slate-500 font-semibold">
              Showing <span className="text-purple-950 font-bold">{items.length}</span> verified store photos
            </span>
            {isAdmin && (
              <button
                onClick={() => navigateTo('admin')}
                className="px-3.5 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Layers className="w-3.5 h-3.5" />
                Manage Photos
              </button>
            )}
          </div>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">Loading Radhika showroom gallery photos...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 p-8 mt-8 space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
              <Camera className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">No photos in this category yet</h3>
              <p className="text-xs text-slate-500">Check back soon or explore our other store categories.</p>
            </div>
            <button
              onClick={() => setSelectedCategory('ALL')}
              className="px-4 py-2 bg-purple-950 text-white rounded-xl text-xs font-bold"
            >
              View All Photos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {items.map((item, index) => (
              <div
                key={item.id}
                onClick={() => openLightbox(index)}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col"
              >
                {/* Photo container */}
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
                  <img
                    src={item.imageUrl}
                    alt={item.altText || item.title}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1555421689-d68471e189f2?auto=format&fit=crop&w=800&q=80';
                    }}
                  />

                  {/* Gradient Overlay & Zoom Icon */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
                    <span className="text-white text-xs font-bold flex items-center gap-1.5">
                      <ZoomIn className="w-4 h-4 text-pink-400" /> Click to enlarge
                    </span>
                    <span className="text-[11px] text-slate-300 font-mono">#{index + 1}</span>
                  </div>

                  {/* Category Pill Tag */}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-black border border-white/10 uppercase tracking-wider">
                      {formatCategoryBadge(item.category)}
                    </span>
                  </div>
                </div>

                {/* Caption Card */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-purple-900 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-purple-700 font-bold">
                      <Sparkles className="w-3 h-3 text-pink-500" /> Verified Store Photo
                    </span>
                    <span>Bhadrachalam</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Visit Physical Shop Invitation Banner */}
        <div className="mt-16 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-3xl space-y-4 relative z-10">
            <span className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-bold">
              VISIT OUR PHYSICAL STORE IN PERSON
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Experience Products In Real Life At Radhika Mobile Accessories
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Touch and feel phone case textures, test bass on wireless earbuds before buying, or get instant free bubble-free tempered glass installation on your phone at our Bhadrachalam shop counter!
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => navigateTo('contact')}
                className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" /> Get Store Directions & Contact
              </button>
              <button
                onClick={() => navigateTo('shop')}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-colors flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" /> Shop Online Catalog
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {activeLightboxIndex !== null && items[activeLightboxIndex] && (
        <div
          onClick={closeLightbox}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-50 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Prev button */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors hidden sm:flex items-center justify-center"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next button */}
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors hidden sm:flex items-center justify-center"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Content Card */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
          >
            {/* Image display */}
            <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden min-h-[300px]">
              <img
                src={items[activeLightboxIndex].imageUrl}
                alt={items[activeLightboxIndex].title}
                className="max-h-[60vh] md:max-h-[80vh] w-auto max-w-full object-contain"
              />
            </div>

            {/* Side Information */}
            <div className="w-full md:w-80 p-6 bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col justify-between space-y-4 overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-black border border-purple-500/30 uppercase tracking-wider">
                    {formatCategoryBadge(items[activeLightboxIndex].category)}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {activeLightboxIndex + 1} / {items.length}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-black text-white leading-snug">
                    {items[activeLightboxIndex].title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {items[activeLightboxIndex].description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                    <span>Market Road, Bhadrachalam</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                    <span>Open 9:00 AM – 10:00 PM</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-800">
                <button
                  onClick={() => {
                    closeLightbox();
                    navigateTo('shop');
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" /> Shop Catalog Online
                </button>
                <button
                  onClick={() => {
                    closeLightbox();
                    navigateTo('contact');
                  }}
                  className="w-full py-2 bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold rounded-xl transition-colors"
                >
                  View Physical Store Info
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
