import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../server/src/models/User';

async function seed() {
  const uri = process.env.MONGO_URI ?? 'mongodb://localhost:27017/boundary_map';
  await mongoose.connect(uri);

  const exists = await User.exists({});
  if (exists) {
    console.log('Admin user already exists — skipping seed.');
    await mongoose.disconnect();
    return;
  }

  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'changeme123';

  await User.create({ email, password, role: 'admin' });
  console.log(`Admin user created: ${email}`);
  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
