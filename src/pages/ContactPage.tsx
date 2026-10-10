import React, { useState } from 'react';
import { useShop } from '../context/ShopContext.js';
import { api } from '../services/api.js';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageSquare,
  CheckCircle2,
  ExternalLink,
  Store,
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { showToast } = useShop();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Product / Compatibility Inquiry');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.submitContact({
        name,
        email,
        phone,
        subject,
        message,
      });
      setSubmitted(true);
      showToast('Thank you! Your message has been received by our store team.', 'success');
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit inquiry', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Contact Radhika Mobile Accessories
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Have a question about phone compatibility, bulk orders, or order status? We&apos;re here to help!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Store Info & Location Map Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h2 className="text-lg font-black text-slate-900 pb-3 border-b border-slate-100">
              Official Shop Details
            </h2>

            <div className="space-y-4 text-xs text-slate-600">
              {/* Address */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-slate-900 text-sm font-bold">Shop Address</strong>
                  <p className="text-slate-700 mt-0.5 font-medium leading-relaxed">
                    Market Road, Opposite to the Current Office, Bhadrachalam
                  </p>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Market+Road+Opposite+Current+Office+Bhadrachalam"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-purple-700 hover:text-purple-900 font-bold mt-1.5 underline"
                  >
                    <span>Open Address on Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Opening Hours */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-slate-900 text-sm font-bold">Store Hours</strong>
                  <p className="text-slate-800 mt-0.5 font-bold text-xs">
                    Open Daily: 9:00 AM – 10:00 PM
                  </p>
                  <span className="text-[11px] text-slate-500">Every day (Monday to Sunday)</span>
                </div>
              </div>

              {/* Phone Numbers with tel: */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-slate-900 text-sm font-bold">Phone Numbers (Direct Call)</strong>
                  <div className="mt-1 flex flex-col gap-1">
                    <a
                      href="tel:7207126270"
                      className="text-slate-800 hover:text-pink-600 font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
                    >
                      <span className="text-purple-600 font-extrabold">Primary:</span>
                      <span>7207126270</span>
                    </a>
                    <a
                      href="tel:9492456210"
                      className="text-slate-800 hover:text-pink-600 font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
                    >
                      <span className="text-purple-600 font-extrabold">Secondary:</span>
                      <span>9492456210</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Email with mailto: */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-slate-900 text-sm font-bold">Official Email</strong>
                  <a
                    href="mailto:rk00614005@gmail.com"
                    className="text-blue-700 hover:text-blue-900 font-medium text-xs mt-0.5 block underline break-all"
                  >
                    rk00614005@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <a
                href="https://wa.me/917207126270?text=Hello%20Radhika%20Mobile%20Accessories"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <span>WhatsApp (7207126270)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href="tel:7207126270"
                className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Primary Phone</span>
              </a>
            </div>
          </div>

          {/* Google Maps Location Card */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                <Store className="w-4 h-4" />
                <span>Shop Location</span>
              </span>
              <span className="text-[11px] text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full font-semibold">
                Open Daily: 9:00 AM – 10:00 PM
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-3">
              <div>
                <p className="font-extrabold text-sm text-white">Radhika Mobile Accessories</p>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Market Road, Opposite to the Current Office, Bhadrachalam
                </p>
              </div>

              <div className="pt-2 border-t border-slate-700 flex flex-col sm:flex-row gap-2">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Market+Road+Opposite+Current+Office+Bhadrachalam"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <MapPin className="w-3.5 h-3.5 text-white" />
                  <span>Search on Google Maps</span>
                  <ExternalLink className="w-3 h-3 text-white/80" />
                </a>

                <a
                  href="tel:9492456210"
                  className="py-2.5 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call 9492456210</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Contact Form */}
        <div className="lg:col-span-7">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Send Us a Message</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                We typically reply within 2 to 4 business hours
              </p>
            </div>

            {submitted ? (
              <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="font-bold text-base text-emerald-900">Message Received!</h3>
                <p className="text-xs text-emerald-700 max-w-sm mx-auto">
                  Our customer support representative from Radhika Mobile Accessories will review your inquiry and get in touch shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh Kulkarni"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number (India)</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Inquiry Subject</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-500 outline-none font-medium"
                    >
                      <option value="Product / Compatibility Inquiry">Product / Model Compatibility</option>
                      <option value="Order Tracking Status">Order &amp; Delivery Tracking</option>
                      <option value="Bulk / Corporate Shop Inquiry">Bulk / Wholesale Purchase</option>
                      <option value="Return or Replacement Request">Return or Replacement Request</option>
                      <option value="Feedback / Other">Store Feedback</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Message *</label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide details about your phone model or specific requirement..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  {submitting ? (
                    <span>Submitting Message...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Inquiry to Store Team</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
