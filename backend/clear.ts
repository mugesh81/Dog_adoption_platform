import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { User, Dog, AdoptionApplication } from './src/models/index';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dog-adoption-platform';

async function clearDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('🗑️  Clearing v2 data...\n');

    const [users, dogs, apps] = await Promise.all([
      User.deleteMany({}),
      Dog.deleteMany({}),
      AdoptionApplication.deleteMany({}),
    ]);

    console.log(`   Deleted ${users.deletedCount} users`);
    console.log(`   Deleted ${dogs.deletedCount} dogs`);
    console.log(`   Deleted ${apps.deletedCount} applications`);

    console.log('\n✨ Database cleared! Run "npm run seed" to populate with test data.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to clear database:', error);
    process.exit(1);
  }
}

clearDatabase();
