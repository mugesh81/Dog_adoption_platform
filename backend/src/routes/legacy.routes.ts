import { Router } from 'express';
import { DonorController, AdopterController } from '../controllers/index';
import multer from 'multer';
import path from 'path';

const router = Router();
const donorController = new DonorController();
const adopterController = new AdopterController();

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Donors legacy routes
router.post('/donors/register', (req, res) => donorController.registerDonor(req, res));
router.post('/donors/:donorId/dogs', upload.single('image'), (req, res) => donorController.addDog(req, res));
router.get('/donors/:donorId/dogs', (req, res) => donorController.getDonorDogs(req, res));

// Adopters legacy routes
router.post('/adopters/register', (req, res) => adopterController.registerAdopter(req, res));
router.post('/adopters/adopt', (req, res) => adopterController.sendAdoptionRequest(req, res));
router.get('/adopters/requests', (req, res) => adopterController.getAdoptionRequests(req, res));
router.get('/adopters/requests/dog/:dogId', (req, res) => adopterController.getRequestsByDog(req, res));
router.put('/adopters/requests/:id', (req, res) => adopterController.updateRequestStatus(req, res));
router.post('/adopters/:adopterId/verify', (req, res) => adopterController.verifyAdopter(req, res));

// Legacy dogs search (matches '/dogs' with query parameters in the legacy controllers)
router.get('/dogs', (req, res) => donorController.listDogs(req, res));
router.get('/dogs/:id', (req, res) => donorController.getDogDetails(req, res));

// Legacy stats route
router.get('/stats', (req, res) => donorController.getStats(req, res));

export default router;
