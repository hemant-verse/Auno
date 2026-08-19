import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/product.model';
import User from '@/models/user.model';
import { requireAdmin } from '@/lib/authorization';
import { productVerifySchema } from '@/schemas/product.schema';
import { isValidObjectId } from '@/lib/validation';

export async function PATCH(request) {
  try {
    await connectDB();

    const auth = await requireAdmin(request, User);
    if (auth.response) return auth.response;

    const validation = productVerifySchema.safeParse(await request.json());
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { productId, verify } = validation.data;

    if (!isValidObjectId(productId)) {
      return NextResponse.json({ success: false, error: 'Invalid product ID' }, { status: 400 });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    const previous = product.verify;
    product.verify = verify;
    await product.save();

    try {
      const AdminAudit = (await import('@/models/adminAudit.model')).default;
      const action = verify === 'APPROVED' ? 'APPROVE' : verify === 'REJECTED' ? 'REJECT' : 'SET_PENDING';

      await AdminAudit.create({
        admin: auth.fullUser._id,
        action,
        product: product._id,
        previousVerify: previous,
        newVerify: verify,
        meta: {
          ip:
            request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            null,
        },
      });
    } catch (auditError) {
      console.error('Failed to write audit log:', auditError);
    }

    await product.populate('seller', 'UserName email');

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Error updating product verify status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update verify status' },
      { status: 500 }
    );
  }
}