import { NextResponse } from 'next/server';
import z from 'zod';
import connectDB from '@/lib/db';
import Product from '@/models/product.model';
import { authorizeRequest } from '@/lib/middleware';
import { uploadToImageKit } from '@/lib/imagekit';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Schema allowing flexible/dynamic contact options
const SellProductSchema = z
  .object({
    title: z.string().min(3).max(100),
    description: z.string().min(10).max(1000),
    price: z.coerce.number().min(0),
    isNegotiable: z.preprocess((val) => val === 'true' || val === true, z.boolean()),
    category: z.enum(['Books', 'Electronics', 'Dorm', 'Fashion', 'Other']),
    condition: z.enum(['New', 'Like New', 'Good', 'Fair']),
    whatsapp: z.string().min(8).max(20).optional().or(z.literal('')),
    telegram: z.string().min(2).max(50).optional().or(z.literal('')),
    instagram: z.string().min(2).max(50).optional().or(z.literal('')),
  })
  .refine(
    (data) => !!(data.whatsapp || data.telegram || data.instagram),
    {
      message: 'At least one contact method (WhatsApp, Telegram, or Instagram) must be provided.',
      path: ['contactValue'],
    }
  );

export async function POST(request) {
  let stage = 'authorization';

  try {
    // 1. Authorization
    const { user, errorResponse } = authorizeRequest(request);
    if (errorResponse) {
      return NextResponse.json({ error: errorResponse.error }, { status: errorResponse.status });
    }

    // 2. Form Data Parsing
    stage = 'form-data parsing';
    const formData = await request.formData();
    const rawData = {
      title: formData.get('title'),
      description: formData.get('description'),
      price: formData.get('price'),
      isNegotiable: formData.get('isNegotiable'),
      category: formData.get('category'),
      condition: formData.get('condition'),
      whatsapp: formData.get('whatsapp') || undefined,
      telegram: formData.get('telegram') || undefined,
      instagram: formData.get('instagram') || undefined,
    };

    const imageFile = formData.get('image');

    // 3. Validation
    stage = 'input validation';
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

    // 4. Convert File directly to Buffer
    stage = 'image buffer extraction';
    const arrayBuffer = await imageFile.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);
    const fileName = `${Date.now()}_${imageFile.name || 'product.webp'}`;

    // 5. ImageKit Upload
    stage = 'ImageKit upload';
    const uploadedImage = await uploadToImageKit(rawBuffer, fileName, 'campusmarket/products');

    // 6. Database Save
    stage = 'MongoDB save';
    await connectDB();
    const newProduct = await Product.create({
      ...validatedData.data,
      imageUrl: uploadedImage.url,
      imageFileId: uploadedImage.fileId,
      seller: user.id || user._id,
      verify: 'PENDING',
    });

    return NextResponse.json(
      { message: 'Product listed successfully', product: newProduct },
      { status: 201 }
    );
  } catch (error) {
    console.error(`Error in /api/products/sell during ${stage}:`, error);
    return NextResponse.json(
      { error: `Unable to publish listing during ${stage}: ${error.message}` },
      { status: 500 }
    );
  }
}