import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/product.model';
import { authorizeRequest } from '@/lib/middleware';
import { productCreateSchema } from '@/schemas/product.schema';

export async function POST(request) {
  try {
    const { user, errorResponse } = authorizeRequest(request);

    if (errorResponse) {
      return NextResponse.json(
        { success: false, error: errorResponse.error },
        { status: errorResponse.status }
      );
    }

    const body = await request.json();
    const validation = productCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validation.error.issues.map((issue) => ({
            fieldName: issue.path,
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    await connectDB();

    const newProduct = await Product.create({
      ...validation.data,
      seller: user.id,
      verify: 'PENDING',
    });

    return NextResponse.json(
      { success: true, product: newProduct },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create listing' },
      { status: 500 }
    );
  }
}