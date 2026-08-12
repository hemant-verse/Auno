'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';

export default function FavoritesPage() {
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch favorited items on mount
useEffect(() => {
  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/user/favorites');
      setFavoriteItems(res.data.favorites || []);
    } catch (err) {
      if (err.response?.status === 401) {
        window.location.href = '/login?redirect=/favorites';
      } else {
        console.error('Failed to load favorites:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  fetchFavorites();
}, []);

  // Handle removing an item from favorites directly on this page
  const removeFavorite = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistically remove from state
    const previousItems = [...favoriteItems];
    setFavoriteItems((prev) => prev.filter((item) => item._id !== productId));

    try {
      await api.post(`/api/products/${productId}/favorite`);
    } catch (err) {
      console.error('Failed to update favorite status:', err);
      // Revert state on failure
      setFavoriteItems(previousItems);
    }
  };

  return (
    <div className="min-h-screen bg-gray-300 pb-16">
      
     

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">Your Saved Items</h1>
            <p className="text-xs sm:text-sm font-medium text-zinc-500 mt-1">
              Items you saved to review, compare, or purchase later.
            </p>
          </div>
          <Link
            href="/feed"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 transition-colors w-fit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Marketplace
          </Link>
        </div>

        {/* Favorite Items Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-zinc-200/80 p-3 space-y-3 animate-pulse">
                <div className="aspect-square bg-zinc-100 rounded-xl" />
                <div className="h-4 bg-zinc-100 rounded w-3/4" />
                <div className="h-4 bg-zinc-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : favoriteItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-zinc-200/80 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <p className="text-base font-bold text-zinc-900">No saved items yet</p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
                Explore the marketplace feed and tap the heart icon on any listing to save it here.
              </p>
            </div>
            <Link
              href="/feed"
              className="inline-block bg-zinc-950 hover:bg-zinc-800 text-white font-bold px-6 py-2.5 rounded-full text-xs transition-all shadow-md"
            >
              Explore Feed
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {favoriteItems.map((item) => (
              <Link key={item._id} href={`/product/${item._id}`} className="group block">
                <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer relative">
                  
                  {/* Image Container */}
                  <div className="relative aspect-square w-full bg-zinc-100 overflow-hidden">
                    <img
                      src={item.imageUrl || '/images/placeholder.png'}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Category Tag */}
                    {item.category && (
                      <span className="absolute top-2.5 left-2.5 bg-zinc-900/80 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm backdrop-blur-sm">
                        {item.category}
                      </span>
                    )}

                    {/* Heart Button to Remove from Favorites */}
                    <button
                      type="button"
                      onClick={(e) => removeFavorite(e, item._id)}
                      aria-label="Remove from favorites"
                      className="absolute bottom-2.5 right-2.5 p-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-sm hover:scale-110 transition-transform cursor-pointer"
                    >
                      <svg
                        className="w-4 h-4 fill-rose-500 text-rose-500"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-3.5 flex flex-col flex-grow justify-between space-y-2">
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-zinc-950 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-tight mb-1">
                        {item.title}
                      </h3>
                      <p className="font-black text-emerald-800 text-sm sm:text-base">
                        ₹{item.price?.toLocaleString() || '0'}
                      </p>
                    </div>

                    <div className="space-y-1 text-[11px] text-zinc-500 pt-1 border-t border-zinc-100">
                      {item.location && (
                        <p className="flex items-center gap-1 text-zinc-500 font-medium truncate">
                          <svg className="w-3 h-3 text-zinc-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate">{item.location}</span>
                        </p>
                      )}
                      <p className="text-[10px] text-zinc-400">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recently'}
                      </p>
                    </div>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}