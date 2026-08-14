import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import AdminAudit from '@/models/adminAudit.model';
import { authorizeRequest } from '@/lib/middleware';

export async function GET(request) {
  try {
    const { user: decoded, errorResponse } = authorizeRequest(request);
    if (errorResponse) {
      return NextResponse.json({ error: errorResponse.error }, { status: errorResponse.status });
    }

    await connectDB();
    const User = (await import('@/models/user.model')).default;
    const fullUser = decoded ? await User.findById(decoded.id || decoded._id).select('role').lean() : null;
    if (!fullUser || fullUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;
    const adminId = searchParams.get('adminId');
    const action = searchParams.get('action');
    const productId = searchParams.get('productId');

    const query = {};
    if (adminId) query.admin = adminId;
    if (action) query.action = action;
    if (productId) query.product = productId;

    const [logs, total] = await Promise.all([
      AdminAudit.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('admin', 'name email').populate('product', 'title').lean(),
      AdminAudit.countDocuments(query),
    ]);

    return NextResponse.json({ success: true, logs, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Error fetching admin audit logs:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}
