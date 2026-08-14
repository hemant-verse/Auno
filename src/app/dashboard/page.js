import connectDB from '@/lib/db';
import Product from '@/models/product.model';
import User from '@/models/user.model';
import { headers, cookies } from 'next/headers';
import { verifyAccessToken, verifyRefreshToken } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminClient from './AdminClient';

export default async function Page({ searchParams }) {
  // Server-side auth: prefer Authorization header, fallback to refresh cookie
  let authHeader = null;
  try {
    const hdrs = await headers();
    authHeader = typeof hdrs.get === 'function' ? hdrs.get('authorization') : hdrs && (hdrs.authorization || hdrs['authorization']);
  } catch (e) {
    authHeader = null;
  }
  let decoded = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    decoded = verifyAccessToken(token);
  }

  if (!decoded) {
    let cookieToken = null;
    try {
      const c = await cookies();
      cookieToken = typeof c.get === 'function' ? c.get('refreshToken')?.value : c && (c.refreshToken || c['refreshToken']);
    } catch (e) {
      cookieToken = null;
    }
    if (!cookieToken) return redirect('/');
    const refreshDecoded = verifyRefreshToken(cookieToken);
    if (!refreshDecoded) return redirect('/');
    decoded = refreshDecoded;
  }

  await connectDB();
  const fullUser = await User.findById(decoded.id || decoded._id).select('role').lean();
  if (!fullUser || fullUser.role !== 'admin') {
    return redirect('/');
  }

  // Parse search / pagination / filters from searchParams
  const page = Math.max(1, parseInt(searchParams?.page || '1', 10));
  const limit = Math.min(50, Math.max(5, parseInt(searchParams?.limit || '20', 10)));
  const skip = (page - 1) * limit;
  const search = searchParams?.search || '';
  const category = searchParams?.category || '';

  const query = { verify: 'PENDING' };
  if (category && category !== 'ALL') query.category = category;
  if (search && search.trim() !== '') {
    const re = new RegExp(search.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');
    query.$or = [{ title: re }, { description: re }];
  }

  const [products, total] = await Promise.all([
    Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('seller', 'name email').lean(),
    Product.countDocuments(query),
  ]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-black p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black">Admin Dashboard</h1>
        </div>

        <div className="bg-white rounded-2xl border p-4">
          <h2 className="font-bold mb-4">Pending Listings</h2>

          <AdminClient
            initialProducts={products}
            total={total}
            page={page}
            limit={limit}
            search={search}
            category={category}
          />
        </div>
      </div>
    </div>
  );
}
