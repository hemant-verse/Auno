import connectDB from '@/lib/db';
import AdminAudit from '@/models/adminAudit.model';
import User from '@/models/user.model';
import { headers, cookies } from 'next/headers';
import { verifyAccessToken, verifyRefreshToken } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function Page({ searchParams }) {
  let decoded = null;
  let authHeader = null;
  try {
    const hdrs = await headers();
    authHeader = typeof hdrs.get === 'function' ? hdrs.get('authorization') : hdrs && (hdrs.authorization || hdrs['authorization']);
  } catch (e) {
    authHeader = null;
  }

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
  if (!fullUser || fullUser.role !== 'admin') return redirect('/');

  const page = Math.max(1, parseInt(searchParams?.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams?.limit || '20', 10)));
  const skip = (page - 1) * limit;
  const adminId = searchParams?.adminId || '';
  const action = searchParams?.action || '';
  const productId = searchParams?.productId || '';

  const query = {};
  if (adminId) query.admin = adminId;
  if (action) query.action = action;
  if (productId) query.product = productId;

  const [logs, total] = await Promise.all([
    AdminAudit.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('admin', 'name email').populate('product', 'title').lean(),
    AdminAudit.countDocuments(query),
  ]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black">Admin Audit Logs</h1>
          <Link href="/dashboard" className="text-sm text-zinc-600 underline">Back</Link>
        </div>

        <div className="bg-white rounded-2xl border p-4">
          <h2 className="font-bold mb-4">Recent Admin Actions</h2>

          {logs.length === 0 ? (
            <div className="text-sm text-zinc-500">No audit logs found</div>
          ) : (
            <div className="space-y-3">
              {logs.map((l) => (
                <div key={l._id} className="border rounded p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold">{l.action} — {l.product?.title || 'Unknown'}</div>
                      <div className="text-xs text-zinc-500">By: {l.admin?.name || l.admin?.email} • {new Date(l.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="text-xs text-zinc-500">{l.previousVerify} → {l.newVerify}</div>
                  </div>
                  {l.reason && <div className="mt-2 text-sm text-zinc-600">Reason: {l.reason}</div>}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-zinc-500">Total: {total}</div>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`/dashboard/audit?page=${page - 1}&limit=${limit}`} className="px-3 py-1 rounded border">Prev</Link>
              )}
              {page * limit < total && (
                <Link href={`/dashboard/audit?page=${page + 1}&limit=${limit}`} className="px-3 py-1 rounded border">Next</Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
