import { Schema, model, models } from "mongoose";
const TenantSchema = new Schema({
  _id: { type: String }, // use slug as id
  name: { type: String, required: true },
  theme: {
    logoUrl: String,
    primary: { type: String, default: "#ffda47" }
  }
},{ timestamps: true });
export default models.Tenant || model("Tenant", TenantSchema);
