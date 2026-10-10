import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext.js';
import { api } from '../services/api.js';
import { Order } from '../types/index.js';
import {
  User as UserIcon,
  Package,
  MapPin,
  Clock,
  LogOut,
  Compass,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const AccountPage: React.FC = () => {
  const { user, logout, navigateTo, loginDemoCustomer, setIsAuthModalOpen, setAuthModalMode } = useShop();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    async function loadUserOrders() {
      if (!user) return;
      setLoadingOrders(true);
      try {
        const all = await api.getOrders(user.id);
        setOrders(all);
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setLoadingOrders(false);
      }
    }
    loadUserOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-3xl flex items-center justify-center mx-auto">
          <UserIcon className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Please Sign In</h2>
        <p className="text-xs text-slate-500">
          Sign in to view your orders, live shipment tracking, and saved delivery addresses.
        </p>
        <div className="space-y-2">
          <button
            onClick={() => {
              setAuthModalMode('login');
              setIsAuthModalOpen(true);
            }}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md"
          >
            Sign In with Email
          </button>
          <button
            onClick={loginDemoCustomer}
            className="w-full py-3 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs rounded-xl border border-purple-200"
          >
            Instant Demo Customer Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Account Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white font-black text-2xl flex items-center justify-center shadow-lg">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">{user.name}</h1>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 uppercase">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
            {user.phone && <p className="text-xs text-slate-500">{user.phone}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user.role === 'ADMIN' && (
            <button
              onClick={() => navigateTo('admin')}
              className="px-4 py-2.5 rounded-xl bg-purple-950 text-purple-200 font-bold text-xs hover:bg-purple-900 transition-colors"
            >
              👑 Go to Admin Dashboard
            </button>
          )}
          <button
            onClick={logout}
            className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 font-bold text-xs hover:bg-rose-50 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Orders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Recent Orders</h2>
            <p className="text-xs text-slate-500">Track and review previous accessories purchases</p>
          </div>
        </div>

        {loadingOrders ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl border border-slate-100 text-center space-y-3">
            <Package className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No orders placed yet</p>
            <button
              onClick={() => navigateTo('shop')}
              className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs"
            >
              Browse Accessories
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 hover:border-purple-200 transition-colors"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-slate-900">
                        {ord.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                          ord.status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'SHIPPED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-base font-black text-slate-900">
                      ₹{ord.totalAmount.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => navigateTo('track', { orderNumber: ord.orderNumber })}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center gap-1 transition-colors"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Track Shipment</span>
                    </button>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {ord.items.map((it) => (
                    <div key={it.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={it.productImage || 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=200&q=80'}
                          alt={it.productName}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-800 line-clamp-1">{it.productName}</p>
                          <p className="text-[10px] text-slate-400">Qty: {it.quantity}</p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900 shrink-0">
                        ₹{it.total.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer notes */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap justify-between text-[11px] text-slate-500">
                  <span>Courier: {ord.courierPartner} (AWB: {ord.trackingNumber})</span>
                  <span>Payment: {ord.paymentMethod} ({ord.paymentStatus})</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
