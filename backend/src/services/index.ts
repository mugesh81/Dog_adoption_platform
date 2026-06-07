import { Donor, Adopter, DogLegacy as Dog, AdoptionRequest } from '../models/index';

// ─── Validation helpers ───────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[6-9]\d{9}$/; // Indian mobile numbers

function validateEmail(email: string) {
    if (!email || !EMAIL_RE.test(email.trim())) throw new Error('Invalid email address');
}
function validatePhone(phone: string) {
    if (!phone || !PHONE_RE.test(phone.trim())) throw new Error('Phone must be a valid 10-digit Indian mobile number starting with 6-9');
}
function validateRequired(value: string, field: string) {
    if (!value || value.trim().length < 2) throw new Error(`${field} is required and must be at least 2 characters`);
}

// ─── Donor Service ────────────────────────────────────────────────────────────
export const DonorService = {
    async registerDonor(data: any) {
        validateRequired(data.name, 'Name');
        validateEmail(data.email);
        validatePhone(data.phone);
        validateRequired(data.address, 'Address');

        const existing = await Donor.findOne({ email: data.email.trim().toLowerCase() });
        if (existing) throw new Error('An account with this email already exists');

        const donor = new Donor(data);
        await donor.save();
        return donor;
    },

    async getDonor(id: string) {
        return await Donor.findById(id);
    },

    async getAllDonors() {
        return await Donor.find();
    }
};

// ─── Adopter Service ──────────────────────────────────────────────────────────
export const AdopterService = {
    async registerAdopter(data: any) {
        validateRequired(data.name, 'Name');
        validateEmail(data.email);
        validatePhone(data.phone);
        validateRequired(data.address, 'Address');
        validateRequired(data.experience, 'Experience');
        if (!data.homeType || !['apartment', 'house', 'farm'].includes(data.homeType)) {
            throw new Error('Home type must be apartment, house, or farm');
        }

        const existing = await Adopter.findOne({ email: data.email.trim().toLowerCase() });
        if (existing) throw new Error('An account with this email already exists');

        const adopter = new Adopter(data);
        await adopter.save();
        return adopter;
    },

    async getAdopter(id: string) {
        return await Adopter.findById(id);
    },

    async getAllAdopters() {
        return await Adopter.find();
    },

    async verifyAdopter(id: string) {
        return await Adopter.findByIdAndUpdate(id, { verified: true }, { new: true });
    }
};

// ─── Dog Service ──────────────────────────────────────────────────────────────
export const DogService = {
    async createDog(data: any) {
        validateRequired(data.name, 'Dog name');
        validateRequired(data.breed, 'Breed');
        validateRequired(data.location, 'Location');
        if (!data.description || data.description.trim().length < 10) {
            throw new Error('Description must be at least 10 characters');
        }
        const age = Number(data.age);
        if (isNaN(age) || age < 0 || age > 30) throw new Error('Age must be between 0 and 30');

        const dog = new Dog({ ...data, age });
        await dog.save();
        return dog;
    },

    async getDog(id: string) {
        return await Dog.findById(id).populate('donorId');
    },

    async getAllDogs(filters: any = {}) {
        const query: any = { adopted: false };
        if (filters.search) {
            const re = new RegExp(filters.search, 'i');
            query.$or = [{ name: re }, { breed: re }, { location: re }];
        }
        if (filters.location) query.location = new RegExp(filters.location, 'i');
        if (filters.vaccinated === 'true') query.vaccinated = true;
        if (filters.health) query.health = filters.health;
        if (filters.minAge !== undefined) query.age = { ...query.age, $gte: Number(filters.minAge) };
        if (filters.maxAge !== undefined) query.age = { ...query.age, $lte: Number(filters.maxAge) };

        return await Dog.find(query).populate('donorId').sort({ createdAt: -1 });
    },

    async adoptDog(dogId: string) {
        const dog = await Dog.findById(dogId);
        if (!dog) throw new Error('Dog not found');
        if (dog.adopted) throw new Error('This dog has already been adopted');
        return await Dog.findByIdAndUpdate(dogId, { adopted: true }, { new: true });
    },

    async getDogsByDonor(donorId: string) {
        return await Dog.find({ donorId }).sort({ createdAt: -1 });
    },

    async getStats() {
        const [total, adopted, available, vaccinated] = await Promise.all([
            Dog.countDocuments(),
            Dog.countDocuments({ adopted: true }),
            Dog.countDocuments({ adopted: false }),
            Dog.countDocuments({ vaccinated: true }),
        ]);
        const adopters = await Adopter.countDocuments();
        const donors   = await Donor.countDocuments();
        return { total, adopted, available, vaccinated, adopters, donors };
    }
};

// ─── Adoption Request Service ─────────────────────────────────────────────────
export const AdoptionRequestService = {
    async create(data: any) {
        validateRequired(data.adopterName, 'Your name');
        validateEmail(data.adopterEmail);
        validatePhone(data.adopterPhone);

        const dog = await Dog.findById(data.dogId);
        if (!dog) throw new Error('Dog not found');
        if (dog.adopted) throw new Error('This dog has already been adopted');

        // Check duplicate request
        const existing = await AdoptionRequest.findOne({ dogId: data.dogId, adopterEmail: data.adopterEmail.trim().toLowerCase() });
        if (existing) throw new Error('You have already submitted a request for this dog');

        const req = new AdoptionRequest({ ...data, adopterEmail: data.adopterEmail.trim().toLowerCase() });
        await req.save();
        return req;
    },

    async getByDog(dogId: string) {
        return await AdoptionRequest.find({ dogId }).sort({ createdAt: -1 });
    },

    async getAll() {
        return await AdoptionRequest.find().populate('dogId').sort({ createdAt: -1 });
    },

    async approve(requestId: string) {
        const request = await AdoptionRequest.findById(requestId).populate('dogId');
        if (!request) throw new Error('Request not found');
        await AdoptionRequest.findByIdAndUpdate(requestId, { status: 'approved' });
        // Mark dog as adopted
        await Dog.findByIdAndUpdate(request.dogId, { adopted: true });
        // Reject all other pending requests for same dog
        await AdoptionRequest.updateMany(
            { dogId: request.dogId, _id: { $ne: requestId }, status: 'pending' },
            { status: 'rejected' }
        );
        return request;
    },

    async reject(requestId: string) {
        return await AdoptionRequest.findByIdAndUpdate(requestId, { status: 'rejected' }, { new: true });
    }
};
