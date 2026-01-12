declare global {
  namespace Express {
    interface Request {
      file?: Multer.File;
      files?: Multer.File[];
      user?: JwtPayload;
      sessionId?: string;
    }
  }
}

export {};
