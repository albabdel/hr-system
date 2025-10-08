import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  tenantId: { type: String, required: true, index: true },
  email: { type: String, required: true, unique: true, index: true },
  name: { type: String },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['OWNER', 'HR_ADMIN', 'MANAGER', 'EMPLOYEE'], 
    default: 'EMPLOYEE' 
  },
}, { timestamps: true });

UserSchema.index({ tenantId: 1, email: 1 }, { unique: true });

export default models.User || model('User', UserSchema);
