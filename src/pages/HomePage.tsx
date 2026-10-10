import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext.js';
import { api } from '../services/api.js';
import { Product, Category } from '../types/index.js';
import { ProductCard } from '../components/ProductCard.js';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Store,
  MapPin,
  Clock,
  Phone,
  Flame,
  Star,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { navigateTo } = useShop();

  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestsellerProducts, setBestsellerProducts] = useState<Product[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ hours: 7, minutes: 24, seconds: 48 });

  // Countdown timer for flash sale
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, prods] = await Promise.all([
          api.getCategories(),
          api.getProducts(),
        ]);
        setCategories(cats);
        setFeaturedProducts(prods.filter((p) => p.isFeatured).slice(0, 8));
        setBestsellerProducts(prods.filter((p) => p.isBestSeller).slice(0, 8));
      } catch (e) {
        console.error('Error loading homepage data', e);
      }
    }
    loadData();
  }, []);

  const heroSlides = [
    {
      badge: '🔥 NEW SEASON ARRIVALS',
      title: 'Military Armor Cases & MagSafe Covers',
      subtitle: 'Engineered for iPhone 16 / 15 and Samsung Galaxy S25 / S24 Ultra. Certified 12ft drop protection with scratch-resistant German Bayer acrylic.',
      cta: 'Explore Cases & Covers',
      category: 'mobile-cases-covers',
      priceTag: 'From ₹399',
      image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=1200&q=80',
      gradient: 'from-purple-950 via-slate-900 to-indigo-950',
    },
    {
      badge: '⚡ NEXT-GEN GaN TECHNOLOGY',
      title: '65W GaN Dual USB-C Fast Chargers',
      subtitle: 'Charges MacBook, iPad, iPhone, and Samsung flagships simultaneously in half the time. Compact travel design with BIS safety protection.',
      cta: 'Shop Fast Chargers',
      category: 'chargers-adapters',
      priceTag: 'Up to 55% OFF',
      image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1200&q=80',
      gradient: 'from-slate-950 via-pink-950 to-purple-950',
    },
    {
      badge: '🎧 AUDIOPHILE SOUND & WEARABLES',
      title: 'BassPod Pro ANC Earbuds & Smartwatches',
      subtitle: 'Experience 35dB active noise cancellation, deep punchy bass, and 1.96" AMOLED calling smartwatches with 7-day battery life.',
      cta: 'Discover Audio & Wearables',
      category: 'earphones-tws-earbuds',
      priceTag: 'Starting ₹899',
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1200&q=80',
      gradient: 'from-indigo-950 via-slate-900 to-rose-950',
    },
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* 1. Hero Carousel Banner */}
      <section className="relative px-4 sm:px-6 max-w-7xl mx-auto pt-4">
        <div className={`relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-r ${heroSlides[activeSlide].gradient} min-h-[460px] md:min-h-[500px] flex items-center transition-all duration-700`}>
          <div className="absolute inset-0 bg-black/40 z-0" />
          <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -top-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 w-full p-6 sm:p-12 md:p-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-pink-300 font-extrabold text-xs tracking-wider border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>{heroSlides[activeSlide].badge}</span>
              </span>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
                {heroSlides[activeSlide].title}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                {heroSlides[activeSlide].subtitle}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigateTo('shop', { category: heroSlides[activeSlide].category })}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold text-sm shadow-xl hover:shadow-pink-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                >
                  <span>{heroSlides[activeSlide].cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-white text-xs font-bold flex items-center gap-2">
                  <span className="text-pink-300 font-black text-sm">{heroSlides[activeSlide].priceTag}</span>
                  <span className="text-slate-300">• Limited Stock</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="relative rounded-2xl overflow-hidden border border-white/20 shadow-2xl group max-w-md ml-auto">
                <img
                  src={heroSlides[activeSlide].image}
                  alt={heroSlides[activeSlide].title}
                  className="w-full h-80 object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-5">
                  <div className="text-white">
                    <span className="text-[10px] uppercase font-bold text-pink-400 tracking-wider">
                      Radhika Signature Collection
                    </span>
                    <p className="text-sm font-bold text-slate-200">
                      100% Guaranteed Genuine • Free Express Dispatch
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slide Indicators */}
          <div className="absolute bottom-4 left-6 sm:left-12 z-20 flex gap-2">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`h-2 rounded-full transition-all ${
                  activeSlide === idx ? 'w-8 bg-pink-500' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. Category Quick Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Shop by Category</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Browse top quality accessories for every smartphone and gadget
            </p>
          </div>
          <button
            onClick={() => navigateTo('shop')}
            className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1 group"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.slice(0, 11).map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigateTo('shop', { category: cat.slug })}
              className="cursor-pointer group bg-white p-3.5 rounded-2xl border border-slate-100 hover:border-purple-300 shadow-sm hover:shadow-md transition-all text-center flex flex-col items-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-purple-50 group-hover:bg-purple-100/80 mb-2.5 overflow-hidden flex items-center justify-center transition-colors">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="font-bold text-slate-800 text-xs group-hover:text-purple-700 transition-colors line-clamp-1">
                {cat.name}
              </h3>
              <span className="text-[10px] text-slate-400 mt-0.5 font-medium">
                {cat.productCount || '15+'} items
              </span>
            </div>
          ))}

          {/* Special "All Offers" pill */}
          <div
            onClick={() => navigateTo('shop')}
            className="cursor-pointer group bg-gradient-to-br from-purple-900 to-pink-900 p-3.5 rounded-2xl text-white text-center flex flex-col items-center justify-center shadow-sm hover:shadow-md"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-1.5">
              <Flame className="w-6 h-6 text-pink-400" />
            </div>
            <h3 className="font-black text-xs">Mega Deals</h3>
            <span className="text-[10px] text-pink-200">Up to 60% OFF</span>
          </div>
        </div>
      </section>

      {/* 3. Limited-Time Flash Sale with Live Countdown */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 text-yellow-300 font-extrabold text-xs">
                <Flame className="w-3.5 h-3.5" />
                <span>TODAY&apos;S LIGHTNING DEALS</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black">Crazy Discounts on Chargers & Earbuds</h2>
              <p className="text-xs sm:text-sm text-pink-100 max-w-lg">
                Exclusive online rates with coupon <strong>WELCOME10</strong>. Free shipping over ₹499 across all pincodes!
              </p>
            </div>

            {/* Countdown Box */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-pink-200 mr-1">
                Ends in:
              </span>
              <div className="flex items-center gap-1.5 text-center">
                <div className="bg-slate-950/60 backdrop-blur-md px-3 py-2 rounded-xl">
                  <span className="text-lg font-black">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="block text-[9px] text-pink-300 uppercase">Hours</span>
                </div>
                <span className="font-black text-lg">:</span>
                <div className="bg-slate-950/60 backdrop-blur-md px-3 py-2 rounded-xl">
                  <span className="text-lg font-black">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="block text-[9px] text-pink-300 uppercase">Mins</span>
                </div>
                <span className="font-black text-lg">:</span>
                <div className="bg-slate-950/60 backdrop-blur-md px-3 py-2 rounded-xl text-yellow-300">
                  <span className="text-lg font-black">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="block text-[9px] text-yellow-300 uppercase">Secs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Featured Gear</h2>
            <p className="text-xs sm:text-sm text-slate-500">Handpicked trending mobile essentials for you</p>
          </div>
          <button
            onClick={() => navigateTo('shop')}
            className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1 group"
          >
            <span>See More</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. Physical Store Spotlight & Contact Us Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-900 text-white rounded-3xl overflow-hidden border border-slate-800 shadow-2xl grid grid-cols-1 lg:grid-cols-12">
          {/* Store Info & Direct Contact */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs mb-3 border border-purple-500/30">
                <Store className="w-3.5 h-3.5" />
                <span>VISIT OUR BHADRACHALAM STORE • CONTACT US</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black mb-3">
                Experience Before You Buy on Market Road
              </h2>

              <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                Looking for the perfect case, high-speed 65W GaN charger, or 9H tempered glass? Visit our physical shop in Bhadrachalam for hands-on demos, or connect with us directly. Complimentary zero-bubble glass installation on every in-store purchase!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white font-bold">Shop Address</strong>
                    <span className="text-slate-300 font-medium">Market Road, Opposite to the Current Office, Bhadrachalam</span>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Market+Road+Opposite+Current+Office+Bhadrachalam"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-pink-400 hover:text-pink-300 underline font-bold mt-1"
                    >
                      <span>Google Maps Search</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white font-bold">Store Hours</strong>
                    <span className="text-emerald-400 font-bold">Open Daily: 9:00 AM – 10:00 PM</span>
                    <span className="block text-[11px] text-slate-400">Monday to Sunday (Every day)</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white font-bold">Call Us Directly</strong>
                    <div className="flex flex-col gap-0.5 mt-0.5">
                      <a href="tel:7207126270" className="text-slate-200 hover:text-pink-400 font-bold transition-colors">
                        📞 7207126270
                      </a>
                      <a href="tel:9492456210" className="text-slate-200 hover:text-pink-400 font-bold transition-colors">
                        📞 9492456210
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white font-bold">Official Email Support</strong>
                    <a
                      href="mailto:rk00614005@gmail.com"
                      className="text-slate-300 hover:text-purple-300 underline break-all font-medium"
                    >
                      rk00614005@gmail.com
                    </a>
                    <span className="block text-[11px] text-slate-400 mt-0.5">Quick inquiries &amp; bulk orders</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 flex flex-wrap gap-3">
              <button
                onClick={() => navigateTo('gallery')}
                className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>View Store Photo Gallery</span>
              </button>

              <button
                onClick={() => navigateTo('contact')}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md"
              >
                <span>Go to Contact &amp; Store Page</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <a
                href="https://www.google.com/maps/search/?api=1&query=Market+Road+Opposite+Current+Office+Bhadrachalam"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5 text-pink-400" />
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <a
                href="https://wa.me/917207126270?text=Hi%20Radhika%20Mobile%20Accessories,%20I%20have%20an%20inquiry"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <span>WhatsApp (7207126270)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Store Visual Card */}
          <div className="lg:col-span-5 relative min-h-[280px] bg-slate-800 flex flex-col justify-between p-6">
            <img
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80"
              alt="Radhika Mobile Accessories Bhadrachalam"
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-[11px] font-bold text-white bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                📍 Bhadrachalam Landmark
              </span>
            </div>
            <div className="relative z-10 bg-slate-950/85 backdrop-blur-md p-4 rounded-2xl border border-slate-700/80 space-y-1">
              <span className="text-[10px] uppercase font-bold text-pink-400 tracking-wider">
                Physical Shop
              </span>
              <p className="font-extrabold text-white text-sm">
                Market Road, Opp. Current Office
              </p>
              <p className="text-xs text-slate-300">
                Bhadrachalam • Open Daily 9:00 AM – 10:00 PM
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-bold">
                <a href="tel:7207126270" className="text-pink-400 hover:underline">
                  Call: 7207126270
                </a>
                <span className="text-slate-500">•</span>
                <a href="tel:9492456210" className="text-pink-400 hover:underline">
                  9492456210
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5.5 Showroom & Accessories Photo Gallery Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-purple-50 via-pink-50/30 to-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                <Camera className="w-3.5 h-3.5 text-pink-600" />
                <span>STORE PHOTOS & DISPLAY WALLS</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Take a Tour of Radhika Mobile Accessories
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
                See our Bhadrachalam shop interior, phone cover displays, screen guard fitting desk, and fast chargers wall.
              </p>
            </div>
            <button
              onClick={() => navigateTo('gallery')}
              className="px-4 py-2.5 bg-purple-950 hover:bg-purple-900 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5 shrink-0"
            >
              <span>Explore Full Gallery</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => navigateTo('gallery')}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-900 cursor-pointer shadow-md hover:shadow-xl transition-all"
            >
              <img
                src="https://images.unsplash.com/photo-1555421689-d68471e189f2?auto=format&fit=crop&w=600&q=80"
                alt="Storefront entrance"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                <p className="text-white text-xs font-bold leading-tight">Shop Entrance & Welcome</p>
              </div>
            </div>

            <div
              onClick={() => navigateTo('gallery')}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-900 cursor-pointer shadow-md hover:shadow-xl transition-all"
            >
              <img
                src="https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80"
                alt="Mobile covers rack"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                <p className="text-white text-xs font-bold leading-tight">2000+ Mobile Cases Wall</p>
              </div>
            </div>

            <div
              onClick={() => navigateTo('gallery')}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-900 cursor-pointer shadow-md hover:shadow-xl transition-all"
            >
              <img
                src="https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=600&q=80"
                alt="Tempered glass fitting desk"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                <p className="text-white text-xs font-bold leading-tight">Screen Protector Desk</p>
              </div>
            </div>

            <div
              onClick={() => navigateTo('gallery')}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-900 cursor-pointer shadow-md hover:shadow-xl transition-all"
            >
              <img
                src="https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80"
                alt="Fast chargers counter"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                <p className="text-white text-xs font-bold leading-tight">Fast Chargers & Adapters</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Bestsellers Product Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Best Selling Favorites</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              The highest-rated accessories loved by over 50,000+ customers
            </p>
          </div>
          <button
            onClick={() => navigateTo('shop')}
            className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1 group"
          >
            <span>View All Bestsellers</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestsellerProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 7. Why Buy From Radhika Mobile Accessories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Why Gadget Lovers Choose Radhika
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            We bridge the gap between trustworthy local shop reliability and fast pan-India e-commerce
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-purple-200 transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Zero Fake / Replica Guarantee</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every cable, GaN charger, and tempered glass is tested on original Apple & Android hardware to ensure safe voltage output and zero battery damage.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-pink-200 transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-700 flex items-center justify-center font-bold">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Express Pan-India Dispatch</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Orders placed before 2:00 PM are dispatched same-day via BlueDart or Delhivery with tracking updates sent to your SMS and email.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-emerald-200 transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">7-Day Replacement Support</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Case didn&apos;t fit or sound wasn&apos;t as punchy as expected? Our customer care in Pune is just a WhatsApp message away for instant replacement.
            </p>
          </div>
        </div>
      </section>

      {/* 8. Customer Reviews Testimonial Carousel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-purple-950/20 border border-purple-200/60 rounded-3xl p-8">
          <div className="text-center max-w-lg mx-auto mb-8">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-widest block mb-1">
              REAL TESTIMONIALS
            </span>
            <h2 className="text-2xl font-black text-slate-900">What Our Customers Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 italic">
                &ldquo;The MagSafe armor case for my iPhone 16 is super sleek yet tough. Magnet holds strongly in my car mount. Definitely ordering the 65W charger next!&rdquo;
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">Aarav S.</span>
                <span className="text-slate-400">Mumbai</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 italic">
                &ldquo;Visited their Pune shop first to buy tempered glass, and the technician installed it with zero bubbles. Now I order all accessories online from them.&rdquo;
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">Pooja P.</span>
                <span className="text-slate-400">Pune</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 italic">
                &ldquo;Fast shipping to Bengaluru! The 100W braided cable is tough as nails and charges my laptop and OnePlus without getting warm. 5 stars.&rdquo;
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">Rohan M.</span>
                <span className="text-slate-400">Bengaluru</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. VIP Discount Coupon Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-black">
              First time buying accessories at Radhika?
            </h3>
            <p className="text-xs sm:text-sm text-purple-200">
              Use promo coupon code <strong className="text-yellow-300 font-mono text-base px-2 py-0.5 bg-white/10 rounded-lg">WELCOME10</strong> at checkout for 10% instant discount!
            </p>
          </div>
          <button
            onClick={() => navigateTo('shop')}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold text-xs shadow-lg transition-all active:scale-95 shrink-0"
          >
            Start Shopping Now
          </button>
        </div>
      </section>
    </div>
  );
};
