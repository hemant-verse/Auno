'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import Link from 'next/link';

export default function AdminClient({ initialProducts = [], total = 0, page = 1, limit = 20, search = '', category = '' }) {
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState(search || '');
  const [cat, setCat] = useState(category || 'ALL');
  const [perPage, setPerPage] = useState(limit || 20);
  const router = useRouter();

  const updateVerify = async (productId, verify) => {
    try {
      setLoading(true);
      await api.patch('/api/products/verify', { productId, verify });
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) {
      alert('Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/dashboard?page=1&limit=${perPage}&search=${encodeURIComponent(q)}&category=${encodeURIComponent(cat)}`);
  };

  const renderPageLinks = () => {
    const current = Number(page || 1);
    const pages = [];
    const start = Math.max(1, current - 2);
    const end = Math.min(totalPages, current + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages.map((p) => (
      <Link key={p} href={`/dashboard?page=${p}&limit=${perPage}&search=${encodeURIComponent(q)}&category=${encodeURIComponent(cat)}`} className={`px-3 py-1 rounded border ${p === current ? 'bg-zinc-900 text-white' : ''}`}>
        {p}
      </Link>
    ));
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="flex gap-2 items-center mb-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title or description" className="px-3 py-2 border rounded w-1/2" />
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="px-3 py-2 border rounded">
          <option value="ALL">All Categories</option>
          <option value="Books">Books</option>
          <option value="Electronics">Electronics</option>
          <option value="Dorm">Dorm</option>
          <option value="Fashion">Fashion</option>
          <option value="Other">Other</option>
        </select>
        <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))} className="px-3 py-2 border rounded">
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
        <button type="submit" className="px-3 py-2 bg-emerald-700 text-black rounded">Search</button>
      </form>

      {products.length === 0 ? (
        <div className="text-sm text-zinc-900">No pending listings</div>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <div key={p._id} className="flex items-center justify-between border rounded p-3">
              <div className="flex items-center gap-3">
                <img src={p.imageUrl} className="w-20 h-20 object-cover rounded" />
                <div>
                  <div className="font-bold">{p.title}</div>
                  <div className="text-xs text-zinc-500">{p.seller?.name || p.seller?.email || 'Unknown'}</div>
                  <div className="text-sm font-black mt-1">₹{p.price}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <button disabled={loading} onClick={() => updateVerify(p._id, 'REJECTED')} className="px-3 py-1 rounded bg-rose-50 text-rose-700 border border-rose-100">Reject</button>
                <button disabled={loading} onClick={() => updateVerify(p._id, 'APPROVED')} className="px-3 py-1 rounded bg-emerald-700 text-white">Approve</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination controls */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-zinc-900">Total: {total}</div>
        <div className="flex gap-2 items-center">
          {Number(page) > 1 && (
            <Link href={`/dashboard?page=${Number(page) - 1}&limit=${perPage}&search=${encodeURIComponent(q)}&category=${encodeURIComponent(cat)}`} className="px-3 py-1 rounded border">Prev</Link>
          )}
          {renderPageLinks()}
          {Number(page) * perPage < total && (
            <Link href={`/dashboard?page=${Number(page) + 1}&limit=${perPage}&search=${encodeURIComponent(q)}&category=${encodeURIComponent(cat)}`} className="px-3 py-1 rounded border">Next</Link>
          )}
        </div>
      </div>
    </div>
  );
}
