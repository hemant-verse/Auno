import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/product.model';
import { authorizeRequest } from '@/lib/middleware';

export async function PATCH(request) {
  try {
    const { user: decoded, errorResponse } = authorizeRequest(request);
    if (errorResponse) {
      return NextResponse.json({ error: errorResponse.error }, { status: errorResponse.status });
    }

    // Fetch full user from DB to verify role (token payload does not include role)
    await connectDB();
    const User = (await import('@/models/user.model')).default;
    const fullUser = decoded ? await User.findById(decoded.id || decoded._id).select('-password').lean() : null;

    if (!fullUser || fullUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { productId, verify } = await request.json();
    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(verify)) {
      return NextResponse.json({ error: 'Invalid verify status' }, { status: 400 });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const previous = product.verify;
    product.verify = verify;
    await product.save();

    // If approved, create a broadcast notification
    if (previous !== 'APPROVED' && verify === 'APPROVED') {
      try {
        const Notification = (await import('@/models/notification.model')).default;
        await Notification.create({
          recipient: null,
          title: 'New Item Approved',
          message: `A new item "${product.title}" is now available for ₹${product.price}.`,
          type: 'NEW_LISTING',
          product: product._id,
        });
      } catch (notifErr) {
        console.error('Failed to create approval notification:', notifErr);
      }
    }

    // Create an audit log entry for this admin action
    try {
      const AdminAudit = (await import('@/models/adminAudit.model')).default;
      const action = verify === 'APPROVED' ? 'APPROVE' : verify === 'REJECTED' ? 'REJECT' : 'SET_PENDING';
      await AdminAudit.create({
        admin: fullUser._id,
        action,
        product: product._id,
        previousVerify: previous,
        newVerify: verify,
        meta: { ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null },
      });
    } catch (auditErr) {
      console.error('Failed to write audit log:', auditErr);
    }

    await product.populate('seller', 'name email');

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Error updating product verify status:', error);
    return NextResponse.json({ error: 'Failed to update verify status' }, { status: 500 });
  }
}
