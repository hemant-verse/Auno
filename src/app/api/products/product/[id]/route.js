import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Product from '@/models/product.model';
import User from '@/models/user.model';
import { authorizeRequest } from '@/lib/middleware';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid product ID' }, { status: 400 });
    }

    await connectDB();

    const product = await Product.findById(id)
      .populate('seller', 'UserName email')
      .lean();

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product listing not found' }, { status: 404 });
    }

    // Approved listings are public. Pending/rejected listings require
    // authenticated ownership or admin authorization.
    if (product.verify !== 'APPROVED') {
      const { user: decoded, errorResponse } = authorizeRequest(request);

      if (errorResponse) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }

      const userId = decoded.id;
      const isOwner = String(userId) === String(product.seller?._id || product.seller);

      if (!isOwner) {
        const fullUser = await User.findById(userId).select('role').lean();

        if (!fullUser || fullUser.role !== 'admin') {
          return NextResponse.json(
            { success: false, error: 'Product not available' },
            { status: 403 }
          );
        }
      }
    }

    return NextResponse.json({ success: true, product }, { status: 200 });
  } catch (error) {
    console.error('Error fetching product detail:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product details' },
      { status: 500 }
    );
  }
}