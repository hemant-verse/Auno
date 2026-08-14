import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    isNegotiable: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      required: true,
      enum: ['Books', 'Electronics', 'Dorm', 'Fashion', 'Other'],
      index: true,
    },
    condition: {
      type: String,
      required: true,
      enum: ['New', 'Like New', 'Good', 'Fair'],
    },
    imageUrl: {
      type: String,
      required: true,
    },
    imageFileId: {
      type: String,
      trim: true,
    },
    contactPhone: {
      type: String,
      required: true,
      trim: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'RESERVED', 'SOLD'],
      default: 'AVAILABLE',
      index: true,
    },
    verify: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
  },
  { timestamps: true }
);

// In models/product.model.js
ProductSchema.index({ status: 1, category: 1, createdAt: -1 });
ProductSchema.index({ status: 1, title: 'text', description: 'text' });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);