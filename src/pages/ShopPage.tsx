import React, { useState, useEffect, useMemo } from 'react';
import { useShop } from '../context/ShopContext.js';
import { api } from '../services/api.js';
import { Product, Category } from '../types/index.js';
import { ProductCard } from '../components/ProductCard.js';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Grid,
  List,
  RotateCcw,
  Star,
  Check,
  ChevronDown,
  X,
  ShoppingBag,
} from 'lucide-react';

export const ShopPage: React.FC = () => {
  const { selectedCategorySlug, navigateTo, addToCart } = useShop();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(selectedCategorySlug || '');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [priceRange, setPriceRange] = useState<number>(3000);
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('popularity');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Popular phone models for quick filtering
  const popularPhoneModels = [
    'iPhone 16 Pro Max',
    'iPhone 16 / 15',
    'Samsung S25 Ultra',
    'Samsung S24 / S23',
    'OnePlus 13 / 12',
    'Realme',
    'Redmi / Xiaomi',
    'Vivo / Oppo',
  ];

  // Sync incoming category from context
  useEffect(() => {
    if (selectedCategorySlug !== undefined) {
      setSelectedCategory(selectedCategorySlug || '');
    }
  }, [selectedCategorySlug]);

  // Listen for search event from global Navbar
  useEffect(() => {
    const handleSearch = (e: any) => {
      if (e.detail) {
        setSearchQuery(e.detail);
      }
    };
    window.addEventListener('radhika-search', handleSearch);
    return () => window.removeEventListener('radhika-search', handleSearch);
  }, []);

  // Fetch initial data
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [cats, prods] = await Promise.all([
          api.getCategories(),
          api.getProducts(),
        ]);
        setCategories(cats);
        setProducts(prods);
      } catch (e) {
        console.error('Failed to load shop products', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Available brands derived from products
  const availableBrands = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.brand).filter(Boolean)));
  }, [products]);

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedBrand('');
    setSelectedModel('');
    setPriceRange(3000);
    setMinRating(0);
    setInStockOnly(false);
    setSortBy('popularity');
  };

  // Filtered & Sorted list
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          (p.compatibility && p.compatibility.toLowerCase().includes(q)) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (selectedCategory) {
      const cat = categories.find((c) => c.slug === selectedCategory || c.id === selectedCategory);
      if (cat) {
        list = list.filter((p) => p.categoryId === cat.id);
      }
    }

    if (selectedBrand) {
      list = list.filter((p) => p.brand.toLowerCase() === selectedBrand.toLowerCase());
    }

    if (selectedModel) {
      const m = selectedModel.toLowerCase();
      list = list.filter(
        (p) =>
          (p.compatibility && p.compatibility.toLowerCase().includes(m)) ||
          p.name.toLowerCase().includes(m) ||
          p.description.toLowerCase().includes(m) ||
          p.tags.some((t) => t.toLowerCase().includes(m))
      );
    }

    list = list.filter((p) => p.price <= priceRange);

    if (minRating > 0) {
      list = list.filter((p) => p.rating >= minRating);
    }

    if (inStockOnly) {
      list = list.filter((p) => p.inStock && p.stock > 0);
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'popularity':
      default:
        list.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
    }

    return list;
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedBrand,
    selectedModel,
    categories,
    priceRange,
    minRating,
    inStockOnly,
    sortBy,
  ]);

  const activeCategoryObj = categories.find(
    (c) => c.slug === selectedCategory || c.id === selectedCategory
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Shop Header Breadcrumb & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="text-xs text-slate-500 mb-1 flex items-center gap-1.5">
            <button onClick={() => navigateTo('home')} className="hover:text-purple-600">Home</button>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Store Catalog</span>
            {activeCategoryObj && (
              <>
                <span>/</span>
                <span className="text-purple-600 font-bold">{activeCategoryObj.name}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {activeCategoryObj ? activeCategoryObj.name : 'All Mobile Accessories & Gadgets'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {activeCategoryObj?.description || 'Showing premium smartphone covers, fast chargers, cables, audio and accessories'}
          </p>
        </div>

        {/* View mode & Sort dropdown */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-xl px-3 py-2 pr-8 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="popularity">Most Popular</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest Arrivals</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>

          <div className="hidden sm:flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Desktop Sidebar Filter */}
        <aside className="hidden md:block md:col-span-3 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-sm text-slate-900">Filters</h3>
              </div>
              <button
                onClick={resetFilters}
                className="text-xs text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Live Search in catalog */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Search in Catalog</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Case, GaN, 100W, etc."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-8 pr-3 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Categories filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Category</label>
              <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                    selectedCategory === ''
                      ? 'bg-purple-100 text-purple-900 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>All Categories</span>
                  <span className="text-[10px] text-slate-400">{products.length}</span>
                </button>
                {categories.map((c) => {
                  const count = products.filter((p) => p.categoryId === c.id).length;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCategory(c.slug)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                        selectedCategory === c.slug
                          ? 'bg-purple-100 text-purple-900 font-bold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate pr-1">{c.name}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brand Filter */}
            {availableBrands.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Brand</label>
                <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                  <button
                    type="button"
                    onClick={() => setSelectedBrand('')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                      selectedBrand === ''
                        ? 'bg-purple-100 text-purple-900 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>All Brands</span>
                  </button>
                  {availableBrands.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setSelectedBrand(b)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                        selectedBrand.toLowerCase() === b.toLowerCase()
                          ? 'bg-purple-100 text-purple-900 font-bold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{b}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Phone Model Compatibility Chips */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">Phone Compatibility</label>
                {selectedModel && (
                  <button
                    onClick={() => setSelectedModel('')}
                    className="text-[10px] text-purple-600 hover:underline font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {popularPhoneModels.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedModel(selectedModel === m ? '' : m)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                      selectedModel === m
                        ? 'bg-purple-900 text-white border-purple-900 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-purple-300'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1.5">
                <span>Max Price</span>
                <span className="text-purple-700 font-extrabold">₹{priceRange.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="200"
                max="3000"
                step="50"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
                <span>₹200</span>
                <span>₹3,000+</span>
              </div>
            </div>

            {/* Minimum Rating */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Customer Rating</label>
              <div className="space-y-1">
                {[0, 4.5, 4.8].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setMinRating(rate)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                      minRating === rate ? 'bg-purple-50 text-purple-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      {rate === 0 ? (
                        'All Ratings'
                      ) : (
                        <>
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{rate}★ & Above</span>
                        </>
                      )}
                    </span>
                    {minRating === rate && <Check className="w-3.5 h-3.5 text-purple-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* In-Stock Only Toggle */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 accent-purple-600"
                />
                <span>Show in-stock items only</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Mobile Filter Slide-out Modal */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm">
            <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 max-h-[85vh] overflow-y-auto space-y-5">
              <div className="flex items-center justify-between pb-3 border-b">
                <h3 className="font-bold text-base text-slate-900">Filter Accessories</h3>
                <button onClick={() => setMobileFilterOpen(false)} className="p-1">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs font-semibold"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand (Mobile) */}
              {availableBrands.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Brand</label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs font-semibold"
                  >
                    <option value="">All Brands</option>
                    {availableBrands.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Phone Model Compatibility (Mobile) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Compatibility</label>
                <div className="flex flex-wrap gap-1.5">
                  {popularPhoneModels.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedModel(selectedModel === m ? '' : m)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-semibold border ${
                        selectedModel === m
                          ? 'bg-purple-900 text-white border-purple-900'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Max Price:</span>
                  <span className="text-purple-600 font-extrabold">₹{priceRange}</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="3000"
                  step="50"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>

              {/* Stock */}
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 accent-purple-600"
                />
                <span>In-Stock Only</span>
              </label>

              <div className="pt-3 border-t flex gap-2">
                <button
                  onClick={resetFilters}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
                >
                  Reset
                </button>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold"
                >
                  Apply Filters ({filteredProducts.length})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Grid Area */}
        <div className="md:col-span-9 space-y-6">
          {/* Active filters pill badges */}
          {(searchQuery ||
            selectedCategory ||
            selectedBrand ||
            selectedModel ||
            inStockOnly ||
            minRating > 0 ||
            priceRange < 3000) && (
            <div className="flex flex-wrap items-center gap-2 p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-xs">
              <span className="font-bold text-purple-900 text-[11px]">Active Filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-full text-slate-700 font-semibold shadow-xs">
                  Keyword: &quot;{searchQuery}&quot;
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                </span>
              )}
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-full text-purple-700 font-bold shadow-xs">
                  Category: {activeCategoryObj?.name}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory('')} />
                </span>
              )}
              {selectedBrand && (
                <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-full text-indigo-700 font-bold shadow-xs">
                  Brand: {selectedBrand}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedBrand('')} />
                </span>
              )}
              {selectedModel && (
                <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-full text-pink-700 font-bold shadow-xs">
                  Model: {selectedModel}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedModel('')} />
                </span>
              )}
              {priceRange < 3000 && (
                <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-full text-slate-700 font-semibold shadow-xs">
                  Max: ₹{priceRange}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setPriceRange(3000)} />
                </span>
              )}
              {inStockOnly && (
                <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-full text-emerald-700 font-bold shadow-xs">
                  In-Stock Only
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setInStockOnly(false)} />
                </span>
              )}
              <button
                onClick={resetFilters}
                className="text-[11px] text-purple-700 underline font-bold ml-auto"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Results count indicator */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <strong className="text-slate-800">{filteredProducts.length}</strong> matching products
            </span>
          </div>

          {/* Grid of products */}
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-500">Loading catalog items...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            /* Empty state */
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No accessories found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                We couldn&apos;t find any products matching your current filters. Try relaxing the price filter or clear your search term.
              </p>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-4">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center gap-5 hover:border-purple-200 transition-all"
                >
                  <img
                    src={p.images[0]?.url}
                    alt={p.name}
                    className="w-32 h-32 object-cover rounded-xl cursor-pointer shrink-0"
                    onClick={() => navigateTo('product', { productId: p.id })}
                  />
                  <div className="flex-1 space-y-1.5 text-center sm:text-left">
                    <span className="text-[10px] font-bold uppercase text-purple-700 tracking-wider">
                      {p.brand} • {p.categoryName}
                    </span>
                    <h3
                      onClick={() => navigateTo('product', { productId: p.id })}
                      className="text-base font-bold text-slate-900 hover:text-purple-600 cursor-pointer line-clamp-1"
                    >
                      {p.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{p.shortDescription}</p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                      <span className="text-lg font-black text-slate-900">
                        ₹{p.price.toLocaleString('en-IN')}
                      </span>
                      {p.originalPrice > p.price && (
                        <span className="text-xs text-slate-400 line-through">
                          ₹{p.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                      <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">
                        {p.discountPercent}% OFF
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 flex sm:flex-col gap-2">
                    <button
                      onClick={() => addToCart(p, 1)}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>
                    <button
                      onClick={() => navigateTo('product', { productId: p.id })}
                      className="px-4 py-2 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50"
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
