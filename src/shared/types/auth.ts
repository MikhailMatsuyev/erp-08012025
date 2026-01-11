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

export interface JwtPayload {
  userId: string;
  sessionId: string;
}

export function isJwtPayload(payload: any): payload is JwtPayload {
  return (
    payload &&
    typeof payload === 'object' &&
    typeof payload.userId === 'string' &&
    typeof payload.sessionId === 'string'
  );
}
