import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/product.model';
import User from '@/models/user.model';
import { requireAdmin } from '@/lib/authorization';
import { parsePositiveInt } from '@/lib/validation';

export async function GET(request) {
  try {
    await connectDB();

    const auth = await requireAdmin(request, User);
    if (auth.response) return auth.response;

    const { searchParams } = new URL(request.url);
    const page = parsePositiveInt(searchParams.get('page'), 1, 100000);
    const limit = parsePositiveInt(searchParams.get('limit'), 20, 50);
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find({ verify: 'PENDING' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('seller', 'UserName email')
        .lean(),
      Product.countDocuments({ verify: 'PENDING' }),
    ]);

    return NextResponse.json({
      success: true,
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching pending products:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch pending products' }, { status: 500 });
  }
}