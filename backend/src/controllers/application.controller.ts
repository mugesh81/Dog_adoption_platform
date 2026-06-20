import { Request, Response } from 'express';
import { AdoptionApplication, ApplicationStatus, InterviewStatus } from '../models/AdoptionApplication';
import { Dog } from '../models/Dog';
import { UserRole } from '../models/User';
import { NotificationController } from './notification.controller';
import { NotificationType } from '../models/Notification';

// Terminal states — once reached, status cannot change
const TERMINAL_STATUSES = new Set([
  ApplicationStatus.APPROVED,
  ApplicationStatus.REJECTED,
  ApplicationStatus.CANCELLED,
  ApplicationStatus.COMPLETED,
]);

// Max counter-proposals before the interview must be resolved
const MAX_RESCHEDULE_COUNT = 3;

export class ApplicationController {
  async applyForAdoption(req: Request, res: Response) {
    try {
      const { dogId, reasonForAdopting, hasOtherPets, otherPetsDescription, familyMembersCount, agreeToHomeVisit, adopterPhone, adopterWhatsApp, adopterCity } = req.body;
      const adopterId = (req as any).user.id;

      if (!reasonForAdopting || typeof hasOtherPets !== 'boolean' || !familyMembersCount || agreeToHomeVisit !== true) {
        return res.status(400).json({
          success: false,
          message: 'reasonForAdopting, hasOtherPets, familyMembersCount, and agreeToHomeVisit are required',
        });
      }

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
        status: ApplicationStatus.PENDING,
        adopterPhone: adopterPhone || undefined,
        adopterWhatsApp: adopterWhatsApp || undefined,
        adopterCity: adopterCity || undefined,
      });

      await NotificationController.createNotification(
        dog.listedBy.toString(),
        NotificationType.NEW_APPLICATION,
        'New Adoption Application',
        `You have a new adoption application for ${dog.name}`,
        application._id.toString(),
        dog._id.toString()
      );

