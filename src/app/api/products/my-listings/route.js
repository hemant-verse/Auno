import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/product.model';
import { authorizeRequest } from '@/lib/middleware';
import { deleteFromImageKit } from '@/lib/imagekit';
import { productStatusSchema } from '@/schemas/product.schema';
import { isValidObjectId } from '@/lib/validation';

export async function GET(request) {
  try {
    const { user, errorResponse } = authorizeRequest(request);
    if (errorResponse) {
      return NextResponse.json({ success: false, error: errorResponse.error }, { status: errorResponse.status });
    }

    await connectDB();
    const products = await Product.find({ seller: user.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('Failed to fetch listings:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch listings' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { user, errorResponse } = authorizeRequest(request);
    if (errorResponse) {
      return NextResponse.json({ success: false, error: errorResponse.error }, { status: errorResponse.status });
    }

    const validation = productStatusSchema.safeParse(await request.json());

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { productId, status } = validation.data;

    if (!isValidObjectId(productId)) {
      return NextResponse.json({ success: false, error: 'Invalid product ID' }, { status: 400 });
    }

    await connectDB();

    const product = await Product.findOneAndUpdate(
      { _id: productId, seller: user.id },
      { $set: { status } },
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Failed to update product status:', error);
    return NextResponse.json({ success: false, error: 'Failed to update status' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { user, errorResponse } = authorizeRequest(request);
    if (errorResponse) {
      return NextResponse.json({ success: false, error: errorResponse.error }, { status: errorResponse.status });
    }

    const productId = new URL(request.url).searchParams.get('id');

    if (!productId || !isValidObjectId(productId)) {
      return NextResponse.json({ success: false, error: 'Valid product ID required' }, { status: 400 });
    }

    await connectDB();

    const product = await Product.findOneAndDelete({
      _id: productId,
      seller: user.id,
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found or unauthorized' },
        { status: 404 }
      );
    }

    if (product.imageFileId) {
      try {
        await deleteFromImageKit(product.imageFileId);
      } catch (imageError) {
        console.error('ImageKit cleanup failed after product deletion:', imageError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Listing deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete product' }, { status: 500 });
  }
}