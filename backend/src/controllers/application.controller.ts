import { Request, Response } from 'express';
import { AdoptionApplication, ApplicationStatus } from '../models/AdoptionApplication';
import { Dog } from '../models/Dog';

export class ApplicationController {
  async applyForAdoption(req: Request, res: Response) {
    try {
      const { dogId, reasonForAdopting, hasOtherPets, otherPetsDescription, familyMembersCount, agreeToHomeVisit } = req.body;
      const adopterId = (req as any).user.id;

      const dog = await Dog.findById(dogId);
      if (!dog) {
        return res.status(404).json({ success: false, message: 'Dog not found' });
      }

      if (dog.adopted) {
        return res.status(400).json({ success: false, message: 'Dog is already adopted' });
      }

      const existingApp = await AdoptionApplication.findOne({ dogId, adopterId });
      if (existingApp) {
        return res.status(400).json({ success: false, message: 'You have already applied for this dog' });
      }

      const application = await AdoptionApplication.create({
        dogId,
        adopterId,
        shelterOrDonorId: dog.listedBy,
        reasonForAdopting,
        hasOtherPets,
        otherPetsDescription,
        familyMembersCount,
        agreeToHomeVisit,
        status: ApplicationStatus.PENDING
      });

      res.status(201).json({ success: true, data: application });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getMyApplications(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const role = (req as any).user.role;

      let query = {};
      if (role === 'adopter') {
        query = { adopterId: userId };
      } else {
        query = { shelterOrDonorId: userId };
      }

      const applications = await AdoptionApplication.find(query)
        .populate('dogId', 'name breed imageUrl')
        .populate('adopterId', 'name email phone')
        .sort({ createdAt: -1 });

      res.status(200).json({ success: true, data: applications });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateApplicationStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, interviewDate, homeVisitDate, rejectionReason } = req.body;
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;

      const application = await AdoptionApplication.findById(id);
      if (!application) {
        return res.status(404).json({ success: false, message: 'Application not found' });
      }

      // Only Shelter/Donor or Admin can update status
      if (userRole !== 'admin' && application.shelterOrDonorId.toString() !== userId) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      application.status = status;
      if (interviewDate) application.interviewDate = interviewDate;
      if (homeVisitDate) application.homeVisitDate = homeVisitDate;
      if (rejectionReason) application.rejectionReason = rejectionReason;

      await application.save();

      // If approved, update dog status
      if (status === ApplicationStatus.APPROVED) {
        await Dog.findByIdAndUpdate(application.dogId, { adopted: true, adoptedBy: application.adopterId });
      }

      res.status(200).json({ success: true, data: application });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
