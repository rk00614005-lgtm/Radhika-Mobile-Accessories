import React, { useState } from 'react';
import { X, ShieldCheck, Smartphone, CreditCard, Building2, Wallet, CheckCircle2, Lock } from 'lucide-react';

interface RazorpayModalProps {
  isOpen: boolean;
  amount: number;
  orderId?: string;
  keyId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onSuccess: (paymentId: string, orderId?: string, signature?: string) => void;
  onClose: () => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  isOpen,
  amount,
  orderId,
  keyId = 'rzp_test_RadhikaMobileStore',
  customerName,
  customerEmail,
  customerPhone,
  onSuccess,
  onClose,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking' | 'wallet'>('upi');
  const [upiId, setUpiId] = useState('user@okaxis');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const testPaymentId = `pay_rzp_test_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
      onSuccess(testPaymentId, orderId);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Razorpay Brand Header */}
        <div className="bg-[#0c2340] text-white p-5 flex items-center justify-between border-b border-blue-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-lg tracking-wider shadow">
              R
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-wide">Razorpay Trusted Checkout</span>
                <span className="text-[10px] bg-blue-500/30 text-blue-300 px-1.5 py-0.2 rounded font-bold uppercase">
                  Test Mode
                </span>
              </div>
              <p className="text-xs text-blue-200">Paying Radhika Mobile Accessories</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="text-[10px] text-blue-300 block">Total Payable</span>
              <span className="text-lg font-black text-white">₹{amount.toLocaleString('en-IN')}</span>
            </div>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="ml-2 text-blue-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Test Notice banner */}
        <div className="bg-amber-50 px-4 py-2 border-b border-amber-200 flex items-center gap-2 text-xs text-amber-800">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Sandbox Test Mode:</strong> Simulated secure gateway. No real money will be charged.
          </span>
        </div>

        {/* Payment Methods Sidebar + Body */}
        <div className="flex flex-col sm:flex-row min-h-[300px]">
          {/* Method tabs */}
          <div className="w-full sm:w-44 bg-slate-50 border-r border-slate-100 p-2 flex sm:flex-col gap-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => setSelectedMethod('upi')}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-bold transition-all text-left w-full ${
                selectedMethod === 'upi'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>UPI / QR</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod('card')}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-bold transition-all text-left w-full ${
                selectedMethod === 'card'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Cards</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod('netbanking')}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-bold transition-all text-left w-full ${
                selectedMethod === 'netbanking'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>NetBanking</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod('wallet')}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-bold transition-all text-left w-full ${
                selectedMethod === 'wallet'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Wallets</span>
            </button>
          </div>

          {/* Form details */}
          <div className="flex-1 p-5 flex flex-col justify-between">
            {selectedMethod === 'upi' && (
              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-700">Choose Instant UPI Application:</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 border border-purple-200 rounded-xl bg-purple-50/50 text-center cursor-pointer hover:border-purple-500">
                    <span className="text-xs font-bold text-purple-700 block">Google Pay</span>
                    <span className="text-[10px] text-slate-500">Fast UPI</span>
                  </div>
                  <div className="p-2.5 border border-indigo-200 rounded-xl bg-indigo-50/50 text-center cursor-pointer hover:border-indigo-500">
                    <span className="text-xs font-bold text-indigo-700 block">PhonePe</span>
                    <span className="text-[10px] text-slate-500">Fast UPI</span>
                  </div>
                  <div className="p-2.5 border border-sky-200 rounded-xl bg-sky-50/50 text-center cursor-pointer hover:border-sky-500">
                    <span className="text-xs font-bold text-sky-700 block">Paytm</span>
                    <span className="text-[10px] text-slate-500">UPI / Wallet</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Or enter any Virtual Payment Address (VPA)</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="mobile@upi"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            )}

            {selectedMethod === 'card' && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-700">Test Debit / Credit Card (Simulated):</p>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-0.5">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-0.5">Expiry</label>
                    <input
                      type="text"
                      value={cardExp}
                      onChange={(e) => setCardExp(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-0.5">CVV</label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedMethod === 'netbanking' && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-700">Select Popular Indian Bank:</p>
                <div className="grid grid-cols-2 gap-2">
                  {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'].map((b) => (
                    <div
                      key={b}
                      className="p-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-medium text-slate-700 hover:border-blue-500 cursor-pointer text-center"
                    >
                      {b}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedMethod === 'wallet' && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-700">Supported Wallets:</p>
                <div className="grid grid-cols-2 gap-2">
                  {['Amazon Pay Balance', 'Mobikwik', 'JioMoney', 'Freecharge'].map((w) => (
                    <div
                      key={w}
                      className="p-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-medium text-slate-700 hover:border-blue-500 cursor-pointer text-center"
                    >
                      {w}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pay Button */}
            <div className="pt-4 border-t border-slate-100 mt-4">
              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={isProcessing}
                className="w-full py-3 bg-[#0c2340] hover:bg-[#133560] text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-75"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authorizing with Bank...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span>Pay ₹{amount.toLocaleString('en-IN')} (Test Mode)</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 mt-2.5 text-[10px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>PCI-DSS Level 1 Compliant • 256-bit Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
