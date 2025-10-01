
// run: npx tsx src/scripts/create-user.ts
import "dotenv/config";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error("MONGODB_URI missing");

const TenantSchema = new mongoose.Schema({
  _id: String, name: String, theme: { logoUrl: String, primary: String }
});
const UserSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, index: true },
  email: { type: String, required: true, index: true },
  name: String,
  passwordHash: String,
  role: { type: String, enum: ["OWNER","HR_ADMIN","MANAGER","EMPLOYEE"], default: "OWNER" },
}, { timestamps: true });

const Tenant = mongoose.models.Tenant || mongoose.model("Tenant", TenantSchema);
const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function main() {
  await mongoose.connect(MONGODB_URI, { dbName: "vrs" });

  const tenantId = "demo";
  const email = "abdelqader.badarnah@gmail.com";
  const password = "admin";

  // Ensure tenant exists
  const t = await Tenant.findById(tenantId);
  if (!t) {
    await Tenant.create({ _id: tenantId, name: "Demo Inc", theme: { primary: "#ffda47" } });
    console.log("Created tenant:", tenantId);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  // Upsert user for this tenant
  const u = await User.findOneAndUpdate(
    { tenantId, email: email.toLowerCase() },
    { $set: { name: "Abed (Owner)", passwordHash, role: "OWNER" } },
    { new: true, upsert: true }
  );

  console.log("User ready:");
  console.log({ tenantId, email: u.email, role: u.role });
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
