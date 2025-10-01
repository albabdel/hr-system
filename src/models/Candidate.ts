
import { Schema, model, models } from "mongoose";
const CandidateSchema = new Schema({
  tenantId: { type: String, index: true, required: true },
  firstName: String,
  lastName: String,
  email: { type: String, index: true },
  phone: String,
  resumeUrl: String,
  source: String, // LinkedIn, referral, etc.
}, { timestamps: true });
CandidateSchema.index({ tenantId: 1, email: 1 });
export default models.Candidate || model("Candidate", CandidateSchema);
