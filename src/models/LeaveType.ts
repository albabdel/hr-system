import { Schema, model, models } from "mongoose";
const LeaveTypeSchema = new Schema({
  tenantId: { type: String, index: true, required: true },
  code: { type: String, required: true },        // e.g., "ANNUAL"
  name: { type: String, required: true },        // e.g., "Annual Leave"
  allowanceDays: { type: Number, default: 14 },
  requiresApproval: { type: Boolean, default: true },
}, { timestamps: true });
LeaveTypeSchema.index({ tenantId: 1, code: 1 }, { unique: true });
export default models.LeaveType || model("LeaveType", LeaveTypeSchema);
