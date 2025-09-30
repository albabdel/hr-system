import { Schema, model, models } from "mongoose";
const TimeClockSchema = new Schema({
  tenantId: { type: String, index: true, required: true },
  employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
  inAt: { type: Date, required: true },     // UTC
  outAt: { type: Date },                    // UTC
  source: { type: String, enum: ["web","mobile","biometric"], default: "web" },
  notes: { type: String },
}, { timestamps: true });
TimeClockSchema.index({ tenantId: 1, employeeId: 1, inAt: -1 });
export default models.TimeClock || model("TimeClock", TimeClockSchema);
