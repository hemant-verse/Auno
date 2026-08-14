import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/product.model';

export async function GET() {
  try {
    await connectDB();

    // Aggregate active, approved categories and count available items per category
    const categoryStats = await Product.aggregate([
      {
        $match: {
          verify: 'APPROVED',
          status: { $in: ['AVAILABLE', 'RESERVED'] },
        },
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          count: 1,
        },
      },
      {
        $sort: { name: 1 },
      },
    ]);

    return NextResponse.json(
      { success: true, categories: categoryStats },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}