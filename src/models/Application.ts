
import { Schema, model, models } from "mongoose";
const ApplicationSchema = new Schema({
  tenantId: { type: String, index: true, required: true },
  jobId: { type: Schema.Types.ObjectId, ref: "Job", index: true, required: true },
  candidateId: { type: Schema.Types.ObjectId, ref: "Candidate", index: true, required: true },
  stageKey: { type: String, index: true, required: true },
  notes: String,
}, { timestamps: true });
ApplicationSchema.index({ tenantId: 1, jobId: 1, stageKey: 1, createdAt: -1 });
export default models.Application || model("Application", ApplicationSchema);
