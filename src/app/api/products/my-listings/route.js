import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/product.model';
import { authorizeRequest } from '@/lib/middleware';
import { deleteFromImageKit } from '@/lib/imagekit';

// GET: Fetch products listed by the logged-in user
export async function GET(request) {
  try {
    const { user, errorResponse } = authorizeRequest(request);
    if (errorResponse) {
      return NextResponse.json({ error: errorResponse.error }, { status: errorResponse.status });
    }

    await connectDB();
    const products = await Product.find({ seller: user.id || user._id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, products });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
}

// PATCH: Update item status (AVAILABLE -> RESERVED -> SOLD)
export async function PATCH(request) {
  try {
    const { user, errorResponse } = authorizeRequest(request);
    if (errorResponse) {
      return NextResponse.json({ error: errorResponse.error }, { status: errorResponse.status });
    }

    const { productId, status } = await request.json();
    if (!['AVAILABLE', 'RESERVED', 'SOLD'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await connectDB();
    const product = await Product.findOneAndUpdate(
      { _id: productId, seller: user.id || user._id },
      { status },
      { new: true }
    );

    if (!product) {
      return NextResponse.json({ error: 'Product not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}

// DELETE: Remove product from DB and clean up image from ImageKit
export async function DELETE(request) {
  try {
    const { user, errorResponse } = authorizeRequest(request);
    if (errorResponse) {
      return NextResponse.json({ error: errorResponse.error }, { status: errorResponse.status });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    await connectDB();
    const product = await Product.findOneAndDelete({ _id: productId, seller: user.id || user._id });

    if (!product) {
      return NextResponse.json({ error: 'Product not found or unauthorized' }, { status: 404 });
    }

    if (product.imageFileId) {
      try {
        await deleteFromImageKit(product.imageFileId);
      } catch (imageError) {
        console.error('ImageKit cleanup failed after product deletion:', imageError);
      }
    }

    return NextResponse.json({ success: true, message: 'Listing deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}