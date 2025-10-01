
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Tenant from "@/models/Tenant";
import bcrypt from "bcrypt";

async function main() {
  await dbConnect();

  const tenantId = "demo";
  const email = "abdelqader.badarnah@gmail.com";
  const password = "admin";
  
  // Ensure the demo tenant exists
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    console.log(`Tenant '${tenantId}' not found. Creating it.`);
    await Tenant.create({ _id: tenantId, name: "Demo Inc" });
  }

  const existingUser = await User.findOne({ tenantId, email });
  if (existingUser) {
    console.log(`User with email ${email} already exists for tenant ${tenantId}.`);
    // Optionally update password
    const passwordHash = await bcrypt.hash(password, 12);
    existingUser.passwordHash = passwordHash;
    await existingUser.save();
    console.log("Password updated.");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    tenantId: tenantId,
    email: email.toLowerCase(),
    name: "Abdelqader B.",
    passwordHash,
    role: "OWNER",
  });

  console.log("User created successfully for tenant 'demo':");
  console.log(`Email: ${user.email}`);
  console.log(`Role: ${user.role}`);
}

main()
  .then(() => {
    console.log("Script finished.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error creating user:", error);
    process.exit(1);
  });
