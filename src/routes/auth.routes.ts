import { Router } from 'express';

import { authMiddleware } from "../middlewares/auth.middleware";
import { AuthController } from "../controllers/auth.controller";
import { validateAuth } from "../middlewares/validate-auth.middleware";

const router: Router = Router();

router.get('/info', authMiddleware, AuthController.info);
router.post('/signup', validateAuth, AuthController.signup);
router.post('/signin', validateAuth, AuthController.signin);
router.post('/signin/new_token', AuthController.refresh);
router.post('/logout', authMiddleware, AuthController.logout);

export default router;
