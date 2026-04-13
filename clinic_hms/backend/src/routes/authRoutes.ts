import express from 'express';
import { authUser } from '../controllers/authController';

const router = express.Router();

router.post('/login', authUser);

export default router;
