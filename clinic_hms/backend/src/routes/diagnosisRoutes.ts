import express from 'express';
import { 
  createDiagnosisRequest, 
  getPendingRequests, 
  updateDiagnosisResults, 
  getPatientDiagnosisHistory 
} from '../controllers/diagnosisController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/request', protect, createDiagnosisRequest);
router.get('/pending', protect, getPendingRequests);
router.patch('/results', protect, updateDiagnosisResults);
router.get('/patient/:patientId', protect, getPatientDiagnosisHistory);

export default router;
