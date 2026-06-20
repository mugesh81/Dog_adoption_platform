import { Request, Response } from 'express';
import path from 'path';
import { Dog } from '../models/Dog';
import { User, UserRole } from '../models/User';
import { AdoptionApplication, ApplicationStatus } from '../models/AdoptionApplication';
import { NotificationController } from './notification.controller';
import { NotificationType } from '../models/Notification';

const CITY_COORDS: Record<string, [number, number]> = {
  Chennai: [80.2707, 13.0827],
  Coimbatore: [76.9558, 11.0168],
  Madurai: [78.1198, 9.9252],
  Trichy: [78.7047, 10.7905],
  Salem: [78.146, 11.6643],
  Tirunelveli: [77.7567, 8.7139],
  Puducherry: [79.8083, 11.9416],
  Vellore: [79.1325, 12.9165],
  Erode: [77.7172, 11.341],
  Thanjavur: [79.1378, 10.787],
};

function resolveCoordinates(city: string): [number, number] {
  for (const [name, coords] of Object.entries(CITY_COORDS)) {
    if (city.toLowerCase().includes(name.toLowerCase())) return coords;
  }
  return [78.6569, 11.1271];
}

export class DogController {
  async getDogs(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 10,
        breed,
        size,
        gender,
        ageMin,
        ageMax,
        lng,
        lat,
        maxDistance = 50000,
        search,
        location,
        healthStatus,
        health,
        vaccinated,
      } = req.query;

      const query: any = { adopted: false };

      if (breed) query.breed = new RegExp(breed as string, 'i');
      if (size) query.size = size;
      if (gender) query.gender = gender;

      const healthFilter = (healthStatus || health) as string | undefined;
      if (healthFilter) query.healthStatus = healthFilter;

      if (vaccinated === 'true') query.vaccinated = true;

      if (ageMin || ageMax) {
        query.age = {};
        if (ageMin) query.age.$gte = Number(ageMin);
        if (ageMax) query.age.$lte = Number(ageMax);
      }

      if (search) {
        const pattern = new RegExp(search as string, 'i');
        query.$or = [{ name: pattern }, { breed: pattern }, { 'location.address': pattern }];
      } else if (location) {
        query['location.address'] = new RegExp(location as string, 'i');
      }

