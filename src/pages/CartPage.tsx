import React, { useState } from 'react';
import { useShop } from '../context/ShopContext.js';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Tag,
  Truck,
  Sparkles,
  CheckCircle2,
  X,
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    subtotal,
    discount,
    shippingFee,
    total,
    freeShippingThreshold,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    navigateTo,
  } = useShop();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [applying, setApplying] = useState(false);

  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    setApplying(true);
    await applyCoupon(couponCodeInput.trim());
    setApplying(false);
    setCouponCodeInput('');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Your Shopping Cart is Empty
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Explore our collection of protective armor phone cases, 65W GaN chargers, 9H tempered glass, and audio accessories.
        </p>
        <button
          onClick={() => navigateTo('shop')}
          className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-extrabold text-sm shadow-lg hover:shadow-purple-500/25 transition-all inline-flex items-center gap-2"
        >
          <span>Explore Mobile Accessories</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Shopping Cart</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Review your items before proceeding to secure checkout
        </p>
      </div>

      {/* Free Shipping Progress Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <Truck className="w-4 h-4 text-purple-600" />
            {amountNeededForFreeShipping === 0 ? (
              <span className="text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Congratulations! You unlocked FREE Express Delivery across India!
              </span>
            ) : (
              <span>
                Add <strong className="text-pink-600">₹{amountNeededForFreeShipping}</strong> more for{' '}
                <strong>FREE Express Delivery</strong>!
              </span>
            )}
          </div>
          <span className="text-[11px] font-extrabold text-slate-500">{freeShippingProgress}%</span>
        </div>

        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full transition-all duration-500"
            style={{ width: `${freeShippingProgress}%` }}
          />
        </div>
      </div>

      {/* Cart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Line Items List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
            {cart.map((item) => (
              <div
                key={item.product.id}
                className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 hover:bg-slate-50/50 transition-colors"
              >
                {/* Image */}
                <img
                  src={item.product.images[0]?.url}
                  alt={item.product.name}
                  onClick={() => navigateTo('product', { productId: item.product.id })}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover bg-slate-100 shrink-0 cursor-pointer"
                />

                {/* Info */}
                <div className="flex-1 space-y-1 text-center sm:text-left">
                  <span className="text-[10px] font-bold uppercase text-purple-700 tracking-wider">
                    {item.product.brand}
                  </span>
                  <h3
                    onClick={() => navigateTo('product', { productId: item.product.id })}
                    className="text-sm sm:text-base font-bold text-slate-900 cursor-pointer hover:text-purple-600 transition-colors line-clamp-2"
                  >
                    {item.product.name}
                  </h3>
                  {item.selectedColor && (
                    <p className="text-xs text-slate-500">
                      Color: <strong className="text-slate-700">{item.selectedColor}</strong>
                    </p>
                  )}
                  <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                    <span className="text-base font-black text-slate-900">
                      ₹{item.product.price.toLocaleString('en-IN')}
                    </span>
                    {item.product.originalPrice > item.product.price && (
                      <span className="text-xs text-slate-400 line-through">
                        ₹{item.product.originalPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls & Delete */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3">
                  <div className="flex items-center border border-slate-200 rounded-xl bg-white p-0.5">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 transition-colors"
                    title="Remove item"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-xs">
            <button
              onClick={() => navigateTo('shop')}
              className="text-purple-700 font-bold hover:underline"
            >
              ← Continue Shopping Accessories
            </button>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h2 className="text-lg font-black text-slate-900 tracking-tight pb-3 border-b border-slate-100">
              Order Summary
            </h2>

            {/* Coupon Code Section */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-purple-600" />
                <span>Apply Store Coupon / Promo</span>
              </label>

              {appliedCoupon ? (
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-extrabold text-purple-800 tracking-wider">
                      {appliedCoupon.code}
                    </span>
                    <span className="text-[10px] text-purple-600 block">
                      {appliedCoupon.description}
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Remove coupon"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                    placeholder="e.g. WELCOME10"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs uppercase font-mono font-bold outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="submit"
                    disabled={applying}
                    className="px-4 py-2 bg-slate-900 hover:bg-purple-900 text-white font-bold text-xs rounded-xl transition-colors"
                  >
                    {applying ? '...' : 'Apply'}
                  </button>
                </form>
              )}

              {/* Recommended Coupons pills */}
              {!appliedCoupon && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {['WELCOME10', 'RADHIKA50', 'FREESHIP'].map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => applyCoupon(code)}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-purple-100 text-purple-700 text-[10px] font-bold border border-slate-200"
                    >
                      + {code}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Subtotal ({cart.length} unique items)</span>
                <span className="font-bold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span className="font-bold">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 font-extrabold uppercase">FREE</span>
                  ) : (
                    <span>₹{shippingFee}</span>
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between text-base font-black text-slate-900">
                <span>Total Amount</span>
                <span className="text-purple-700">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => navigateTo('checkout')}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:to-pink-700 text-white font-extrabold text-sm rounded-2xl shadow-xl hover:shadow-pink-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Security Note */}
            <div className="pt-2 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Razorpay Verified Gateway • 100% Buyer Protection</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
