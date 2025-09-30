import { Schema, model, models } from "mongoose";
const UserSchema = new Schema({
  tenantId: { type: String, index: true, required: true },
  email: { type: String, index: true, required: true, unique: true },
  name: String,
  passwordHash: String,
  role: { type: String, enum: ["OWNER","HR_ADMIN","MANAGER","EMPLOYEE"], default: "EMPLOYEE" },
},{ timestamps: true });
export default models.User || model("User", UserSchema);
