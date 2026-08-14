import mongoose from 'mongoose';

const AdminAuditSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, enum: ['APPROVE', 'REJECT', 'SET_PENDING', 'UPDATE', 'DELETE'], required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    previousVerify: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: null },
    newVerify: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: null },
    reason: { type: String, trim: true },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

export default mongoose.models.AdminAudit || mongoose.model('AdminAudit', AdminAuditSchema);
