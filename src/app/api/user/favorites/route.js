import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/user.model';
import Product from '@/models/product.model';
import { authorizeRequest } from '@/lib/middleware';

export async function GET(request) {
  try {
    // 1. Authorize Request
    const { user: currentUser, errorResponse } = authorizeRequest(request);

    if (errorResponse) {
      return NextResponse.json(
        { success: false, error: errorResponse.error },
        { status: errorResponse.status }
      );
    }

    const userId = currentUser.userId || currentUser.id || currentUser._id;

    await connectDB();

    // 2. Fetch User Favorites with Populated Product Details
    const user = await User.findById(userId).populate({
      path: 'favorites',
      select: 'title price category imageUrl location status createdAt seller',
      populate: {
        path: 'seller',
        select: 'name avatar',
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        favorites: user.favorites || [],
        favoriteIds: user.favorites ? user.favorites.map((item) => item._id.toString()) : [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching user favorites:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}