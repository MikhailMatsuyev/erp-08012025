interface AccessTokenPayload  {
  sub: string;
  sid: string;
}

export interface AuthPayload {
  sub: string;       // userId
  sessionId: string;
  iat: number;
  exp: number;
}
