import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  static info(req: Request, res: Response) {
    res.json({
      id: req.user!.userId,
    });
  }

  static async signup(req: Request, res: Response) {
    const { login, password } = req.body;

    const tokens = await AuthService.signup(login, password);

    res.status(201).json(tokens);
  }

  static async signin(req: Request, res: Response) {
    const { login, password } = req.body;

    const tokens = await AuthService.signin(login, password);

    res.json(tokens);
  }

  static async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body;

    const result = await AuthService.refresh(refreshToken);

    res.json(result);
  }

  static async logout(req: Request, res: Response) {
    /**
     * logout ДОЛЖЕН работать по access token
     * => sessionId берём из req.user
     */
    const sessionId = req.user!.sid;

    await AuthService.logout(sessionId);

    res.status(204).send();
  }
}

// export const authController = new AuthController();
