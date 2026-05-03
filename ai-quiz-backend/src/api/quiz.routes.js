import { Router } from 'express';
// Add getQuizById to your imports
import { generatePdfQuiz, generateNcertQuiz, getQuizById, getDriveContents } from '../controllers/quiz.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyJWT);

router.route('/generate-pdf').post(generatePdfQuiz);
router.route('/generate-ncert').post(generateNcertQuiz);
router.route('/drive-contents').get(getDriveContents);

// --- ADD THIS NEW ROUTE ---
router.route('/:quizId').get(getQuizById);

export default router;