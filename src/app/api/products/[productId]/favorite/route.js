import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import User from '@/models/user.model';
import Product from '@/models/product.model';
import { authorizeRequest } from '@/lib/middleware';

export async function POST(request, { params }) {
  try {
    const { user: currentUser, errorResponse } = authorizeRequest(request);

    if (errorResponse) {
      return NextResponse.json(
        { success: false, error: errorResponse.error },
        { status: errorResponse.status }
      );
    }

    const { productId } = await params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    await connectDB();

    const [product, user] = await Promise.all([
      Product.findById(productId).select('_id'),
      User.findById(currentUser.id).select('favorites'),
    ]);

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const isFavorited = user.favorites?.some(
      (favId) => String(favId) === String(productId)
    );

    const updateQuery = isFavorited
      ? { $pull: { favorites: productId } }
      : { $addToSet: { favorites: productId } };

    await User.updateOne({ _id: currentUser.id }, updateQuery);

    return NextResponse.json({
      success: true,
      isFavorited: !isFavorited,
      message: !isFavorited ? 'Added to favorites' : 'Removed from favorites',
    });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update favorite status' },
      { status: 500 }
    );
  }
}