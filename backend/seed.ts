import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, UserRole, Dog } from './src/models/index';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dog-adoption-platform';

// City coordinates for geospatial indexing
const CITY_COORDS: Record<string, [number, number]> = {
  Chennai: [80.2707, 13.0827],
  Coimbatore: [76.9558, 11.0168],
  Madurai: [78.1198, 9.9252],
  Trichy: [78.7047, 10.7905],
  Puducherry: [79.8083, 11.9416],
  Tirunelveli: [77.7567, 8.7139],
};

const seedData = [
  {
    user: {
      name: 'Arjun Krishnamurthy',
      email: 'arjun.k@gmail.com',
      password: 'donor123',
      role: UserRole.DONOR,
      phone: '9841023456',
      address: 'Anna Nagar, Chennai, Tamil Nadu',
    },
    dog: {
      name: 'Raja',
      breed: 'Rajapalayam',
      age: 36, // 3 years in months
      healthStatus: 'Healthy',
      vaccinated: true,
      location: 'Chennai',
      media: [{ url: '/uploads/seed-raja.png', type: 'image' as const }],
      description: 'Raja is a majestic purebred Rajapalayam — a proud Tamil Nadu native breed. He is loyal, alert, and loves open spaces. Great with families who have a yard. Fully vaccinated and dewormed.',
      gender: 'Male' as const,
      size: 'Large' as const,
    },
  },
  {
    user: {
      name: 'Priya Sundaram',
      email: 'priya.sundaram@yahoo.com',
      password: 'donor123',
      role: UserRole.DONOR,
      phone: '9944112233',
      address: 'RS Puram, Coimbatore, Tamil Nadu',
    },
    dog: {
      name: 'Meena',
      breed: 'Indian Pariah',
      age: 12, // 1 year in months
      healthStatus: 'Healthy',
      vaccinated: true,
      location: 'Coimbatore',
      media: [{ url: '/uploads/seed-meena.png', type: 'image' as const }],
      description: 'Meena is a sweet, playful one-year-old Indian Pariah rescued from the streets of Coimbatore. She is friendly with children, loves cuddles, and is already house-trained. Looking for a forever home.',
      gender: 'Female' as const,
      size: 'Medium' as const,
    },
  },
  {
    user: {
      name: 'Tamil Nadu Relief Shelter',
      email: 'tamilnadurelief@paws.org',
      password: 'shelter123',
      role: UserRole.SHELTER,
      phone: '9787654321',
      address: 'Madurai South, Madurai, Tamil Nadu',
      shelterRegistrationNumber: 'TN-SHELTER-2020-1234',
    },
    dog: {
      name: 'Veeran',
      breed: 'Kombai',
      age: 24, // 2 years in months
      healthStatus: 'Healthy',
      vaccinated: false,
      location: 'Madurai',
      media: [{ url: '/uploads/seed-veeran.png', type: 'image' as const }],
      description: 'Veeran is a brave and energetic Kombai — an ancient Tamil hunting breed. He is intelligent, protective, and bonds deeply with his family. Best suited for experienced dog owners with space to run.',
      gender: 'Male' as const,
      size: 'Large' as const,
    },
  },
  {
    user: {
      name: 'Kavitha Rajan',
      email: 'kavitha.rajan@gmail.com',
      password: 'donor123',
      role: UserRole.DONOR,
      phone: '9600345678',
      address: 'Lawspet, Puducherry, Tamil Nadu',
    },
    dog: {
      name: 'Chella',
      breed: 'Chippiparai',
      age: 48, // 4 years in months
      healthStatus: 'Healthy',
      vaccinated: true,
      location: 'Puducherry',
      media: [{ url: '/uploads/seed-chella.png', type: 'image' as const }],
      description: 'Chella is a graceful Chippiparai sighthound from Puducherry. She is calm, elegant, and extremely fast. She loves morning runs and is very gentle indoors. Vaccinated and well-socialized.',
      gender: 'Female' as const,
      size: 'Medium' as const,
    },
  },
  {
    user: {
      name: 'Dinesh Babu',
      email: 'dinesh.babu@gmail.com',
      password: 'donor123',
      role: UserRole.DONOR,
      phone: '9500112244',
      address: 'Palayamkottai, Tirunelveli, Tamil Nadu',
    },
    dog: {
      name: 'Karthik',
      breed: 'Kanni',
      age: 24, // 2 years in months
      healthStatus: 'Minor Care Required',
      vaccinated: true,
      location: 'Tirunelveli',
      media: [{ url: '/uploads/seed-karthik.png', type: 'image' as const }],
      description: 'Karthik is a rare Kanni breed dog from Tirunelveli. He had a minor leg injury that has fully healed. He is gentle, quiet, and very affectionate. Needs a calm home environment. Vaccinated.',
      gender: 'Male' as const,
      size: 'Medium' as const,
    },
  },
  {
    user: {
      name: 'Lakshmi Venkatesh',
      email: 'lakshmi.v@gmail.com',
      password: 'donor123',
      role: UserRole.DONOR,
      phone: '9345678901',
      address: 'Cantonment, Trichy, Tamil Nadu',
    },
    dog: {
      name: 'Ponni',
      breed: 'Indian Pariah',
      age: 4, // 4 months
      healthStatus: 'Healthy',
      vaccinated: false,
      location: 'Trichy',
      media: [{ url: '/uploads/seed-ponni.png', type: 'image' as const }],
      description: 'Ponni is an adorable 4-month-old puppy found near the Cauvery riverbank in Trichy. She is curious, playful, and full of energy. First vaccinations pending — new owner to complete. Perfect for first-time dog parents.',
      gender: 'Female' as const,
      size: 'Small' as const,
    },
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as any);
    console.log('✅ Connected to MongoDB');

    // Check if already seeded
    const existingDogs = await Dog.countDocuments();
    if (existingDogs > 0) {
      console.log(`⚠️  Database already has ${existingDogs} dogs. Skipping seed.`);
      console.log('   To re-seed, clear the database first with: npm run clear');
      process.exit(0);
    }

    console.log('🌱 Starting seed process...\n');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@paws.org',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      phone: '9999999999',
      isVerified: true,
    });
    console.log(`✅ Created admin: ${admin.email} / admin123`);

    // Create test adopter
    const adopterPassword = await bcrypt.hash('adopter123', 10);
    const adopter = await User.create({
      name: 'Test Adopter',
      email: 'adopter@test.com',
      passwordHash: adopterPassword,
      role: UserRole.ADOPTER,
      phone: '9876543210',
      address: 'Test Address, Chennai',
      experience: 'Have owned dogs for 5 years',
      homeType: 'house',
      isVerified: false,
    });
    console.log(`✅ Created adopter: ${adopter.email} / adopter123\n`);

    // Create donors/shelters and their dogs
    for (const entry of seedData) {
      const password = await bcrypt.hash(entry.user.password, 10);
      const user = await User.create({
        ...entry.user,
        passwordHash: password,
        isVerified: true,
      });

      const coords = CITY_COORDS[entry.dog.location] || [78.6569, 11.1271];
      const dog = await Dog.create({
        ...entry.dog,
        location: {
          type: 'Point',
          coordinates: coords,
          address: entry.dog.location,
        },
        listedBy: user._id,
      });

      console.log(`✅ ${entry.dog.name} (${entry.dog.breed}) from ${entry.dog.location} — listed by ${user.name}`);
    }

    console.log('\n🎉 Seeded 6 dogs + 8 users successfully!');
    console.log('\n📋 Test Accounts:');
    console.log('   Admin:    admin@paws.org / admin123');
    console.log('   Adopter:  adopter@test.com / adopter123');
    console.log('   Shelter:  tamilnadurelief@paws.org / shelter123');
    console.log('   Donors:   [see emails above] / donor123\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
