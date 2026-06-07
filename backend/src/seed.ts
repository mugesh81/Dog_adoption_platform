import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { Donor, Dog } from './models/index';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dog-adoption-platform';

const seedData = [
  {
    donor: {
      name: 'Arjun Krishnamurthy',
      email: 'arjun.k@gmail.com',
      phone: '9841023456',
      address: 'Anna Nagar, Chennai, Tamil Nadu',
    },
    dog: {
      name: 'Raja',
      breed: 'Rajapalayam',
      age: 3,
      health: 'Healthy',
      vaccinated: true,
      location: 'Chennai',
      imageUrl: '/uploads/seed-raja.png',
      description: 'Raja is a majestic purebred Rajapalayam — a proud Tamil Nadu native breed. He is loyal, alert, and loves open spaces. Great with families who have a yard. Fully vaccinated and dewormed.',
    },
  },
  {
    donor: {
      name: 'Priya Sundaram',
      email: 'priya.sundaram@yahoo.com',
      phone: '9944112233',
      address: 'RS Puram, Coimbatore, Tamil Nadu',
    },
    dog: {
      name: 'Meena',
      breed: 'Indian Pariah',
      age: 1,
      health: 'Healthy',
      vaccinated: true,
      location: 'Coimbatore',
      imageUrl: '/uploads/seed-meena.png',
      description: 'Meena is a sweet, playful one-year-old Indian Pariah rescued from the streets of Coimbatore. She is friendly with children, loves cuddles, and is already house-trained. Looking for a forever home.',
    },
  },
  {
    donor: {
      name: 'Selvam Murugan',
      email: 'selvam.m@hotmail.com',
      phone: '9787654321',
      address: 'Madurai South, Madurai, Tamil Nadu',
    },
    dog: {
      name: 'Veeran',
      breed: 'Kombai',
      age: 2,
      health: 'Healthy',
      vaccinated: false,
      location: 'Madurai',
      imageUrl: '/uploads/seed-veeran.png',
      description: 'Veeran is a brave and energetic Kombai — an ancient Tamil hunting breed. He is intelligent, protective, and bonds deeply with his family. Best suited for experienced dog owners with space to run.',
    },
  },
  {
    donor: {
      name: 'Kavitha Rajan',
      email: 'kavitha.rajan@gmail.com',
      phone: '9600345678',
      address: 'Lawspet, Puducherry, Tamil Nadu',
    },
    dog: {
      name: 'Chella',
      breed: 'Chippiparai',
      age: 4,
      health: 'Healthy',
      vaccinated: true,
      location: 'Puducherry',
      imageUrl: '/uploads/seed-chella.png',
      description: 'Chella is a graceful Chippiparai sighthound from Puducherry. She is calm, elegant, and extremely fast. She loves morning runs and is very gentle indoors. Vaccinated and well-socialized.',
    },
  },
  {
    donor: {
      name: 'Dinesh Babu',
      email: 'dinesh.babu@gmail.com',
      phone: '9500112244',
      address: 'Palayamkottai, Tirunelveli, Tamil Nadu',
    },
    dog: {
      name: 'Karthik',
      breed: 'Kanni',
      age: 2,
      health: 'Minor Care Required',
      vaccinated: true,
      location: 'Tirunelveli',
      imageUrl: '/uploads/seed-karthik.png',
      description: 'Karthik is a rare Kanni breed dog from Tirunelveli. He had a minor leg injury that has fully healed. He is gentle, quiet, and very affectionate. Needs a calm home environment. Vaccinated.',
    },
  },
  {
    donor: {
      name: 'Lakshmi Venkatesh',
      email: 'lakshmi.v@gmail.com',
      phone: '9345678901',
      address: 'Cantonment, Trichy, Tamil Nadu',
    },
    dog: {
      name: 'Ponni',
      breed: 'Indian Pariah',
      age: 0,
      health: 'Healthy',
      vaccinated: false,
      location: 'Trichy',
      imageUrl: '/uploads/seed-ponni.png',
      description: 'Ponni is an adorable 4-month-old puppy found near the Cauvery riverbank in Trichy. She is curious, playful, and full of energy. First vaccinations pending — new owner to complete. Perfect for first-time dog parents.',
    },
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as any);
    console.log('Connected to MongoDB');

    // Check if already seeded
    const existingCount = await Dog.countDocuments();
    if (existingCount > 0) {
      console.log(`Database already has ${existingCount} dogs. Skipping seed.`);
      process.exit(0);
    }

    for (const entry of seedData) {
      const donor = new Donor(entry.donor);
      await donor.save();
      const dog = new Dog({ ...entry.dog, donorId: donor._id });
      await dog.save();
      console.log(`✅ Added: ${entry.dog.name} (${entry.dog.breed}) from ${entry.dog.location}`);
    }

    console.log('\n🎉 Seeded 6 Tamil Nadu dog profiles successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
