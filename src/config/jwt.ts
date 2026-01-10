function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value;
}

function requireNumberEnv(name: string): number {
  const value = Number(process.env[name]);
  if (!value) {
    throw new Error(`Environment variable ${name} must be a number`);
  }
  return value;
}

export const jwtConfig = {
  access: {
    secret: requireEnv('ACCESS_TOKEN_SECRET'),
    ttl: requireNumberEnv('ACCESS_TOKEN_TTL'),
  },
  refresh: {
    secret: requireEnv('REFRESH_TOKEN_SECRET'),
    ttl: requireNumberEnv('REFRESH_TOKEN_TTL'),
  },
};
