import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext.js';
import { api } from '../services/api.js';
import { Product } from '../types/index.js';
import { Phone, MessageCircle, X, Sparkles, MapPin, Clock } from 'lucide-react';

export const FloatingContactButtons: React.FC = () => {
  const { currentPage, selectedProductId } = useShop();
  const [isOpen, setIsOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  // Shop WhatsApp details
  const shopPhone = '9492456210';
  const shopSecondaryPhone = '7207126270';
  const whatsappNumber = '919492456210';

  useEffect(() => {
    if (currentPage === 'product' && selectedProductId) {
      api.getProductById(selectedProductId)
        .then((p) => setActiveProduct(p))
        .catch(() => setActiveProduct(null));
    } else {
      setActiveProduct(null);
    }
  }, [currentPage, selectedProductId]);

  // Generate WhatsApp pre-filled message
  const getWhatsAppMessage = () => {
    if (activeProduct) {
      return encodeURIComponent(
        `Hello Radhika Mobile Accessories, I would like to enquire about "${activeProduct.name}" (Price: ₹${activeProduct.price}). Is it in stock at your Bhadrachalam shop? Product Link: ${window.location.origin}/?product=${activeProduct.id}`
      );
    }
    return encodeURIComponent(
      `Hello Radhika Mobile Accessories (Bhadrachalam), I would like to enquire about smartphone covers, fast chargers, tempered glass, or other accessories. Please share details.`
    );
  };

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${getWhatsAppMessage()}`;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 print:hidden">
      {/* Expanded Quick Contact Card */}
      {isOpen && (
        <div className="w-80 bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-4 space-y-3.5 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
            <div>
              <div className="flex items-center gap-1.5 text-purple-700 font-extrabold text-xs">
                <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                <span>Radhika Customer Support</span>
              </div>
              <h4 className="text-sm font-black text-slate-900 mt-0.5">Instant WhatsApp & Phone Help</h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Active Product context badge */}
          {activeProduct && (
            <div className="p-2.5 bg-purple-50 rounded-2xl border border-purple-200/60 flex items-center gap-2.5 text-xs">
              <img
                src={activeProduct.images?.[0]?.url || 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=200&q=80'}
                alt={activeProduct.name}
                className="w-10 h-10 rounded-xl object-cover border border-purple-200 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-purple-600 font-bold block">Enquiring about:</span>
                <p className="font-bold text-slate-900 truncate">{activeProduct.name}</p>
                <span className="text-[11px] font-extrabold text-pink-600">₹{activeProduct.price}</span>
              </div>
            </div>
          )}

          {/* Shop Hours & Store Location note */}
          <div className="space-y-1 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span className="truncate">Market Road, Opp. Current Office, Bhadrachalam</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Available 9:00 AM – 10:00 PM Daily</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            {/* WhatsApp Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
            >
              <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.004c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>Chat on WhatsApp (+91 {shopPhone})</span>
            </a>

            {/* Direct Phone Call Button */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`tel:${shopPhone}`}
                className="py-2.5 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Call {shopPhone}</span>
              </a>
              <a
                href={`tel:${shopSecondaryPhone}`}
                className="py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Phone className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>Alt: {shopSecondaryPhone}</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Floating Buttons Bar */}
      <div className="flex items-center gap-2">
        {/* Direct Call Button (separate as required) */}
        <a
          href={`tel:${shopPhone}`}
          className="h-12 px-4 rounded-full bg-slate-900 hover:bg-purple-950 text-white font-bold text-xs flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all border border-slate-700/60"
          title="Direct Phone Call: 9492456210"
        >
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Phone className="w-3.5 h-3.5 fill-emerald-400" />
          </div>
          <span className="hidden sm:inline">Call Shop: 9492456210</span>
          <span className="sm:hidden font-mono">Call</span>
        </a>

        {/* Floating WhatsApp Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            // Also opens if direct click, or toggle menu if clicked on chevron
          }}
          className="relative group h-12 px-4 sm:px-5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-xl hover:shadow-emerald-600/40 hover:scale-105 active:scale-95 transition-all"
          title="Chat with Radhika Mobile Accessories on WhatsApp"
        >
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-pink-500 border-2 border-white rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-pink-500 border-2 border-white rounded-full" />
          <svg className="w-5 h-5 fill-white shrink-0" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.004c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <span>WhatsApp Enquiry</span>
        </a>

        {/* Toggle details menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 rounded-full bg-white hover:bg-slate-50 text-slate-700 shadow-xl border border-slate-200 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          title="Show Shop Contact Info & Timings"
        >
          {isOpen ? <X className="w-5 h-5 text-slate-600" /> : <MessageCircle className="w-5 h-5 text-purple-700" />}
        </button>
      </div>
    </div>
  );
};
