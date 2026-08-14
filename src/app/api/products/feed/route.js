import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/product.model';
// 1. IMPORT USER MODEL TO REGISTER SCHEMA BEFORE POPULATING
import User from '@/models/user.model'; // Adjust path if your user model lives elsewhere

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    // Ensure positive integers for page and limit
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    await connectDB();

    const query = {
      status: { $in: ['AVAILABLE', 'RESERVED'] },
      verify: 'APPROVED',
    };

    if (category && category !== 'ALL') {
      query.category = category;
    }

    if (search && search.trim() !== '') {
      const sanitizedSearch = escapeRegex(search.trim());
      const searchRegex = new RegExp(sanitizedSearch, 'i');

      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
      ];
    }

    const skip = (page - 1) * limit;

    // Schema is now safely registered in Mongoose
    const [products, totalCount] = await Promise.all([
      Product.find(query)
        .select('title price category imageUrl location status createdAt seller')
        .populate('seller', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    return NextResponse.json(
      {
        success: true,
        count: products.length,
        total: totalCount,
        page,
        totalPages: Math.ceil(totalCount / limit),
        products
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching marketplace feed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}