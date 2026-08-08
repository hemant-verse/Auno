import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true },
    otpHash: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 600 }, // Auto-deletes after 600 seconds (10 minutes)
  }
);

export default mongoose.models.OTP || mongoose.model('OTP', otpSchema);