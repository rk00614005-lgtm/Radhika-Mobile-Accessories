import React from 'react';
import { useShop } from '../context/ShopContext.js';
import {
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  RotateCcw,
  Truck,
  CreditCard,
  Heart,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateTo, user, isAdmin, loginDemoAdmin } = useShop();

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-8 border-t border-slate-900 mt-20">
      {/* Value Badges Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-slate-900/80 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">100% Genuine</h4>
              <p className="text-xs text-slate-400">Direct factory tested gear</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-pink-950/80 border border-pink-500/30 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Express Shipping</h4>
              <p className="text-xs text-slate-400">Free delivery above ₹499</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <RotateCcw className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">7-Day Replacement</h4>
              <p className="text-xs text-slate-400">Hassle-free guarantee</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-950/80 border border-blue-500/30 flex items-center justify-center shrink-0">
              <CreditCard className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Razorpay & COD</h4>
              <p className="text-xs text-slate-400">100% secure encrypted</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
        {/* Brand & Physical Shop Info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
              R
            </div>
            <span className="text-xl font-black text-white">Radhika Mobile Accessories</span>
          </div>

          <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
            India&apos;s trusted destination for durable smartphone cases, fast GaN chargers, 9H tempered protectors, audiophile earbuds, and lifestyle gadgets. Both online and at our Bhadrachalam store.
          </p>

          <div className="space-y-2.5 pt-2 text-xs text-slate-300">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white block">Shop Address:</span>
                <span>Market Road, Opposite to the Current Office, Bhadrachalam</span>
                <div className="mt-1">
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Market+Road+Opposite+Current+Office+Bhadrachalam"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-pink-400 hover:text-pink-300 font-bold underline"
                  >
                    <span>View Location on Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong className="text-white">Store Hours:</strong> Open Daily: 9:00 AM – 10:00 PM (Monday to Sunday)
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-pink-400 shrink-0" />
                <a
                  href="tel:7207126270"
                  className="text-slate-200 hover:text-pink-400 font-bold transition-colors"
                >
                  7207126270
                </a>
              </div>
              <span className="hidden sm:inline text-slate-600">/</span>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-pink-400 shrink-0 sm:hidden" />
                <a
                  href="tel:9492456210"
                  className="text-slate-200 hover:text-pink-400 font-bold transition-colors"
                >
                  9492456210
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-blue-400 shrink-0" />
              <a
                href="mailto:rk00614005@gmail.com"
                className="text-slate-200 hover:text-blue-300 transition-colors underline break-all"
              >
                rk00614005@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Quick Shop Links */}
        <div>
          <h4 className="text-white font-bold text-sm mb-4 tracking-wide uppercase">Shop Categories</h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li>
              <button
                onClick={() => navigateTo('shop', { category: 'mobile-cases-covers' })}
                className="hover:text-purple-400 transition-colors"
              >
                Mobile Cases & Covers
              </button>
            </li>
            <li>
              <button
                onClick={() => navigateTo('shop', { category: 'tempered-glass-screen-protectors' })}
                className="hover:text-purple-400 transition-colors"
              >
                9H Tempered Glass
              </button>
            </li>
            <li>
              <button
                onClick={() => navigateTo('shop', { category: 'chargers-adapters' })}
                className="hover:text-purple-400 transition-colors"
              >
                GaN Fast Chargers
              </button>
            </li>
            <li>
              <button
                onClick={() => navigateTo('shop', { category: 'cables-data-leads' })}
                className="hover:text-purple-400 transition-colors"
              >
                Braided 100W Cables
              </button>
            </li>
            <li>
              <button
                onClick={() => navigateTo('shop', { category: 'earphones-tws-earbuds' })}
                className="hover:text-purple-400 transition-colors"
              >
                ANC Earbuds & Neckbands
              </button>
            </li>
            <li>
              <button
                onClick={() => navigateTo('shop', { category: 'smartwatches' })}
                className="hover:text-purple-400 transition-colors"
              >
                AMOLED Smartwatches
              </button>
            </li>
            <li>
              <button
                onClick={() => navigateTo('shop', { category: 'power-banks' })}
                className="hover:text-purple-400 transition-colors"
              >
                Power Banks & MagSafe
              </button>
            </li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h4 className="text-white font-bold text-sm mb-4 tracking-wide uppercase">Customer Care</h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li>
              <button onClick={() => navigateTo('track')} className="hover:text-purple-400 transition-colors">
                Track Your Shipment
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('account')} className="hover:text-purple-400 transition-colors">
                My Orders & Account
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('contact')} className="hover:text-purple-400 transition-colors">
                Physical Shop Location & Map
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('faq')} className="hover:text-purple-400 transition-colors">
                Frequently Asked Questions
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('gallery')} className="text-pink-400 hover:text-pink-300 font-bold transition-colors">
                ★ Shop Photo Gallery
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('about')} className="hover:text-purple-400 transition-colors">
                Our Bhadrachalam Shop Story
              </button>
            </li>
          </ul>
        </div>

        {/* Legal & Policies */}
        <div>
          <h4 className="text-white font-bold text-sm mb-4 tracking-wide uppercase">Policies & Info</h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li>
              <button onClick={() => navigateTo('policies')} className="hover:text-purple-400 transition-colors">
                Shipping & Delivery Policy
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('policies')} className="hover:text-purple-400 transition-colors">
                7-Day Returns & Refund
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('policies')} className="hover:text-purple-400 transition-colors">
                Privacy Policy
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('policies')} className="hover:text-purple-400 transition-colors">
                Terms of Service
              </button>
            </li>
            <li className="pt-3">
              {isAdmin ? (
                <button
                  onClick={() => navigateTo('admin')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-900/60 text-purple-300 font-bold hover:bg-purple-800 transition-colors"
                >
                  <span>Admin Dashboard</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              ) : (
                <button
                  onClick={loginDemoAdmin}
                  className="text-slate-500 hover:text-purple-400 text-[11px] underline"
                >
                  Staff / Admin Login
                </button>
              )}
            </li>
          </ul>
        </div>
      </div>

      {/* Payment methods & Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p className="flex items-center gap-1">
          <span>© {new Date().getFullYear()} Radhika Mobile Accessories. All rights reserved. Made with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          <span>in Bhadrachalam, India.</span>
        </p>

        {/* Payment badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-slate-400 font-semibold mr-1">Accepted Payments:</span>
          <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded font-bold text-slate-300 text-[10px]">
            Razorpay
          </span>
          <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded font-bold text-emerald-400 text-[10px]">
            UPI (GPay / PhonePe)
          </span>
          <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded font-bold text-blue-400 text-[10px]">
            RuPay / Visa / Master
          </span>
          <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded font-bold text-amber-400 text-[10px]">
            Cash on Delivery
          </span>
        </div>
      </div>
    </footer>
  );
};
