import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Product from '@/models/product.model';
import { authorizeRequest } from '@/lib/middleware';

export async function GET(request, { params }) {
  try {
    const { user } = authorizeRequest(request);
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!user && !refreshToken) {
      return NextResponse.json(
        { error: 'Unauthorized: Please log in to view listing details' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    await connectDB();

    const product = await Product.findById(id)
      .populate('seller', 'UserName email')
      .lean();

    if (!product) {
      return NextResponse.json({ error: 'Product listing not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product }, { status: 200 });
  } catch (error) {
    console.error('Error fetching product detail:', error);
    return NextResponse.json({ error: 'Failed to fetch product details' }, { status: 500 });
  }
}