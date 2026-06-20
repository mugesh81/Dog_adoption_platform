// ─────────────────────────────────────────────────────────────────────────────
// ⚠️  DEPRECATED LEGACY CONTROLLERS (V1) — DO NOT USE IN NEW CODE
// ─────────────────────────────────────────────────────────────────────────────
// This file contains v1 controllers that use legacy services/models.
// 
// All new code should use V2 controllers:
//   - AuthController (backend/src/controllers/auth.controller.ts)
//   - DogController (backend/src/controllers/dog.controller.ts)
//   - ApplicationController (backend/src/controllers/application.controller.ts)
//
// This file is kept ONLY for backward compatibility with legacy routes.
// ─────────────────────────────────────────────────────────────────────────────

import { Request, Response } from 'express';
import { DonorService, AdopterService, DogService, AdoptionRequestService } from '../services/index';
import fs from 'fs';

export class DonorController {
    async registerDonor(req: Request, res: Response) {
        try {
            const donor = await DonorService.registerDonor(req.body);
            res.status(201).json({ success: true, data: donor, message: 'Donor registered successfully' });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async listDogs(req: Request, res: Response) {
        try {
            const dogs = await DogService.getAllDogs(req.query);
            res.status(200).json({ success: true, data: dogs, count: dogs.length });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getDogDetails(req: Request, res: Response) {
        try {
            const dog = await DogService.getDog(req.params.id as string);
            if (!dog) return res.status(404).json({ success: false, message: 'Dog not found' });
            res.status(200).json({ success: true, data: dog });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getDonorDogs(req: Request, res: Response) {
        try {
            const dogs = await DogService.getDogsByDonor(req.params.donorId as string);
            res.status(200).json({ success: true, data: dogs });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async addDog(req: Request, res: Response) {
        try {
            const multerReq = req as any;
            const file = multerReq.file as { mimetype: string; size: number; path: string; filename: string } | undefined;
            if (file) {
                const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
                if (!ALLOWED.includes(file.mimetype)) {
                    try { fs.unlinkSync(file.path); } catch {}
                    return res.status(400).json({ success: false, message: 'Only JPEG, PNG, WebP, or GIF images are allowed' });
                }
                if (file.size > 5 * 1024 * 1024) {
                    try { fs.unlinkSync(file.path); } catch {}
                    return res.status(400).json({ success: false, message: 'Image must be smaller than 5MB' });
                }
            }
            const imageUrl = file ? '/uploads/' + file.filename : undefined;
            const dogData  = { ...req.body, donorId: req.params.donorId as string, ...(imageUrl && { imageUrl }) };
            const dog      = await DogService.createDog(dogData);
            res.status(201).json({ success: true, data: dog, message: 'Dog listed successfully' });
        } catch (error: any) {
            const multerReq = req as any;
            if (multerReq.file) { try { fs.unlinkSync(multerReq.file.path); } catch {} }
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getStats(req: Request, res: Response) {
        try {
            const stats = await DogService.getStats();
            res.status(200).json({ success: true, data: stats });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

export class AdopterController {
    async registerAdopter(req: Request, res: Response) {
        try {
            const adopter = await AdopterService.registerAdopter(req.body);
            res.status(201).json({ success: true, data: adopter, message: 'Adopter registered successfully' });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async browseDogs(req: Request, res: Response) {
        try {
            const dogs = await DogService.getAllDogs(req.query);
            res.status(200).json({ success: true, data: dogs, count: dogs.length });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async sendAdoptionRequest(req: Request, res: Response) {
        try {
            const { dogId, adopterName, adopterEmail, adopterPhone, message } = req.body;
            if (!dogId) return res.status(400).json({ success: false, message: 'dogId is required' });

            const request = await AdoptionRequestService.create({ dogId, adopterName, adopterEmail, adopterPhone, message });
            res.status(201).json({ success: true, data: request, message: 'Adoption request submitted successfully' });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async verifyAdopter(req: Request, res: Response) {
        try {
            const adopter = await AdopterService.verifyAdopter(req.params.adopterId as string);
            if (!adopter) return res.status(404).json({ success: false, message: 'Adopter not found' });
            res.status(200).json({ success: true, data: adopter, message: 'Adopter verified' });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getAdoptionRequests(req: Request, res: Response) {
        try {
            const requests = await AdoptionRequestService.getAll();
            res.status(200).json({ success: true, data: requests });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getRequestsByDog(req: Request, res: Response) {
        try {
            const requests = await AdoptionRequestService.getByDog(req.params.dogId as string);
            res.status(200).json({ success: true, data: requests });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async updateRequestStatus(req: Request, res: Response) {
        try {
            const { status } = req.body;
            const id = req.params.id as string;
            let request;
            if (status === 'approved') {
                request = await AdoptionRequestService.approve(id);
            } else if (status === 'rejected') {
                request = await AdoptionRequestService.reject(id);
            } else {
                return res.status(400).json({ success: false, message: 'Invalid status' });
            }
            res.status(200).json({ success: true, data: request, message: `Request ${status}` });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}
