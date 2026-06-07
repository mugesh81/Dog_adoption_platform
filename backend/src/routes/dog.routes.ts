import { Router } from 'express';
import { DogController } from '../controllers/dog.controller';

const router = Router();
const dogController = new DogController();

router.get('/', (req, res) => dogController.getDogs(req, res));
router.get('/:id', (req, res) => dogController.getDogById(req, res));

export default router;
