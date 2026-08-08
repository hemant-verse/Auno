import { NextResponse } from 'next/server';
import z from 'zod';
import sharp from 'sharp';
import connectDB from '@/lib/db'; // Your MongoDB connection logic
import Product from '@/models/product.model';
import { authorizeRequest } from '@/lib/middleware';
import { uploadToImageKit } from '@/lib/imagekit';

// 1. Define Zod Validation Schema
const SellProductSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
  price: z.coerce.number().min(0, 'Price must be greater than or equal to 0'),
  isNegotiable: z.preprocess((val) => val === 'true' || val === true, z.boolean()),
  category: z.enum(['Books', 'Electronics', 'Dorm', 'Fashion', 'Other']),
  condition: z.enum(['New', 'Like New', 'Good', 'Fair']),
  contactPhone: z.string().min(8, 'Provide a valid phone or WhatsApp number').max(20),
});

export async function POST(request) {
  try {
    // Step 1: Authorization Check via Middleware
    const { user, errorResponse } = authorizeRequest(request);
    if (errorResponse) {
      return NextResponse.json({ error: errorResponse.error }, { status: errorResponse.status });
    }

    // Step 2: Parse FormData Payload
    const formData = await request.formData();
    const rawData = {
      title: formData.get('title'),
      description: formData.get('description'),
      price: formData.get('price'),
      isNegotiable: formData.get('isNegotiable'),
      category: formData.get('category'),
      condition: formData.get('condition'),
      contactPhone: formData.get('contactPhone'),
    };

    const imageFile = formData.get('image');

    // Step 3: Input Validation
    if (!imageFile || typeof imageFile === 'string') {
      return NextResponse.json({ error: 'Image file is required' }, { status: 400 });
    }

    const validatedData = SellProductSchema.safeParse(rawData);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Step 4: Server-side Image Processing & Compression (Sharp)
    const arrayBuffer = await imageFile.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Compress: Max width 1200px, convert to WebP format, quality 80%
    const compressedImageBuffer = await sharp(inputBuffer)
      .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const fileName = `${Date.now()}_${imageFile.name.split('.')[0]}.webp`;

    // Step 5: Upload Compressed Image to ImageKit
    const imageUrl = await uploadToImageKit(compressedImageBuffer, fileName, 'campusmarket/products');

    // Step 6: Save Document to MongoDB
    await connectDB();
    const newProduct = await Product.create({
      ...validatedData.data,
      imageUrl,
      seller: user.id || user._id, // Extracts user payload from decoded JWT middleware
    });

    return NextResponse.json(
      { message: 'Product listed successfully', product: newProduct },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in /api/products/sell:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}