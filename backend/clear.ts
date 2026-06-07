import mongoose from 'mongoose';
import { DogLegacy } from './src/models/DogLegacy';
import { Dog } from './src/models/Dog';
import { AdoptionRequest } from './src/models/AdoptionRequest';
import { AdoptionApplication } from './src/models/AdoptionApplication';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dog-adoption-platform';

async function clearDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB. Deleting all dog records and requests...');

    const resLegacyDogs = await DogLegacy.deleteMany({});
    const resDogs = await Dog.deleteMany({});
    const resRequests = await AdoptionRequest.deleteMany({});
    const resApps = await AdoptionApplication.deleteMany({});

    console.log(`Deleted ${resLegacyDogs.deletedCount} legacy dogs.`);
    console.log(`Deleted ${resDogs.deletedCount} new-style dogs.`);
    console.log(`Deleted ${resRequests.deletedCount} adoption requests.`);
    console.log(`Deleted ${resApps.deletedCount} applications.`);

    console.log('Database clear completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to clear database:', error);
    process.exit(1);
  }
}

clearDatabase();
