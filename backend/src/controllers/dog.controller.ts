import { Request, Response } from 'express';
import { Dog } from '../models/Dog';

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
        maxDistance = 50000 // 50km default
      } = req.query;

      let query: any = { adopted: false };

      if (breed) query.breed = new RegExp(breed as string, 'i');
      if (size) query.size = size;
      if (gender) query.gender = gender;
      
      if (ageMin || ageMax) {
        query.age = {};
        if (ageMin) query.age.$gte = Number(ageMin);
        if (ageMax) query.age.$lte = Number(ageMax);
      }

      // Geospatial search
      if (lng && lat) {
        query.location = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [Number(lng), Number(lat)]
            },
            $maxDistance: Number(maxDistance)
          }
        };
      }

      const dogs = await Dog.find(query)
        .populate('listedBy', 'name shelterRegistrationNumber')
        .limit(Number(limit) * 1)
        .skip((Number(page) - 1) * Number(limit))
        .exec();

      const count = await Dog.countDocuments(query);

      res.status(200).json({
        success: true,
        data: dogs,
        totalPages: Math.ceil(count / Number(limit)),
        currentPage: Number(page),
        total: count
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getDogById(req: Request, res: Response) {
    try {
      const dog = await Dog.findById(req.params.id).populate('listedBy', 'name email shelterRegistrationNumber phone');
      if (!dog) {
        return res.status(404).json({ success: false, message: 'Dog not found' });
      }
      res.status(200).json({ success: true, data: dog });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
