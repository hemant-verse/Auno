import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/user.model';
import Product from '@/models/product.model';
import { authorizeRequest } from '@/lib/middleware';

export async function POST(request, { params }) {
  try {
    // 1. Authorize Request using existing middleware
    const { user: currentUser, errorResponse } = authorizeRequest(request);

    if (errorResponse) {
      return NextResponse.json(
        { success: false, error: errorResponse.error },
        { status: errorResponse.status }
      );
    }

    const userId = currentUser.userId || currentUser.id || currentUser._id;
    const { productId } = await params;

    await connectDB();

    // 2. Validate Product & User
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const user = await User.findById(userId).select('favorites');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // 3. Toggle Favorite Status
    const isFavorited = user.favorites?.some(
      (favId) => favId.toString() === productId
    );

    const updateQuery = isFavorited
      ? { $pull: { favorites: productId } }
      : { $addToSet: { favorites: productId } };

    await User.findByIdAndUpdate(userId, updateQuery);

    return NextResponse.json(
      {
        success: true,
        isFavorited: !isFavorited,
        message: !isFavorited ? 'Added to favorites' : 'Removed from favorites',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update favorite status' },
      { status: 500 }
    );
  }
}