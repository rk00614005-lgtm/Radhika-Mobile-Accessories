import React, { useState } from 'react';
import { useShop } from '../context/ShopContext.js';
import { ChevronDown, HelpCircle, ArrowRight, ShieldCheck, Truck, CreditCard } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
  cat: string;
}

export const FaqPage: React.FC = () => {
  const { navigateTo } = useShop();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      cat: 'payments',
      q: 'Which payment methods are accepted on Radhika Mobile Accessories?',
      a: 'We accept all major Indian payment channels through our secure Razorpay gateway: UPI (Google Pay, PhonePe, Paytm, BHIM), Debit & Credit Cards (Visa, MasterCard, RuPay), NetBanking from 50+ Indian banks, and Cash on Delivery (COD) across eligible pincodes.',
    },
    {
      cat: 'payments',
      q: 'Is Cash on Delivery (COD) available for my order?',
      a: 'Yes! Cash on Delivery is enabled nationwide. You can hand over cash or scan the courier delivery agent’s UPI QR code upon arrival at your doorstep.',
    },
    {
      cat: 'shipping',
      q: 'How fast is delivery and which courier partners do you use?',
      a: 'Orders placed before 2:00 PM are packed and handed over the same day from our Pune fulfillment hub. We ship through BlueDart Express and Delhivery. Typical delivery is 24–48 hours for Maharashtra, Gujarat, and Goa, and 3–4 business days for other states.',
    },
    {
      cat: 'shipping',
      q: 'What are the delivery charges?',
      a: 'We offer FREE Express Delivery on all orders above ₹499 across all Indian pincodes. For orders below ₹499, a nominal flat shipping fee of ₹49 is applied.',
    },
    {
      cat: 'returns',
      q: 'What is your 7-Day Replacement Policy?',
      a: 'If you receive an incorrect case model, a defective fast charger, or tempered glass damaged in transit, simply contact our WhatsApp support (+91 98765 43210) within 7 days of delivery with photos, and we will dispatch a replacement without hassle.',
    },
    {
      cat: 'returns',
      q: 'Are your products 100% genuine and safe for expensive phones?',
      a: 'Yes, absolutely. We strictly reject cheap unbranded knockoffs. Our 65W GaN chargers feature intelligent temperature regulation and over-voltage BIS protection, and our MagSafe cases use authentic N52 neodymium magnets certified not to damage wireless charging coils.',
    },
    {
      cat: 'store',
      q: 'Can I buy online and pick up my order from the Bhadrachalam physical store?',
      a: 'Yes! You can choose store pickup or visit us directly at Market Road, Opposite to the Current Office, Bhadrachalam. Our technicians also offer complimentary zero-air-bubble tempered glass installation for all in-store visitors.',
    },
    {
      cat: 'store',
      q: 'What are the opening hours and contact numbers of the physical store?',
      a: 'Our shop on Market Road in Bhadrachalam is open daily: 9:00 AM – 10:00 PM (Monday to Sunday). You can reach our team directly at 7207126270 or 9492456210, or email us at rk00614005@gmail.com.',
    },
  ];

  const filteredFaqs =
    activeCategory === 'all' ? faqs : faqs.filter((f) => f.cat === activeCategory);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-2">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Everything you need to know about ordering, shipping, payments, and store visits
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap justify-center gap-2">
        {[
          { id: 'all', label: 'All Questions' },
          { id: 'payments', label: 'Payments & COD' },
          { id: 'shipping', label: 'Shipping & Delivery' },
          { id: 'returns', label: '7-Day Replacements' },
          { id: 'store', label: 'Bhadrachalam Store' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveCategory(tab.id);
              setOpenIdx(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCategory === tab.id
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Accordion list */}
      <div className="space-y-3">
        {filteredFaqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={faq.q}
              className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-purple-600 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ${
                    isOpen ? 'rotate-180 text-purple-600' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-in fade-in duration-200">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Still need help callout */}
      <div className="p-8 rounded-3xl bg-purple-50 border border-purple-100 text-center space-y-3">
        <h3 className="font-bold text-base text-purple-950">Have a question that isn&apos;t listed here?</h3>
        <p className="text-xs text-purple-800 max-w-md mx-auto">
          Our team is available on WhatsApp or at our Bhadrachalam shop: Open Daily: 9:00 AM – 10:00 PM.
        </p>
        <button
          onClick={() => navigateTo('contact')}
          className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
        >
          <span>Contact Our Support Team</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
