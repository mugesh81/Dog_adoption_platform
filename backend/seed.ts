import mongoose from 'mongoose';
import { Donor } from './src/models/Donor';
import { DogLegacy } from './src/models/DogLegacy';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dog-adoption-platform';

const TAMIL_DOGS = [
  {
    name: 'Mani',
    breed: 'Rajapalayam',
    age: 2,
    health: 'Healthy',
    vaccinated: true,
    location: 'Chennai',
    description: 'A purebred Rajapalayam with a pristine white coat and signature pink nose. Very loyal, protective of family, and needs an active home with a large garden.',
    imageUrl: '/uploads/rajapalayam_dog_1780597203729.png', 
  },
  {
    name: 'Karuppu',
    breed: 'Kombai',
    age: 1,
    health: 'Healthy',
    vaccinated: true,
    location: 'Madurai',
    description: 'An alert Kombai guard dog. Very active, highly intelligent, and thrives on play and exercise. Great with children when socialized.',
    imageUrl: '/uploads/kombai_dog_1780597218366.png', 
  },
  {
    name: 'Rani',
    breed: 'Chippiparai',
    age: 3,
    health: 'Healthy',
    vaccinated: true,
    location: 'Coimbatore',
    description: 'A graceful Chippiparai sighthound. Exceptionally slim, athletic, and gentle-natured. Loves running and requires a high-quality diet.',
    imageUrl: '/uploads/chippiparai_dog_1780597232018.png', 
  },
  {
    name: 'Chella',
    breed: 'Kanni',
    age: 2,
    health: 'Healthy',
    vaccinated: false,
    location: 'Trichy',
    description: 'A beautiful black-and-tan Kanni sighthound. Extremely fast, quiet, and deeply affectionate towards family members.',
    imageUrl: '/uploads/kanni_dog_1780597248599.png', 
  },
  {
    name: 'Anjali',
    breed: 'Native Street Puppy',
    age: 0, // Puppy
    health: 'Healthy',
    vaccinated: true,
    location: 'Salem',
    description: 'A cute and playful native Indian pariah puppy rescued from a bazaar in Salem. Friendly, healthy, and gets along well with other pets.',
    imageUrl: '/uploads/indie_puppy_1780597262441.png', 
  },
  {
    name: 'Veera',
    breed: 'Native Indie (Stray)',
    age: 4,
    health: 'Healthy',
    vaccinated: true,
    location: 'Thanjavur',
    description: 'A smart and resilient native Indie dog rescued from a street corner. Very alert, makes an excellent watch companion, and adapts quickly.',
    imageUrl: '/uploads/mudhol_hound_1780597274371.png', 
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding sample Tamil Nadu dogs...');

    // Clean old seed data
    await DogLegacy.deleteMany({});
    console.log('Deleted all old dogs.');

    let donor = await Donor.findOne({ email: 'tamilnadurelief@paws.org' });
    if (!donor) {
      donor = await Donor.create({
        name: 'Tamil Nadu Animal Rescue',
        email: 'tamilnadurelief@paws.org',
        phone: '9876543210',
        address: '12, Anna Salai, Chennai, Tamil Nadu',
      });
      console.log('Created Tamil Nadu Animal Rescue donor profile.');
    }

    for (const dogData of TAMIL_DOGS) {
      await DogLegacy.create({
        ...dogData,
        donorId: donor._id,
        adopted: false
      });
      console.log(`Successfully seeded dog: ${dogData.name} (${dogData.breed}) in ${dogData.location}`);
    }

    console.log('Seeding finished successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
