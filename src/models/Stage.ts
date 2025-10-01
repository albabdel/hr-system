
import { Schema, model, models } from "mongoose";
const StageSchema = new Schema({
  tenantId: { type: String, index: true, required: true },
  jobId: { type: Schema.Types.ObjectId, ref: "Job", index: true, required: true },
  key: { type: String, required: true }, // "SOURCED","SCREEN","INTERVIEW","OFFER","HIRED","REJECTED"
  name: { type: String, required: true },
  order: { type: Number, required: true },
}, { timestamps: true });
StageSchema.index({ tenantId: 1, jobId: 1, order: 1 }, { unique: true });
export default models.Stage || model("Stage", StageSchema);