      if (lng && lat) {
        query.location = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [Number(lng), Number(lat)],
            },
            $maxDistance: Number(maxDistance),
          },
        };
      }

      const dogs = await Dog.find(query)
        .populate('listedBy', 'name phone email shelterRegistrationNumber')
        .limit(Number(limit) * 1)
        .skip((Number(page) - 1) * Number(limit))
        .exec();

      const count = await Dog.countDocuments(query);

      res.status(200).json({
        success: true,
        data: dogs,
        totalPages: Math.ceil(count / Number(limit)),
        currentPage: Number(page),
        total: count,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getDogById(req: Request, res: Response) {
    try {
      const dog = await Dog.findById(req.params.id).populate(
        'listedBy',
        'name email phone address shelterRegistrationNumber'
      );
      if (!dog) {
        return res.status(404).json({ success: false, message: 'Dog not found' });
      }
      res.status(200).json({ success: true, data: dog });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createDog(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const {
        name,
        breed,
        age,
        healthStatus = 'Healthy',
        vaccinated,
        location,
        description,
        gender = 'Male',
        size = 'Medium',
      } = req.body;

      if (!name || !breed || age === undefined || !location || !description) {
        return res.status(400).json({ success: false, message: 'Missing required dog fields' });
      }

      const ageYears = Number(age);
      const ageMonths = Math.round(ageYears * 12);

      const media: { url: string; type: 'image' | 'video' }[] = [];
      if (req.file) {
        media.push({ url: `/uploads/${req.file.filename}`, type: 'image' });
      }

      const [lng, lat] = resolveCoordinates(location);

      const dog = await Dog.create({
        name,
        breed,
        age: ageMonths,
        healthStatus,
        vaccinated: vaccinated === true || vaccinated === 'true',
        location: {
          type: 'Point',
          coordinates: [lng, lat],
          address: location,
        },
        description,
        media,
        listedBy: userId,
        gender,
        size,
      });

      res.status(201).json({ success: true, data: dog });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateDog(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;
      const { id } = req.params;
      const {
        name,
        breed,
        age,
        healthStatus,
        vaccinated,
        location,
        description,
        gender,
        size,
      } = req.body;

      const dog = await Dog.findById(id);
      if (!dog) {
        return res.status(404).json({ success: false, message: 'Dog not found' });
      }

      // Only owner or admin can update
      if (userRole !== UserRole.ADMIN && dog.listedBy.toString() !== userId) {
        return res.status(403).json({ success: false, message: 'Not authorized to edit this listing' });
      }

      // Update fields
      if (name) dog.name = name;
      if (breed) dog.breed = breed;
      if (age !== undefined) dog.age = Math.round(Number(age) * 12);
      if (healthStatus) dog.healthStatus = healthStatus;
      if (vaccinated !== undefined) dog.vaccinated = vaccinated === true || vaccinated === 'true';
      if (description) dog.description = description;
      if (gender) dog.gender = gender;
      if (size) dog.size = size;

      if (location && location !== dog.location.address) {
        const [lng, lat] = resolveCoordinates(location);
        dog.location = {
          type: 'Point',
          coordinates: [lng, lat],
          address: location,
        };
      }

      // Handle image update
      if (req.file) {
        dog.media = [{ url: `/uploads/${req.file.filename}`, type: 'image' }];
      }

      await dog.save();

      // BUG-05 FIX: Notify adopters with active applications that the listing changed
      const dogId = id as string;
      const activeApplications = await AdoptionApplication.find({
        dogId,
        status: {
          $in: [
            ApplicationStatus.PENDING,
            ApplicationStatus.UNDER_REVIEW,
            ApplicationStatus.INTERVIEW_SCHEDULED,
            ApplicationStatus.HOME_VISIT_SCHEDULED,
          ],
        },
      });

      for (const app of activeApplications) {
        await NotificationController.createNotification(
          app.adopterId.toString(),
          NotificationType.APPLICATION_STATUS_CHANGE,
          'Listing Updated',
          `The listing for ${dog.name} has been updated by the owner. Please review the changes.`,
          app._id.toString(),
          dog._id.toString()
        );
      }

      res.status(200).json({ success: true, data: dog });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async deleteDog(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;
      const { id } = req.params;
      const dogId = typeof id === 'string' ? id : id[0];

      const dog = await Dog.findById(dogId);
      if (!dog) {
        return res.status(404).json({ success: false, message: 'Dog not found' });
      }

      // Only owner or admin can delete
      if (userRole !== UserRole.ADMIN && dog.listedBy.toString() !== userId) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this listing' });
      }

      // Check for pending applications
      const filter = {
        dogId: dogId,
        status: { $in: [ApplicationStatus.PENDING, ApplicationStatus.UNDER_REVIEW, ApplicationStatus.INTERVIEW_SCHEDULED] },
      };
      const pendingApplications = await AdoptionApplication.find(filter).exec();
      const pendingApps = pendingApplications.length;

      if (pendingApps > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete: ${pendingApps} pending application(s) exist. Please resolve them first.`,
        });
      }

      await Dog.findByIdAndDelete(dogId);

      res.status(200).json({ success: true, message: 'Dog listing deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async toggleAdoptedStatus(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;
      const { id } = req.params;
      const { adopted } = req.body;

      if (typeof adopted !== 'boolean') {
        return res.status(400).json({ success: false, message: 'adopted field must be boolean' });
      }

      const dog = await Dog.findById(id);
      if (!dog) {
        return res.status(404).json({ success: false, message: 'Dog not found' });
      }

      if (userRole !== UserRole.ADMIN && dog.listedBy.toString() !== userId) {
        return res.status(403).json({ success: false, message: 'Not authorized to modify this listing' });
      }

      dog.adopted = adopted;
      await dog.save();

      // BUG-02 FIX: When marking adopted=true directly, auto-reject all open applications
      if (adopted === true) {
        const dogIdStr = id as string;
        const openApplications = await AdoptionApplication.find({
          dogId: dogIdStr,
          status: {
            $in: [
              ApplicationStatus.PENDING,
              ApplicationStatus.UNDER_REVIEW,
              ApplicationStatus.INTERVIEW_SCHEDULED,
              ApplicationStatus.HOME_VISIT_SCHEDULED,
            ],
          },
        });

        if (openApplications.length > 0) {
          await AdoptionApplication.updateMany(
            {
              dogId: dogIdStr,
              status: {
                $in: [
                  ApplicationStatus.PENDING,
                  ApplicationStatus.UNDER_REVIEW,
                  ApplicationStatus.INTERVIEW_SCHEDULED,
                  ApplicationStatus.HOME_VISIT_SCHEDULED,
                ],
              },
            },
            {
              status: ApplicationStatus.REJECTED,
              rejectionReason: 'The dog has been marked as adopted by the owner.',
            }
          );

          for (const app of openApplications) {
            await NotificationController.createNotification(
              app.adopterId.toString(),
              NotificationType.APPLICATION_STATUS_CHANGE,
              'Application Closed',
              `${dog.name} has been marked as adopted. Your application has been closed.`,
              app._id.toString(),
              dog._id.toString()
            );
          }
        }
      }

      res.status(200).json({
        success: true,
        data: dog,
        message: `Dog marked as ${adopted ? 'adopted' : 'available'}`,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getMyListings(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      const dogs = await Dog.find({ listedBy: userId })
        .populate('listedBy', 'name email phone')
        .sort({ createdAt: -1 });

      res.status(200).json({ success: true, data: dogs, total: dogs.length });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getPlatformStats(_req: Request, res: Response) {
    try {
      const [available, adopted, adopters, donors, shelters, applications] = await Promise.all([
        Dog.countDocuments({ adopted: false }),
        Dog.countDocuments({ adopted: true }),
        User.countDocuments({ role: UserRole.ADOPTER }),
        User.countDocuments({ role: UserRole.DONOR }),
        User.countDocuments({ role: UserRole.SHELTER }),
        AdoptionApplication.countDocuments(),
      ]);

      res.json({
        success: true,
        data: {
          available,
          adopted,
          adopters,
          donors: donors + shelters,
          applications,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
