import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/product.model';
import { authorizeRequest } from '@/lib/middleware';

export async function GET(request) {
  try {
    const { user: decoded, errorResponse } = authorizeRequest(request);
    if (errorResponse) {
      return NextResponse.json({ error: errorResponse.error }, { status: errorResponse.status });
    }

    // Fetch full user from DB to verify role
    await connectDB();
    const User = (await import('@/models/user.model')).default;
    const fullUser = decoded ? await User.findById(decoded.id || decoded._id).select('-password').lean() : null;

    if (!fullUser || fullUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find({ verify: 'PENDING' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('seller', 'name email')
        .lean(),
      Product.countDocuments({ verify: 'PENDING' }),
    ]);

    return NextResponse.json({ success: true, products, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Error fetching pending products:', error);
    return NextResponse.json({ error: 'Failed to fetch pending products' }, { status: 500 });
  }
}
