// models/Session.js
import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // We store the hash, NOT the raw token, protecting against DB leaks
    refreshHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Automatically deletes the document from MongoDB when expired
    },
  },
  { timestamps: true }
);

export default mongoose.models.Session || mongoose.model('Session', SessionSchema);