import React, { useState } from 'react';
import { useShop } from '../context/ShopContext.js';
import { api } from '../services/api.js';
import { RazorpayModal } from '../components/RazorpayModal.js';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  CheckCircle2,
  Lock,
  ArrowRight,
  MapPin,
  Sparkles,
  Package,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    subtotal,
    discount,
    shippingFee,
    total,
    appliedCoupon,
    clearCart,
    user,
    navigateTo,
    showToast,
    lastCompletedOrder,
    setLastCompletedOrder,
  } = useShop();

  // Address & Customer State
  const [fullName, setFullName] = useState(user?.name || 'Rahul Verma');
  const [email, setEmail] = useState(user?.email || 'rahul@example.com');
  const [phone, setPhone] = useState(user?.phone || '+91 98234 56789');
  const [street, setStreet] = useState('Flat 402, Sunshine Heights, Baner Road');
  const [landmark, setLandmark] = useState('Near Balewadi High Street');
  const [city, setCity] = useState('Pune');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('411045');
  const [orderNotes, setOrderNotes] = useState('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'COD'>('RAZORPAY');
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // If cart is empty and no completed order, redirect
  if (cart.length === 0 && !lastCompletedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Your cart is empty</h2>
        <p className="text-sm text-slate-500">Please add mobile accessories to your cart before proceeding to checkout.</p>
        <button
          onClick={() => navigateTo('shop')}
          className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-sm"
        >
          Browse Shop Catalog
        </button>
      </div>
    );
  }

  // Success Confirmation Screen
  if (lastCompletedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8 animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              ORDER PLACED SUCCESSFULLY
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Thank You for Your Order!
            </h1>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Your order is confirmed and will be dispatched from our Pune fulfillment hub within 24 hours.
            </p>
          </div>

          {/* Order Details Card */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 text-left space-y-3 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="font-bold text-slate-500">Order ID:</span>
              <span className="font-mono font-black text-sm text-purple-700">
                {lastCompletedOrder.orderNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tracking Number:</span>
              <span className="font-semibold text-slate-800">
                {lastCompletedOrder.trackingNumber} ({lastCompletedOrder.courierPartner})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Status:</span>
              <span className="font-bold text-emerald-600 uppercase">
                {lastCompletedOrder.paymentMethod} • {lastCompletedOrder.paymentStatus}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Estimated Delivery:</span>
              <span className="font-semibold text-slate-800">
                {lastCompletedOrder.estimatedDelivery}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-black">
              <span>Total Paid:</span>
              <span className="text-slate-900">₹{lastCompletedOrder.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => {
                const ordNo = lastCompletedOrder.orderNumber;
                setLastCompletedOrder(null);
                navigateTo('track', { orderNumber: ordNo });
              }}
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
            >
              <Package className="w-4 h-4" />
              <span>Track Live Delivery Status</span>
            </button>

            <button
              onClick={() => {
                setLastCompletedOrder(null);
                navigateTo('home');
              }}
              className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Trigger celebratory confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // fallback
    }
  };

  // Active Razorpay Order State from Server
  const [activeRazorpayOrderId, setActiveRazorpayOrderId] = useState<string>('');
  const [activeRazorpayKeyId, setActiveRazorpayKeyId] = useState<string>('');
  const [serverVerifiedTotal, setServerVerifiedTotal] = useState<number>(total);

  // Place Order Handler
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phone.trim() || !street.trim() || !pincode.trim()) {
      showToast('Please fill all mandatory shipping address fields', 'error');
      return;
    }

    if (paymentMethod === 'RAZORPAY') {
      setIsPlacingOrder(true);
      try {
        // Step 1: Create server-side Razorpay order with trusted price validation
        const rzpResponse = await api.createRazorpayOrder({
          items: cart.map((it) => ({
            productId: it.product.id,
            quantity: it.quantity,
          })),
          couponCode: appliedCoupon?.code,
          customerName: fullName,
          customerEmail: email,
          customerPhone: phone,
        });

        setActiveRazorpayOrderId(rzpResponse.orderId);
        setActiveRazorpayKeyId(rzpResponse.keyId);
        if (rzpResponse.amountInRupees) {
          setServerVerifiedTotal(rzpResponse.amountInRupees);
        }
        setIsRazorpayModalOpen(true);
      } catch (err: any) {
        showToast(err.message || 'Failed to initialize Razorpay test payment order', 'error');
      } finally {
        setIsPlacingOrder(false);
      }
      return;
    }

    // Cash on Delivery direct placement
    await completeOrderPlacement('COD', undefined, undefined);
  };

  const completeOrderPlacement = async (
    method: 'RAZORPAY' | 'COD' | 'UPI',
    rzpOrderId?: string,
    rzpPaymentId?: string,
    rzpSignature?: string
  ) => {
    setIsPlacingOrder(true);
    try {
      // If Razorpay, verify signature on backend server first
      if (method === 'RAZORPAY' && rzpOrderId && rzpPaymentId) {
        await api.verifyRazorpayPayment({
          razorpayOrderId: rzpOrderId,
          razorpayPaymentId: rzpPaymentId,
          razorpaySignature: rzpSignature,
        });
      }

      const orderPayload = {
        userId: user?.id,
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          selectedColor: item.selectedColor,
        })),
        shippingAddress: {
          fullName,
          phone,
          street,
          landmark,
          city,
          state,
          pincode,
        },
        paymentMethod: method,
        couponCode: appliedCoupon?.code,
        notes: orderNotes,
        razorpayOrderId: rzpOrderId,
        razorpayPaymentId: rzpPaymentId,
      };

      const newOrder = await api.createOrder(orderPayload);
      clearCart();
      setLastCompletedOrder(newOrder);
      triggerConfetti();
      showToast('Order confirmed! Tracking ID created.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to place order', 'error');
    } finally {
      setIsPlacingOrder(false);
      setIsRazorpayModalOpen(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Checkout</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Enter delivery address and select preferred payment method
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Shipping Address Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <MapPin className="w-5 h-5 text-purple-600" />
              <h2 className="font-bold text-base text-slate-900">1. Delivery Address (India)</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Recipient Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Verma"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number (For Courier SMS) *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address (For Invoices) *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Flat / House No. & Street Address *</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Flat 402, Sunshine Heights, Baner Road"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Landmark (Optional)</label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Near Balewadi High Street"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Pune"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">State *</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Maharashtra"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pincode (6 Digits) *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="411045"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Notes (Optional)</label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="e.g. Ring the bell twice or call before arriving"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <CreditCard className="w-5 h-5 text-purple-600" />
              <h2 className="font-bold text-base text-slate-900">2. Select Payment Option</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Razorpay Online */}
              <div
                onClick={() => setPaymentMethod('RAZORPAY')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'RAZORPAY'
                    ? 'border-purple-600 bg-purple-50/60 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-sm text-slate-900">Razorpay Online</span>
                  <div className="w-4 h-4 rounded-full border-2 border-purple-600 flex items-center justify-center p-0.5">
                    {paymentMethod === 'RAZORPAY' && (
                      <div className="w-full h-full bg-purple-600 rounded-full" />
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal mb-2">
                  UPI (GPay / PhonePe / Paytm), Debit/Credit Cards, Netbanking, &amp; Wallets.
                </p>
                <span className="inline-block text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  Instant Dispatch
                </span>
              </div>

              {/* Cash on Delivery */}
              <div
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-purple-600 bg-purple-50/60 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-sm text-slate-900">Cash on Delivery</span>
                  <div className="w-4 h-4 rounded-full border-2 border-purple-600 flex items-center justify-center p-0.5">
                    {paymentMethod === 'COD' && (
                      <div className="w-full h-full bg-purple-600 rounded-full" />
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal mb-2">
                  Pay cash or scan courier QR upon parcel arrival at your doorstep.
                </p>
                <span className="inline-block text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                  COD Available
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Order Summary */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
            <h2 className="text-base font-black text-slate-900 pb-3 border-b border-slate-100">
              Review Items ({cart.length})
            </h2>

            {/* Compact items list */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3 text-xs">
                  <img
                    src={item.product.images[0]?.url}
                    alt={item.product.name}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 truncate">{item.product.name}</p>
                    <p className="text-[11px] text-slate-400">
                      Qty: {item.quantity} {item.selectedColor ? `• ${item.selectedColor}` : ''}
                    </p>
                  </div>
                  <span className="font-black text-slate-900 shrink-0">
                    ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial breakdown */}
            <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span>-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Charges</span>
                <span className="font-bold">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    `₹${shippingFee}`
                  )}
                </span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between text-lg font-black text-slate-900">
                <span>Total Payable</span>
                <span className="text-purple-700">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={isPlacingOrder}
              className="w-full py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:to-pink-700 text-white font-extrabold text-sm rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-75"
            >
              {isPlacingOrder ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing Your Order...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>
                    {paymentMethod === 'RAZORPAY'
                      ? `Pay ₹${total.toLocaleString('en-IN')} via Razorpay`
                      : `Confirm Cash on Delivery (₹${total.toLocaleString('en-IN')})`}
                  </span>
                </>
              )}
            </button>

            <div className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Encrypted with SSL • 100% Secure Checkout Guarantee</span>
            </div>
          </div>
        </div>
      </form>

      {/* Razorpay Simulated Test Modal */}
      <RazorpayModal
        isOpen={isRazorpayModalOpen}
        amount={serverVerifiedTotal}
        orderId={activeRazorpayOrderId}
        keyId={activeRazorpayKeyId}
        customerName={fullName}
        customerEmail={email}
        customerPhone={phone}
        onClose={() => setIsRazorpayModalOpen(false)}
        onSuccess={(paymentId, rzpOrdId, signature) => {
          completeOrderPlacement(
            'RAZORPAY',
            rzpOrdId || activeRazorpayOrderId,
            paymentId,
            signature
          );
        }}
      />
    </div>
  );
};
