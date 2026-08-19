import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import AdminAudit from '@/models/adminAudit.model';
import User from '@/models/user.model';
import { requireAdmin } from '@/lib/authorization';
import { isValidObjectId, parsePositiveInt } from '@/lib/validation';

export async function GET(request) {
  try {
    await connectDB();

    const auth = await requireAdmin(request, User);
    if (auth.response) return auth.response;

    const { searchParams } = new URL(request.url);
    const page = parsePositiveInt(searchParams.get('page'), 1, 100000);
    const limit = parsePositiveInt(searchParams.get('limit'), 20, 100);
    const skip = (page - 1) * limit;

    const adminId = searchParams.get('adminId');
    const action = searchParams.get('action');
    const productId = searchParams.get('productId');

    const query = {};

    if (adminId) {
      if (!isValidObjectId(adminId)) {
        return NextResponse.json({ success: false, error: 'Invalid admin ID' }, { status: 400 });
      }
      query.admin = adminId;
    }

    if (productId) {
      if (!isValidObjectId(productId)) {
        return NextResponse.json({ success: false, error: 'Invalid product ID' }, { status: 400 });
      }
      query.product = productId;
    }

    if (action) {
      const allowedActions = ['APPROVE', 'REJECT', 'SET_PENDING'];
      if (!allowedActions.includes(action)) {
        return NextResponse.json({ success: false, error: 'Invalid audit action' }, { status: 400 });
      }
      query.action = action;
    }

    const [logs, total] = await Promise.all([
      AdminAudit.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('admin', 'UserName email')
        .populate('product', 'title')
        .lean(),
      AdminAudit.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching admin audit logs:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}