
import { Schema, model, models } from "mongoose";
const InterviewSchema = new Schema({
  tenantId: { type: String, index: true, required: true },
  jobId: { type: Schema.Types.ObjectId, ref: "Job", index: true, required: true },
  applicationId: { type: Schema.Types.ObjectId, ref: "Application", index: true, required: true },
  when: { type: Date, required: true },          // UTC
  durationMin: { type: Number, default: 60 },
  type: { type: String, enum: ["Phone","Virtual","Onsite"], default: "Virtual" },
  interviewer: { type: String },                 // free text for now
  location: { type: String },                    // URL/Room
  notes: { type: String },
  feedback: { type: String },                    // simple first pass
  outcome: { type: String, enum: ["PENDING","ADVANCE","REJECT","HOLD"], default: "PENDING", index: true }
}, { timestamps: true });
InterviewSchema.index({ tenantId: 1, applicationId: 1, when: -1 });
export default models.Interview || model("Interview", InterviewSchema);
