'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

export default function ProductDetailClient({ id }) {
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/api/products/product/${id}`);
        setProduct(res.data?.product || null);
      } catch (err) {
        if (err.response?.status === 401) {
          router.push(`/login?redirect=/product/${id}`);
          return;
        }
        setError(err.response?.data?.error || 'Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white pb-16">
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
          <div className="h-4 w-32 bg-zinc-100 rounded-lg animate-pulse" />
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-sm">
            <div className="aspect-square w-full bg-zinc-100 rounded-2xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-6 w-24 bg-zinc-100 rounded-full animate-pulse" />
              <div className="h-8 w-3/4 bg-zinc-100 rounded-lg animate-pulse" />
              <div className="h-8 w-1/3 bg-zinc-100 rounded-lg animate-pulse" />
              <div className="h-24 bg-zinc-100 rounded-xl animate-pulse" />
              <div className="h-32 bg-zinc-100 rounded-xl animate-pulse" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-zinc-200/80 p-8 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-zinc-950">Listing Unavailable</h2>
          <p className="text-xs text-zinc-500">{error || 'This product listing does not exist or was removed.'}</p>
          <Link
            href="/feed"
            className="inline-flex items-center justify-center w-full px-5 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs rounded-full transition-colors cursor-pointer"
          >
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const rawPhone = product.contactPhone || '';
  const sanitizedPhone = rawPhone.replace(/\D/g, '');
  const formattedPrice = `₹${product.price?.toLocaleString() || '0'}`;

  const whatsappMessage = encodeURIComponent(
  `Hi ${product.seller?.UserName || 'there'}, I'm interested in your listing "${product.title}" on Zuno for ${formattedPrice}. Is it still available?`
);
  const whatsappUrl = `https://wa.me/${sanitizedPhone}?text=${whatsappMessage}`;

  const statusUpper = product.status?.toUpperCase() || 'AVAILABLE';

  return (
    <div className="min-h-screen bg-white pb-16">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Back Link */}
        <Link
          href="/feed"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-950 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Marketplace
        </Link>

        {/* Product Card */}
        <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="aspect-square w-full rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-100">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details & Actions */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 bg-zinc-100 text-zinc-700 rounded-full">
                  {product.category}
                </span>
                <span
                  className={`text-[10px] font-extrabold px-3 py-1 rounded-full border tracking-wider ${statusUpper === 'AVAILABLE'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : statusUpper === 'RESERVED'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                    }`}
                >
                  {statusUpper}
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">{product.title}</h1>
                <p className="text-2xl sm:text-3xl font-black text-emerald-800 mt-1">{formattedPrice}</p>
              </div>

              <div className="border-y border-zinc-100 py-3 space-y-1.5 text-xs text-zinc-600 font-medium">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Condition</span>
                  <span className="font-bold text-zinc-900">{product.condition}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Posted On</span>
                  <span className="font-bold text-zinc-900">
                    {new Date(product.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Description</h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed whitespace-pre-line font-normal">
                  {product.description || 'No description provided by the seller.'}
                </p>
              </div>
            </div>

            {/* Seller Contact Container */}
            <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Listed By</h4>
                {/* Replaced product.seller?.name with product.seller?.username */}
                <p className="font-bold text-zinc-950 text-sm">
                  {product.seller?.UserName ? `${product.seller.UserName}` : 'Anonymous Seller'}
                </p>
                {product.seller?.email && (
                  <p className="text-xs text-zinc-500 font-medium">{product.seller.email}</p>
                )}
              </div>

              {sanitizedPhone ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl transition-all shadow-sm hover:shadow text-xs cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                  </svg>
                  Contact via WhatsApp
                </a>
              ) : (
                <a
                  href={`mailto:${product.seller?.email}?subject=Interested in ${product.title}`}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-zinc-950 hover:bg-zinc-800 text-white font-bold rounded-xl transition-all shadow-sm text-xs cursor-pointer"
                >
                  Contact via Email
                </a>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}