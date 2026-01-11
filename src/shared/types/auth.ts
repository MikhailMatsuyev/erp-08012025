export interface AccessTokenPayload  {
  sub: string;
  sid: string;
}

export interface RefreshJwtPayload {
  userId: string;
  sessionId: string;
  iat?: number;
  exp?: number;
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
