import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext.js';
import { api } from '../services/api.js';
import { Order } from '../types/index.js';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Compass,
  MapPin,
  Calendar,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const TrackOrderPage: React.FC = () => {
  const { trackOrderNumber, navigateTo } = useShop();

  const [inputOrderNumber, setInputOrderNumber] = useState(trackOrderNumber || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchTrack = async (num: string) => {
    if (!num.trim()) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await api.trackOrder(num.trim());
      setOrder(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'No order found with this tracking number');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trackOrderNumber) {
      setInputOrderNumber(trackOrderNumber);
      fetchTrack(trackOrderNumber);
    }
  }, [trackOrderNumber]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTrack(inputOrderNumber);
  };

  const getStepIndex = (status: Order['status']) => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'PROCESSING':
        return 1;
      case 'SHIPPED':
        return 2;
      case 'DELIVERED':
        return 4;
      case 'CANCELLED':
        return -1;
      default:
        return 1;
    }
  };

  const milestones = [
    { title: 'Order Placed', desc: 'Received in system' },
    { title: 'Processing & Quality Check', desc: 'Packed at Pune fulfillment hub' },
    { title: 'Dispatched via Courier', desc: 'Handed over to delivery partner' },
    { title: 'Out for Delivery', desc: 'Arriving at local delivery center' },
    { title: 'Delivered', desc: 'Handed to customer' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-2">
          <Compass className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Track Your Shipment
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Enter your Radhika order ID (e.g. RMA-2025-7821) to check live status and courier tracking
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              required
              value={inputOrderNumber}
              onChange={(e) => setInputOrderNumber(e.target.value)}
              placeholder="Enter Order ID e.g. RMA-2025-7821"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm font-mono font-bold uppercase focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm rounded-2xl shadow-md transition-all shrink-0"
          >
            {loading ? 'Searching...' : 'Track Package'}
          </button>
        </form>

        {/* Quick sample IDs to click */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <span>Sample Order IDs:</span>
          {['RMA-2025-7821', 'RMA-2025-8392', 'RMA-2025-9104'].map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setInputOrderNumber(id);
                fetchTrack(id);
              }}
              className="font-mono text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg hover:bg-purple-100"
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-semibold">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tracking Result Card */}
      {order && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-lg space-y-8 animate-in fade-in duration-300">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-mono font-black text-slate-900">
                  {order.orderNumber}
                </span>
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    order.status === 'DELIVERED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : order.status === 'SHIPPED'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Placed on{' '}
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-slate-400 block">Courier Partner</span>
              <span className="text-sm font-bold text-slate-800 flex items-center sm:justify-end gap-1">
                <Truck className="w-4 h-4 text-purple-600" />
                {order.courierPartner} (AWB: {order.trackingNumber})
              </span>
            </div>
          </div>

          {/* Timeline Visual Progress */}
          <div className="space-y-6">
            <h3 className="font-bold text-sm text-slate-900">Delivery Milestones</h3>

            <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {milestones.map((m, idx) => {
                const currentIdx = getStepIndex(order.status);
                const isPassed = idx <= currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                  <div key={m.title} className="relative flex items-start gap-4">
                    <div
                      className={`absolute -left-6 sm:-left-8 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${
                        isPassed
                          ? 'bg-emerald-600 ring-4 ring-emerald-100'
                          : 'bg-slate-300'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                    </div>

                    <div>
                      <h4
                        className={`text-xs sm:text-sm font-bold ${
                          isCurrent ? 'text-purple-700 font-extrabold' : isPassed ? 'text-slate-900' : 'text-slate-400'
                        }`}
                      >
                        {m.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">{m.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Package Details & Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl space-y-1.5">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">
                Destination Address
              </span>
              <p className="font-bold text-slate-900">{order.shippingAddress.fullName}</p>
              <p className="text-slate-600">{order.shippingAddress.street}</p>
              <p className="text-slate-600">
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </p>
              <p className="text-slate-600">Phone: {order.shippingAddress.phone}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">
                Items in Package
              </span>
              <div className="space-y-2">
                {order.items.map((it) => (
                  <div key={it.id} className="flex justify-between items-center">
                    <span className="text-slate-800 font-medium truncate max-w-[180px]">
                      {it.productName} (x{it.quantity})
                    </span>
                    <span className="font-bold text-slate-900">₹{it.total.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-slate-900">
                <span>Total Amount:</span>
                <span className="text-purple-700">₹{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
