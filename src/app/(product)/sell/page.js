'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

const CATEGORIES = ['Books', 'Electronics', 'Dorm', 'Fashion', 'Other'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

export default function SellPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  // Form State matching Backend Schema
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    isNegotiable: false,
    category: '',
    condition: '',
    contactPhone: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear specific field error on user edit
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // File Processing Handler
  const processImageFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    // 10MB client check prior to upload
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB limit.');
      return;
    }

    setError('');
    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const clearImage = () => {
    setSelectedFile(null);
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Client-side quick checks before hitting API
  const validateForm = () => {
    setFieldErrors({});
    const errors = {};

    if (!selectedFile) setError('An image file is required.');
    if (formData.title.trim().length < 3) errors.title = 'Title must be at least 3 characters.';
    if (formData.description.trim().length < 10) errors.description = 'Description must be at least 10 characters.';
    if (!formData.price || parseFloat(formData.price) < 0) errors.price = 'Price must be 0 or greater.';
    if (!formData.category) errors.category = 'Please select a valid category.';
    if (!formData.condition) errors.condition = 'Please select a condition.';
    if (formData.contactPhone.trim().length < 8) errors.contactPhone = 'Provide a valid phone or WhatsApp number.';

    if (Object.keys(errors).length > 0 || !selectedFile) {
      setFieldErrors(errors);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Build Multipart Form Data payload
      const body = new FormData();
      body.append('image', selectedFile);
      body.append('title', formData.title.trim());
      body.append('description', formData.description.trim());
      body.append('price', formData.price);
      body.append('isNegotiable', String(formData.isNegotiable));
      body.append('category', formData.category);
      body.append('condition', formData.condition);
      body.append('contactPhone', formData.contactPhone.trim());

      // Target backend endpoint: /api/products/sell
      const res = await api.post('/api/products/sell', body, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.status === 201) {
        router.push('/feed');
        router.refresh();
      }
    } catch (err) {
      console.error("Backend Stage Error:", err.response?.data?.error);
      const responseData = err.response?.data;

      if (err.response?.status === 401) {
        const currentPath = encodeURIComponent(window.location.pathname);
        router.push(`/login?redirect=${currentPath}`);
      } else if (err.response?.status === 400 && responseData?.details) {
        // Map backend Zod validation error fields to frontend form inputs
        setFieldErrors(responseData.details);
        setError('Validation failed. Please check the highlighted fields below.');
      } else {
        setError(responseData?.error || 'Failed to publish listing. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-16 relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-multiply"
        style={{
          backgroundImage: `
            radial-gradient(circle at 10% 20%, #FDE68A 0%, transparent 40%),
            radial-gradient(circle at 90% 10%, #A7F3D0 0%, transparent 40%),
            radial-gradient(circle at 50% 80%, #FCA5A5 0%, transparent 50%),
            radial-gradient(circle at 85% 75%, #6EE7B7 0%, transparent 45%)
          `
        }}
      />

      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/feed" className="text-xl font-black tracking-tight text-zinc-950 flex items-center gap-0.5">
            Z<span className="text-emerald-700">uno</span>
          </Link>

          <div className="relative flex-1 max-w-xl hidden sm:block">
            <input
              type="text"
              placeholder="Search for books, gadgets, furniture..."
              className="w-full bg-zinc-100/80 border-0 focus:ring-2 focus:ring-zinc-950 rounded-full py-2.5 pl-5 pr-10 text-xs sm:text-sm font-medium placeholder-zinc-400 text-zinc-900 outline-none"
            />
            <svg className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/favorites" aria-label="Favorites" className="p-2 text-zinc-600 hover:text-rose-600 hover:bg-zinc-100 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </Link>

            <Link href="/profile" className="w-8 h-8 rounded-full bg-emerald-800 text-white font-bold text-xs flex items-center justify-center cursor-pointer shadow-sm">
              ME
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10 space-y-4">
        <div className="flex items-center gap-3 text-xs font-semibold text-zinc-600">
          <Link href="/feed" className="w-8 h-8 rounded-xl bg-white border border-zinc-200 shadow-sm flex items-center justify-center hover:bg-zinc-50 transition-colors">
            <svg className="w-4 h-4 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <Link href="/feed" className="hover:text-zinc-950 transition-colors">Home</Link>
          <span className="text-zinc-400">/</span>
          <span className="text-zinc-900 font-bold">Sell an Item</span>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-zinc-200/80 shadow-xl p-6 sm:p-8 md:p-10">
          
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold tracking-wide flex items-center justify-between">
              <span>{error}</span>
              <button type="button" onClick={() => setError('')} className="text-rose-600 hover:text-rose-900 font-extrabold">✕</button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* LEFT COLUMN: Media Upload */}
            <div className="lg:col-span-5 space-y-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={handleFileSelect}
              />

              <div 
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 bg-zinc-50/50 text-center flex flex-col items-center justify-center min-h-[340px] relative transition-all ${
                  dragActive ? 'border-emerald-700 bg-emerald-50/30 scale-[1.01]' : 'border-emerald-800/20'
                }`}
              >
                {imagePreview ? (
                  <div className="relative w-full h-64 rounded-xl overflow-hidden border border-zinc-200">
                    <img src={imagePreview} alt="Product Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-2 right-2 bg-zinc-950/80 hover:bg-rose-600 text-white p-1.5 rounded-full backdrop-blur-sm transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-emerald-800/10 rounded-full flex items-center justify-center text-emerald-800 mb-4">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    
                    <h3 className="text-base font-extrabold text-zinc-900 mb-1">Drop product photo here</h3>
                    <p className="text-xs text-zinc-400 font-medium mb-4">or</p>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-[#2D5A46] hover:bg-[#234737] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer mb-4"
                    >
                      Select from media
                    </button>

                    <span className="text-[11px] text-zinc-400 leading-relaxed font-medium">
                      JPG, PNG, WEBP up to 10MB
                    </span>
                  </>
                )}
              </div>

              <div className="bg-[#FFFDF5] border border-amber-200/60 rounded-2xl p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-800 font-bold">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Tips for better response</span>
                </div>
                <ul className="text-zinc-600 space-y-1 pl-6 list-disc font-medium text-[11px]">
                  <li>Use high-quality photos with good lighting</li>
                  <li>Show defects or marks clearly</li>
                  <li>Be detailed in product description</li>
                </ul>
              </div>
            </div>

            {/* RIGHT COLUMN: Form Inputs */}
            <div className="lg:col-span-7 space-y-5">
              <div>
                <h1 className="text-2xl font-black text-zinc-950 tracking-tight">List Your Item</h1>
                <p className="text-xs font-medium text-zinc-500 mt-1">Fill in the details below to publish your item.</p>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label htmlFor="title" className="block text-xs font-bold text-zinc-800">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Engineering Mathematics Vol 2"
                  className="w-full bg-zinc-50/80 border border-zinc-200 rounded-xl py-3 px-4 text-xs font-medium text-zinc-900 placeholder-zinc-400 focus:bg-white focus:ring-2 focus:ring-emerald-800 transition-all outline-none"
                />
                {fieldErrors.title && <p className="text-[11px] text-rose-600 font-bold mt-1">{fieldErrors.title}</p>}
              </div>

              {/* Description */}
              <div className="space-y-1.5 relative">
                <label htmlFor="description" className="block text-xs font-bold text-zinc-800">
                  Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  maxLength={1000}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe item condition, edition, usage duration, etc..."
                  className="w-full bg-zinc-50/80 border border-zinc-200 rounded-xl p-4 text-xs font-medium text-zinc-900 placeholder-zinc-400 focus:bg-white focus:ring-2 focus:ring-emerald-800 transition-all outline-none resize-none"
                />
                <span className="absolute bottom-3 right-3 text-[10px] text-zinc-400 font-medium">
                  {formData.description.length}/1000
                </span>
                {fieldErrors.description && <p className="text-[11px] text-rose-600 font-bold mt-1">{fieldErrors.description}</p>}
              </div>

              {/* Price & Negotiable */}
              <div className="space-y-2">
                <label htmlFor="price" className="block text-xs font-bold text-zinc-800">
                  Price (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="price"
                  type="number"
                  name="price"
                  min="0"
                  step="any"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full bg-zinc-50/80 border border-zinc-200 rounded-xl py-3 px-4 text-xs font-medium text-zinc-900 placeholder-zinc-400 focus:bg-white focus:ring-2 focus:ring-emerald-800 transition-all outline-none"
                />
                {fieldErrors.price && <p className="text-[11px] text-rose-600 font-bold mt-1">{fieldErrors.price}</p>}
                
                <label className="flex items-center gap-2 cursor-pointer pt-0.5">
                  <input
                    type="checkbox"
                    name="isNegotiable"
                    checked={formData.isNegotiable}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-zinc-300 text-emerald-800 focus:ring-emerald-800 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-zinc-700">Price is negotiable</span>
                </label>
              </div>

              {/* Category & Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="category" className="block text-xs font-bold text-zinc-800">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-zinc-50/80 border border-zinc-200 rounded-xl py-3 px-4 text-xs font-medium text-zinc-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 transition-all outline-none cursor-pointer"
                  >
                    <option value="" disabled>Select category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {fieldErrors.category && <p className="text-[11px] text-rose-600 font-bold mt-1">{fieldErrors.category}</p>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="condition" className="block text-xs font-bold text-zinc-800">
                    Condition <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="condition"
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="w-full bg-zinc-50/80 border border-zinc-200 rounded-xl py-3 px-4 text-xs font-medium text-zinc-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 transition-all outline-none cursor-pointer"
                  >
                    <option value="" disabled>Select condition</option>
                    {CONDITIONS.map((cond) => (
                      <option key={cond} value={cond}>{cond}</option>
                    ))}
                  </select>
                  {fieldErrors.condition && <p className="text-[11px] text-rose-600 font-bold mt-1">{fieldErrors.condition}</p>}
                </div>
              </div>

              {/* Contact Phone */}
              <div className="space-y-1.5">
                <label htmlFor="contactPhone" className="block text-xs font-bold text-zinc-800">
                  WhatsApp / Contact Phone <span className="text-rose-500">*</span>
                </label>
                <input
                  id="contactPhone"
                  type="text"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder="+91 9876****10"
                  className="w-full bg-zinc-50/80 border border-zinc-200 rounded-xl py-3 px-4 text-xs font-medium text-zinc-900 placeholder-zinc-400 focus:bg-white focus:ring-2 focus:ring-emerald-800 transition-all outline-none"
                />
                {fieldErrors.contactPhone && <p className="text-[11px] text-rose-600 font-bold mt-1">{fieldErrors.contactPhone}</p>}
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#2D5A46] hover:bg-[#234737] text-white font-bold text-xs px-8 py-3.5 rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{loading ? 'Processing & Uploading...' : 'Publish Listing'}</span>
                  <svg className="w-4 h-4 rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>

            </div>
          </div>
        </form>
      </main>
    </div>
  );
}