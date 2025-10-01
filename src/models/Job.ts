
import { Schema, model, models } from "mongoose";
const JobSchema = new Schema({
  tenantId: { type: String, index: true, required: true },
  title: { type: String, required: true },
  department: String,
  location: String,
  employmentType: { type: String, enum: ["Full-time","Part-time","Contract","Intern"], default: "Full-time" },
  description: String,
  status: { type: String, enum: ["OPEN","PAUSED","CLOSED"], default: "OPEN", index: true },
}, { timestamps: true });
JobSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
export default models.Job || model("Job", JobSchema);
