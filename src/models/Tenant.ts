import { Schema, model, models } from 'mongoose';

const TenantSchema = new Schema({
  _id: { type: String, required: true }, // Use tenant slug as the ID
  name: { type: String, required: true },
  setupComplete: { type: Boolean, default: false },
  theme: {
    logoUrl: String,
    primary: String,
  }
}, { timestamps: true });

export default models.Tenant || model('Tenant', TenantSchema);
