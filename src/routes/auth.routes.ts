import { Router } from 'express';

import { authMiddleware } from "../middlewares/auth.middleware";
import { AuthController } from "../controllers/auth.controller";

const router = Router();

router.get('/info', authMiddleware, AuthController.info);
router.post('/signup', AuthController.signup);
router.post('/signin', AuthController.signin);
router.post('/signin/new_token', AuthController.refresh);
router.post('/logout', authMiddleware, AuthController.logout);

export default router;
