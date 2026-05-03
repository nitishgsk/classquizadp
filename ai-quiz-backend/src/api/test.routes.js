import { Router } from 'express';
import { submitTest, getMyResults, getResultById } from '../controllers/test.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// All test routes are protected
router.use(verifyJWT);

router.route('/submit').post(submitTest);
router.route('/results').get(getMyResults);
router.route('/results/:resultId').get(getResultById);


export default router;