import { Router } from 'express';
import { createRoom } from '../controllers/roomController';

const router = Router();

router.post('/rooms', createRoom);

export default router;