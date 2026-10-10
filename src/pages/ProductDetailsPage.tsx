import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext.js';
import { api } from '../services/api.js';
import { Product, Review } from '../types/index.js';
import { ProductCard } from '../components/ProductCard.js';
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Heart,
  ShoppingBag,
  Zap,
  Check,
  ChevronRight,
  MapPin,
  Clock,
  MessageSquare,
  Sparkles,
  Phone,
} from 'lucide-react';

export const ProductDetailsPage: React.FC = () => {
  const { selectedProductId, addToCart, toggleWishlist, isInWishlist, navigateTo, showToast } = useShop();

  const [product, setProduct] = useState<(Product & { related: Product[]; reviews: Review[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('411001');
  const [pincodeChecked, setPincodeChecked] = useState(false);

  // Review form state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      if (!selectedProductId) return;
      setLoading(true);
      try {
        const data = await api.getProductById(selectedProductId);
        setProduct(data);
        if (data.colors && data.colors.length > 0) {
          setSelectedColor(data.colors[0]);
        }
      } catch (e) {
        console.error('Failed to load product details', e);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedProductId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 font-semibold text-sm">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-slate-500 text-sm">The requested mobile accessory is unavailable or has been relocated.</p>
        <button
          onClick={() => navigateTo('shop')}
          className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-sm"
        >
          Return to Shop Catalog
        </button>
      </div>
    );
  }

  const isWish = isInWishlist(product.id);
  const savings = Math.max(0, product.originalPrice - product.price);

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedColor);
    navigateTo('checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) {
      showToast('Please provide your name and review details', 'error');
      return;
    }
    setSubmittingReview(true);
    try {
      const newRev = await api.addReview(product.id, {
        userName: reviewerName,
        rating: reviewRating,
        title: reviewTitle || 'Verified Customer Review',
        comment: reviewComment,
      });
      setProduct((prev) => (prev ? { ...prev, reviews: [newRev, ...prev.reviews] } : null));
      showToast('Thank you! Your verified review has been published.', 'success');
      setIsReviewModalOpen(false);
      setReviewComment('');
      setReviewTitle('');
    } catch (e: any) {
      showToast(e.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      {/* Breadcrumb */}
      <div className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
        <button onClick={() => navigateTo('home')} className="hover:text-purple-600">Home</button>
        <span>/</span>
        <button onClick={() => navigateTo('shop')} className="hover:text-purple-600">Accessories</button>
        <span>/</span>
        <button
          onClick={() => navigateTo('shop', { category: product.categoryId })}
          className="hover:text-purple-600 font-semibold"
        >
          {product.categoryName}
        </button>
        <span>/</span>
        <span className="text-slate-900 font-bold truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-50 border border-slate-200/80 shadow-sm group">
            <img
              src={product.images[selectedImageIdx]?.url || product.images[0]?.url || 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80'}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80';
              }}
            />
            {product.discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-gradient-to-r from-pink-600 to-rose-500 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-md">
                {product.discountPercent}% OFF
              </span>
            )}
            <button
              onClick={() => toggleWishlist(product)}
              className={`absolute top-4 right-4 p-2.5 rounded-full transition-all ${
                isWish
                  ? 'bg-rose-50 text-rose-600 shadow-md scale-105'
                  : 'bg-white/90 text-slate-400 hover:text-rose-600 shadow-sm'
              }`}
            >
              <Heart className={`w-5 h-5 ${isWish ? 'fill-rose-600' : ''}`} />
            </button>
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {product.images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImageIdx === idx
                      ? 'border-purple-600 ring-2 ring-purple-200 scale-105 shadow-sm'
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <img
                    src={img.url}
                    alt="Thumbnail"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Pricing & Purchase Controls */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-black uppercase text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md tracking-wider">
                {product.brand}
              </span>
              <span className="text-xs text-slate-400">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Rating overview */}
            <div className="flex items-center gap-3 mt-2.5">
              <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg text-amber-700 font-extrabold text-xs">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
              </div>
              <span className="text-xs text-slate-500">
                Based on <strong>{product.reviewCount}</strong> customer ratings
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> 100% Genuine
              </span>
            </div>
          </div>

          {/* Price Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50/70 via-pink-50/50 to-white border border-purple-100 space-y-1.5">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-base text-slate-400 line-through">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              {savings > 0 && (
                <span className="text-xs font-bold text-pink-700 bg-pink-100 px-2.5 py-0.5 rounded-full">
                  You Save ₹{savings.toLocaleString('en-IN')} ({product.discountPercent}%)
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Inclusive of all taxes. Free Express Pan-India delivery on orders above ₹499.
            </p>
          </div>

          {/* Short description */}
          <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>

          {/* Color variant picker */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Select Color / Finish: <span className="text-purple-700">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                      selectedColor === c
                        ? 'bg-purple-900 text-white border-purple-900 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Stock */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Quantity</span>
              {product.stock > 0 ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  In Stock ({product.stock} units ready in Pune warehouse)
                </span>
              ) : (
                <span className="text-rose-600 font-bold">Currently Sold Out</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center border border-slate-200 rounded-xl bg-white p-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100"
                >
                  -
                </button>
                <span className="w-10 text-center font-extrabold text-sm text-slate-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100"
                >
                  +
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex-1 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => addToCart(product, quantity, selectedColor)}
                  disabled={!product.inStock}
                  className="py-3 px-4 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={!product.inStock}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Zap className="w-4 h-4 text-yellow-300" />
                  <span>Buy Now</span>
                </button>
              </div>
            </div>

            {/* Direct WhatsApp Product Enquiry & Phone Support */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <a
                href={`https://wa.me/919492456210?text=${encodeURIComponent(
                  `Hello Radhika Mobile Accessories, I have an enquiry regarding "${product.name}" (Price: ₹${product.price}). Is it in stock at your Bhadrachalam shop? Product link: ${window.location.origin}/?product=${product.id}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.004c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>WhatsApp Enquiry (+91 9492456210)</span>
              </a>
              <a
                href="tel:9492456210"
                className="py-2.5 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Call Shop</span>
              </a>
            </div>
          </div>

          {/* Delivery Pincode Checker */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-purple-600" />
                <span>Check Delivery Speed to Your Pincode</span>
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={pincode}
                onChange={(e) => {
                  setPincode(e.target.value);
                  setPincodeChecked(false);
                }}
                maxLength={6}
                placeholder="Enter 6-digit Pincode"
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs w-44 font-semibold outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={() => setPincodeChecked(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-purple-900 text-white font-bold text-xs rounded-xl"
              >
                Check
              </button>
            </div>

            {pincodeChecked && (
              <div className="text-xs text-emerald-700 font-medium flex items-center gap-1.5 pt-1">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>
                  Delivery available to <strong>{pincode}</strong> in 2–3 business days via BlueDart!
                </span>
              </div>
            )}
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-[11px] text-slate-600">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <Truck className="w-4 h-4 text-purple-600 mx-auto mb-1" />
              <span className="font-bold block text-slate-800">Same-Day Dispatch</span>
              <span>Before 2 PM</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <RotateCcw className="w-4 h-4 text-pink-600 mx-auto mb-1" />
              <span className="font-bold block text-slate-800">7-Day Return</span>
              <span>Easy replacement</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <span className="font-bold block text-slate-800">Shop Warranty</span>
              <span>100% Genuine</span>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Specifications Table */}
      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Technical Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            {Object.entries(product.specifications).map(([key, val]) => (
              <div key={key} className="flex justify-between py-2 border-b border-slate-100 text-xs">
                <span className="text-slate-500 font-semibold">{key}</span>
                <span className="text-slate-900 font-bold text-right">{val}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Customer Reviews Section */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Customer Reviews & Ratings</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified feedback from buyers of {product.name}
            </p>
          </div>
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Write a Review</span>
          </button>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {product.reviews.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4">
              Be the first to leave a review for this accessory!
            </p>
          ) : (
            product.reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{rev.userName}</span>
                    {rev.isVerifiedPurchase && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                      />
                    ))}
                  </div>
                </div>
                <h4 className="text-xs font-bold text-slate-800">{rev.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                <span className="text-[10px] text-slate-400 block">
                  {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900">Add Customer Review</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="e.g. Ramesh Kulkarni"
                  className="w-full border rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Star Rating</label>
                <div className="flex gap-2 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-1"
                    >
                      <Star
                        className={`w-6 h-6 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Review Headline</label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="e.g. Superb build quality!"
                  className="w-full border rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Feedback</label>
                <textarea
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Tell us about the texture, fit, speed, or audio performance..."
                  className="w-full border rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="flex-1 py-2.5 border rounded-xl text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold"
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Related Products Recommendations */}
      {product.related && product.related.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Customers Also Viewed
            </h2>
            <button
              onClick={() => navigateTo('shop', { category: product.categoryId })}
              className="text-xs font-bold text-purple-700 hover:underline"
            >
              More in {product.categoryName}
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {product.related.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
