import React, { useState } from 'react';
import { ShieldCheck, Truck, RotateCcw, FileText, Lock } from 'lucide-react';

export const PoliciesPage: React.FC = () => {
  const [activePolicy, setActivePolicy] = useState<'shipping' | 'returns' | 'privacy' | 'terms'>('shipping');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Store Policies &amp; Legal Terms
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Transparent guidelines protecting customers of Radhika Mobile Accessories
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-slate-200 gap-2">
        <button
          onClick={() => setActivePolicy('shipping')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
            activePolicy === 'shipping'
              ? 'border-purple-600 text-purple-700 bg-purple-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Shipping & Delivery</span>
        </button>

        <button
          onClick={() => setActivePolicy('returns')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
            activePolicy === 'returns'
              ? 'border-purple-600 text-purple-700 bg-purple-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Returns & Refunds</span>
        </button>

        <button
          onClick={() => setActivePolicy('privacy')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
            activePolicy === 'privacy'
              ? 'border-purple-600 text-purple-700 bg-purple-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Privacy Policy</span>
        </button>

        <button
          onClick={() => setActivePolicy('terms')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
            activePolicy === 'terms'
              ? 'border-purple-600 text-purple-700 bg-purple-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Terms of Service</span>
        </button>
      </div>

      {/* Policy Content */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-100 shadow-sm text-xs sm:text-sm text-slate-600 space-y-6 leading-relaxed">
        {activePolicy === 'shipping' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-slate-900">Shipping & Delivery Policy</h2>
            <p>
              At <strong>Radhika Mobile Accessories</strong>, we partner with premier Indian logistics carriers, primarily BlueDart Express and Delhivery, to guarantee fast, insured, and damage-free transit of your electronic gear.
            </p>
            <h3 className="font-bold text-slate-800 text-sm pt-2">1. Dispatch Timelines</h3>
            <p>
              All orders confirmed before 2:00 PM IST on working days (Monday to Saturday) are packaged and dispatched same-day from our Pune fulfillment hub. Orders placed after 2:00 PM are dispatched on the next business morning.
            </p>
            <h3 className="font-bold text-slate-800 text-sm pt-2">2. Estimated Delivery Windows</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Maharashtra, Gujarat, Goa:</strong> 1 to 2 business days</li>
              <li><strong>Metro Cities (Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata):</strong> 2 to 3 business days</li>
              <li><strong>Rest of India:</strong> 3 to 5 business days depending on pincode accessibility</li>
            </ul>
            <h3 className="font-bold text-slate-800 text-sm pt-2">3. Shipping Fees</h3>
            <p>
              Orders with cart subtotal of <strong>₹499 and above enjoy FREE Express Shipping</strong>. A flat shipping charge of ₹49 is applied to orders below ₹499.
            </p>
          </div>
        )}

        {activePolicy === 'returns' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-slate-900">7-Day Replacement & Refund Policy</h2>
            <p>
              We stand firmly behind the durability and functionality of all accessories sold. If you experience any problem with your order, we make replacements straightforward and transparent.
            </p>
            <h3 className="font-bold text-slate-800 text-sm pt-2">1. Eligibility for Replacement</h3>
            <p>
              You may initiate a return or replacement request within <strong>7 days</strong> of delivery under the following conditions:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Product arrived physically cracked or damaged in transit.</li>
              <li>Wrong model or color sent (e.g. received iPhone 15 Pro instead of iPhone 16 Pro).</li>
              <li>Charger or earbud is electronically defective upon arrival.</li>
            </ul>
            <h3 className="font-bold text-slate-800 text-sm pt-2">2. Refund Processing</h3>
            <p>
              In cases where replacement stock is exhausted, refunds are initiated back to the original payment source (UPI / Card / Netbanking via Razorpay) within 24 hours of receiving the returned item. For COD orders, refund is issued via instant bank transfer (IMPS) or UPI.
            </p>
          </div>
        )}

        {activePolicy === 'privacy' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-slate-900">Privacy & Data Protection Policy</h2>
            <p>
              Radhika Mobile Accessories values customer privacy. We collect only necessary details (name, delivery address, phone number, and email) solely to process your orders, send tracking SMS notifications, and generate invoices.
            </p>
            <h3 className="font-bold text-slate-800 text-sm pt-2">Payment Security</h3>
            <p>
              We <strong>NEVER store your credit card numbers, debit card PINs, CVV codes, or UPI MPINs</strong> on our servers. All digital payments are processed through Razorpay using PCI-DSS Level 1 compliant 256-bit encrypted security protocols.
            </p>
          </div>
        )}

        {activePolicy === 'terms' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-slate-900">Terms of Service</h2>
            <p>
              By accessing the Radhika Mobile Accessories website or purchasing from our online catalog, you agree to comply with our terms and applicable laws of India.
            </p>
            <h3 className="font-bold text-slate-800 text-sm pt-2">Product Information & Pricing</h3>
            <p>
              All prices are listed in Indian Rupees (₹) and include applicable Goods and Services Tax (GST). We strive for absolute accuracy in technical compatibility descriptions; however, buyers are advised to verify exact smartphone model names prior to checkout.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
