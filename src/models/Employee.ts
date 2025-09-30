import { Schema, model, models } from "mongoose";
const EmployeeSchema = new Schema({
  tenantId: { type: String, index: true, required: true },
  firstName: String,
  lastName: String,
  email: { type: String, index: true },
  department: String,
  position: String,
  hireDate: Date,
  managerId: { type: Schema.Types.ObjectId, ref: "Employee" },
  documents: [{ name: String, url: String }],
},{ timestamps: true });
EmployeeSchema.index({ tenantId: 1, email: 1 });
export default models.Employee || model("Employee", EmployeeSchema);
