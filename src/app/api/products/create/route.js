import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/product.model';
import Notification from '@/models/notification.model';
import { authorizeRequest } from '@/lib/middleware';

export async function POST(request) {
  try {
    const { user, errorResponse } = authorizeRequest(request);
    if (errorResponse) {
      return NextResponse.json({ success: false, error: errorResponse.error }, { status: errorResponse.status });
    }

    await connectDB();
    const body = await request.json();

    // 1. Create New Product Listing
    const newProduct = await Product.create({
      ...body,
      seller: user.userId || user.id,
        verify: 'PENDING',
      });

    // 2. Broadcast Notification for New Listing
    // Only broadcast when the listing is approved
    if (newProduct.verify === 'APPROVED') {
      await Notification.create({
        recipient: null, // Broadcast to all users
        title: 'New Item Listed!',
        message: `A new item "${newProduct.title}" was just listed for ₹${newProduct.price}.`,
        type: 'NEW_LISTING',
        product: newProduct._id,
      });
    }

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ success: false, error: 'Failed to create listing' }, { status: 500 });
  }
}