// To run: npx tsx src/scripts/create-user.ts
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import Tenant from '@/models/Tenant';
import User from '@/models/User';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error('MONGODB_URI must be defined in .env');

async function main() {
  await mongoose.connect(MONGODB_URI, { dbName: 'vrs' });
  console.log('Connected to database.');

  const tenantId = 'verifiedrecruitmentservices';
  const tenantName = 'VRS';
  const adminEmail = 'abdelqader.badarnah@gmail.com';
  const adminPassword = 'admin';

  // 1. Create or update the tenant
  const tenant = await Tenant.findByIdAndUpdate(
    tenantId,
    {
      _id: tenantId,
      name: tenantName,
      theme: { primary: '#ffda47' },
      setupComplete: true,
    },
    { upsert: true, new: true }
  );
  console.log(`Tenant '${tenant.name}' (${tenant._id}) ensured.`);

  // 2. Hash the password
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  console.log('Password hashed.');

  // 3. Create or update the user
  const user = await User.findOneAndUpdate(
    { email: adminEmail.toLowerCase() },
    {
      $set: {
        tenantId: tenantId,
        name: 'Abdelqader Badarnah',
        passwordHash: passwordHash,
        role: 'OWNER',
      },
    },
    { upsert: true, new: true }
  );
  console.log(`User '${user.name}' (${user.email}) ensured for tenant '${user.tenantId}'.`);

  await mongoose.disconnect();
  console.log('Database connection closed.');
  console.log('---');
  console.log('Seed script finished successfully.');
  console.log('You can now log in with:');
  console.log(`- Tenant: ${tenantId}`);
  console.log(`- Email: ${adminEmail}`);
  console.log(`- Password: ${adminPassword}`);
}

main().catch((e) => {
  console.error('An error occurred during seeding:', e);
  process.exit(1);
});
