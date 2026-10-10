import React from 'react';
import { useShop } from '../context/ShopContext.js';
import {
  ShieldCheck,
  Store,
  MapPin,
  Clock,
  Award,
  Users,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Phone,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { navigateTo } = useShop();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-16">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 font-extrabold text-xs uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Our Journey &amp; Legacy</span>
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
          About Radhika Mobile Accessories
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          From a trusted local tech counter in Bhadrachalam to an omnichannel e-commerce destination delivering genuine mobile accessories across India.
        </p>
      </div>

      {/* Origin Story */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white p-6 sm:p-10 rounded-3xl border border-slate-100 shadow-sm">
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            How It All Began
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Radhika Mobile Accessories was founded with a straightforward conviction: Indian gadget lovers shouldn&apos;t have to gamble on flimsy counterfeit chargers that overheat batteries or overpriced cases that crack on the first drop.
          </p>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Starting with our physical store at <strong>Market Road, Opposite to the Current Office, Bhadrachalam</strong>, we built a reputation for honest recommendations, precision bubble-free tempered glass applications, and factory-tested cables. Today, our digital store carries that exact same commitment to customers across India.
          </p>

          <div className="pt-2 flex items-center gap-4 text-xs font-bold text-slate-800">
            <div className="flex items-center gap-1.5 text-purple-700">
              <CheckCircle2 className="w-4 h-4" />
              <span>50,000+ Orders</span>
            </div>
            <div className="flex items-center gap-1.5 text-pink-700">
              <CheckCircle2 className="w-4 h-4" />
              <span>4.9★ Store Rating</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
              <span>100% Genuine</span>
            </div>
          </div>
        </div>

        <div className="relative rounded-2xl overflow-hidden shadow-lg bg-slate-900">
          <img
            src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80"
            alt="Radhika Mobile Accessories Bhadrachalam"
            className="w-full h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent flex items-end p-5 text-white">
            <div className="text-xs">
              <span className="font-bold block">Flagship Store in Bhadrachalam</span>
              <span className="text-slate-300">Market Road, Opposite Current Office</span>
            </div>
          </div>
        </div>
      </div>

      {/* Core Pillars */}
      <div className="space-y-6">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-2xl font-black text-slate-900">Our Core Standards</h2>
          <p className="text-xs text-slate-500 mt-1">What sets Radhika Mobile Accessories apart</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Certified Hardware Testing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We never dropship untested inventory. Every GaN charger, PD cable, and smartwatch is tested for safe thermals, accurate voltage output, and BIS Indian compliance.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-700 flex items-center justify-center font-bold">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Physical Store Accountability</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Unlike faceless online fly-by-night sellers, our physical showroom is open daily on Market Road, Bhadrachalam from 9:00 AM to 10:00 PM. You can walk in for hands-on demos, exchanges, or expert advice anytime.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Indian Rupee Value</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Direct factory partnerships enable us to bring top-tier military drop cases and studio audio gear at honest Indian Rupee prices with zero hidden markups.
            </p>
          </div>
        </div>
      </div>

      {/* Flagship Store Visit Box */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-2xl sm:text-3xl font-black">Visiting Bhadrachalam? Come Say Hello!</h2>
          <p className="text-xs sm:text-sm text-purple-200 max-w-md">
            Market Road, Opposite to the Current Office. Open Daily: 9:00 AM – 10:00 PM. Get your phone fitted with edge-to-edge 9H privacy tempered glass or test our 65W GaN fast chargers in person.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigateTo('contact')}
            className="px-6 py-3.5 bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <span>View Store Address &amp; Map</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigateTo('shop')}
            className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs rounded-xl transition-all"
          >
            Shop Online Catalog
          </button>
        </div>
      </div>
    </div>
  );
};
