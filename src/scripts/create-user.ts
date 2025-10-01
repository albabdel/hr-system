
// run: npx tsx src/scripts/create-user.ts
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Tenant from "@/models/Tenant";
import User from "@/models/User";

async function main() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI missing");
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "vrs" });

  const tenantId = "demo";
  const email = "abdelqader.badarnah@gmail.com";
  const password = "admin";

  await Tenant.findByIdAndUpdate(tenantId, { _id: tenantId, name: "Demo", theme:{primary:"#ffda47"} }, { upsert: true, new: true });
  console.log("Upserted tenant:", tenantId);
  
  const passwordHash = await bcrypt.hash(password, 12);
  await User.findOneAndUpdate(
    { tenantId, email: email.toLowerCase() },
    { $set: { name: "Abed", passwordHash, role: "OWNER" } },
    { upsert: true, new: true }
  );

  console.log("User created:", email, "tenant:", tenantId);
  await mongoose.disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