      res.status(201).json({ success: true, data: application });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getMyApplications(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const role = (req as any).user.role;

      let query: Record<string, unknown> = {};
      if (role === UserRole.ADOPTER) {
        query = { adopterId: userId };
      } else if (role === UserRole.ADMIN) {
        query = {};
      } else {
        query = { shelterOrDonorId: userId };
      }

      const applications = await AdoptionApplication.find(query)
        .populate('dogId', 'name breed media adopted')
        .populate('adopterId', 'name email phone experience homeType')
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

      if (!Object.values(ApplicationStatus).includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid application status' });
      }

      const application = await AdoptionApplication.findById(id);
      if (!application) {
        return res.status(404).json({ success: false, message: 'Application not found' });
      }

      if (userRole !== UserRole.ADMIN && application.shelterOrDonorId.toString() !== userId) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      // BUG-03 FIX: Block transitions out of terminal states
      if (TERMINAL_STATUSES.has(application.status)) {
        return res.status(400).json({
          success: false,
          message: `Application is already ${application.status} and cannot be changed`,
        });
      }

      // BUG-01 FIX: If approving, verify the dog is not already adopted
      if (status === ApplicationStatus.APPROVED) {
        const dog = await Dog.findById(application.dogId);
        if (!dog) {
          return res.status(404).json({ success: false, message: 'Dog not found' });
        }
        if (dog.adopted) {
          return res.status(400).json({
            success: false,
            message: 'Cannot approve: this dog has already been adopted',
          });
        }
      }

      application.status = status;
      if (interviewDate) application.interviewDate = interviewDate;
      if (homeVisitDate) application.homeVisitDate = homeVisitDate;
      if (rejectionReason) application.rejectionReason = rejectionReason;

      await application.save();

      const dog = await Dog.findById(application.dogId);
      const statusMessages: Record<string, string> = {
        [ApplicationStatus.UNDER_REVIEW]: `Your application for ${dog?.name} is under review`,
        [ApplicationStatus.APPROVED]: `Great news! Your application for ${dog?.name} has been approved`,
        [ApplicationStatus.REJECTED]: `Your application for ${dog?.name} was not approved`,
        [ApplicationStatus.INTERVIEW_SCHEDULED]: `An interview has been scheduled for your application for ${dog?.name}`,
      };

      if (statusMessages[status]) {
        await NotificationController.createNotification(
          application.adopterId.toString(),
          NotificationType.APPLICATION_STATUS_CHANGE,
          'Application Status Update',
          statusMessages[status],
          application._id.toString(),
          application.dogId.toString()
        );
      }

      if (status === ApplicationStatus.APPROVED) {
        // Mark dog as adopted
        await Dog.findByIdAndUpdate(application.dogId, {
          adopted: true,
          adoptedBy: application.adopterId,
        });

        // BUG-07 FIX: Auto-reject ALL competing applications (including interview_scheduled)
        const competingApps = await AdoptionApplication.find({
          dogId: application.dogId,
          _id: { $ne: application._id },
          status: {
            $in: [
              ApplicationStatus.PENDING,
              ApplicationStatus.UNDER_REVIEW,
              ApplicationStatus.INTERVIEW_SCHEDULED,
              ApplicationStatus.HOME_VISIT_SCHEDULED,
            ],
          },
        });

        if (competingApps.length > 0) {
          await AdoptionApplication.updateMany(
            {
              dogId: application.dogId,
              _id: { $ne: application._id },
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
              rejectionReason: 'Another application was approved for this dog.',
            }
          );

          // Notify all rejected adopters
          for (const competing of competingApps) {
            await NotificationController.createNotification(
              competing.adopterId.toString(),
              NotificationType.APPLICATION_STATUS_CHANGE,
              'Application Status Update',
              `Your application for ${dog?.name} was not approved — another adopter was selected`,
              competing._id.toString(),
              competing.dogId.toString()
            );
          }
        }
      }

      res.status(200).json({ success: true, data: application });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async proposeInterview(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { interviewDate, interviewNotes } = req.body;
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;

      if (!interviewDate) {
        return res.status(400).json({ success: false, message: 'interviewDate is required' });
      }

      const proposedDate = new Date(interviewDate);
      if (isNaN(proposedDate.getTime()) || proposedDate < new Date()) {
        return res.status(400).json({ success: false, message: 'Interview date must be in the future' });
      }

      const application = await AdoptionApplication.findById(id);
      if (!application) {
        return res.status(404).json({ success: false, message: 'Application not found' });
      }

      if (userRole !== UserRole.ADMIN && application.shelterOrDonorId.toString() !== userId) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      // Block if in a terminal state
      if (TERMINAL_STATUSES.has(application.status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot propose interview: application is already ${application.status}`,
        });
      }

      // BUG-06 FIX: Enforce reschedule limit — shelter can only re-propose if under the limit
      const rescheduleCount = (application as any).rescheduleCount || 0;
      if (rescheduleCount >= MAX_RESCHEDULE_COUNT) {
        return res.status(400).json({
          success: false,
          message: `Maximum reschedule limit (${MAX_RESCHEDULE_COUNT}) reached. Please resolve the application directly (approve or reject).`,
        });
      }

      // Capture prior status before mutation
      const priorInterviewStatus = application.interviewStatus;

      application.interviewDate = proposedDate;
      application.interviewStatus = InterviewStatus.PROPOSED;
      application.interviewNotes = interviewNotes;
      application.interviewProposedBy = userId;
      application.status = ApplicationStatus.INTERVIEW_SCHEDULED;
      // Increment reschedule count on re-proposals (not the very first proposal)
      const currentRescheduleCount = (application as any).rescheduleCount || 0;
      if (
        priorInterviewStatus === InterviewStatus.RESCHEDULED ||
        priorInterviewStatus === InterviewStatus.CONFIRMED
      ) {
        (application as any).rescheduleCount = currentRescheduleCount + 1;
      }

      await application.save();

      const dog = await Dog.findById(application.dogId);
      await NotificationController.createNotification(
        application.adopterId.toString(),
        NotificationType.INTERVIEW_PROPOSED,
        'Interview Proposed',
        `An interview has been proposed for your application for ${dog?.name}`,
        application._id.toString(),
        application.dogId.toString()
      );

      const populated = await AdoptionApplication.findById(id)
        .populate('dogId', 'name breed media')
        .populate('adopterId', 'name email phone');

      res.status(200).json({
        success: true,
        data: populated,
        message: 'Interview proposed successfully',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async respondToInterview(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { response, counterProposalDate, notes } = req.body;
      const userId = (req as any).user.id;

      // BUG-06 FIX: Added 'decline' as a valid response
      if (!['confirm', 'request_change', 'decline'].includes(response)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid response. Use "confirm", "request_change", or "decline"',
        });
      }

      const application = await AdoptionApplication.findById(id);
      if (!application) {
        return res.status(404).json({ success: false, message: 'Application not found' });
      }

      if (application.adopterId.toString() !== userId) {
        return res.status(403).json({ success: false, message: 'Only the adopter can respond to interview proposals' });
      }

      if (
        application.interviewStatus !== InterviewStatus.PROPOSED &&
        application.interviewStatus !== InterviewStatus.RESCHEDULED
      ) {
        return res.status(400).json({ success: false, message: 'No interview proposal to respond to' });
      }

      const dog = await Dog.findById(application.dogId);

      if (response === 'confirm') {
        application.interviewStatus = InterviewStatus.CONFIRMED;
        if (notes) application.interviewNotes = notes;

        await NotificationController.createNotification(
          application.shelterOrDonorId.toString(),
          NotificationType.INTERVIEW_CONFIRMED,
          'Interview Confirmed',
          `The adopter confirmed the interview for ${dog?.name}`,
          application._id.toString(),
          application.dogId.toString()
        );
      } else if (response === 'decline') {
        // BUG-06 FIX: Adopter can decline the interview, which cancels their application
        application.interviewStatus = InterviewStatus.CANCELLED;
        application.status = ApplicationStatus.CANCELLED;
        application.interviewNotes = notes || 'Adopter declined the interview';

        await NotificationController.createNotification(
          application.shelterOrDonorId.toString(),
          NotificationType.APPLICATION_STATUS_CHANGE,
          'Interview Declined',
          `The adopter declined the interview for ${dog?.name} and withdrew their application`,
          application._id.toString(),
          application.dogId.toString()
        );
      } else {
        // request_change
        if (!counterProposalDate) {
          return res.status(400).json({ success: false, message: 'counterProposalDate required when requesting change' });
        }

        const proposedDate = new Date(counterProposalDate);
        if (isNaN(proposedDate.getTime()) || proposedDate < new Date()) {
          return res.status(400).json({ success: false, message: 'Counter-proposal date must be in the future' });
        }

        // BUG-06 FIX: Check reschedule limit from adopter side too
        const rescheduleCount = (application as any).rescheduleCount || 0;
        if (rescheduleCount >= MAX_RESCHEDULE_COUNT) {
          return res.status(400).json({
            success: false,
            message: `Maximum reschedule limit (${MAX_RESCHEDULE_COUNT}) reached. Please confirm or decline the interview.`,
          });
        }

        application.interviewDate = proposedDate;
        application.interviewStatus = InterviewStatus.RESCHEDULED;
        application.interviewNotes = notes || 'Adopter requested different time';
        (application as any).rescheduleCount = rescheduleCount + 1;

        await NotificationController.createNotification(
          application.shelterOrDonorId.toString(),
          NotificationType.INTERVIEW_RESCHEDULED,
          'Interview Reschedule Request',
          `The adopter requested a different interview time for ${dog?.name}`,
          application._id.toString(),
          application.dogId.toString()
        );
      }

      await application.save();

      const populated = await AdoptionApplication.findById(id)
        .populate('dogId', 'name breed media')
        .populate('shelterOrDonorId', 'name email phone');

      res.status(200).json({
        success: true,
        data: populated,
        message:
          response === 'confirm'
            ? 'Interview confirmed'
            : response === 'decline'
            ? 'Interview declined — application cancelled'
            : 'Counter-proposal sent',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
