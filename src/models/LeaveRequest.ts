import { Schema, model, models } from "mongoose";
const LeaveRequestSchema = new Schema({
  tenantId: { type: String, index: true, required: true },
  employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
  typeCode: { type: String, required: true },         // references LeaveType.code
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String },
  status: { type: String, enum: ["PENDING","APPROVED","REJECTED","CANCELLED"], default: "PENDING", index: true },
  approverUserId: { type: Schema.Types.ObjectId, ref: "User" },
  decisionNote: String,
}, { timestamps: true });
LeaveRequestSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
export default models.LeaveRequest || model("LeaveRequest", LeaveRequestSchema);
