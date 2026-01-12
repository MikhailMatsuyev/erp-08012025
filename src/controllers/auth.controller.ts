import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  static async info(req: Request, res: Response) {
    res.json({
      id: req.user!.sub,
    });
  }

  static async signup(req: Request, res: Response) {
    const {id, password} = req.body;

    if (!id || !password) {
      return res.status(400).json({message: 'id and password required'});
    }

    const tokens = await AuthService.signup(id, password);

    res.status(201).json(tokens);
  }

  static async signin(req: Request, res: Response) {
    const {id, password} = req.body;

    const tokens = await AuthService.signin(id, password);

    res.json(tokens);
  }

  static async refresh(req: Request, res: Response) {
    const {refreshToken} = req.body;

    const result = await AuthService.refresh(refreshToken);

    res.json(result);
  }

  static async logout(req: Request, res: Response) {
    const sessionId = req.user!.sid;

    await AuthService.logout(sessionId);

    return res.status(200).json({message: 'Logged out'});
  }
}

// export const authController = new AuthController();
