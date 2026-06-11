import jwt from 'jsonwebtoken';

function jwtKey() {
  return (
    process.env.JWT_KEY ||
    process.env.Jwt__Key ||
    'your-256-bit-secret-key-for-signing-tokens!!'
  );
}

function jwtIssuer() {
  return process.env.JWT_ISSUER || process.env.Jwt__Issuer || 'CareerPathApi';
}

function jwtAudience() {
  return process.env.JWT_AUDIENCE || process.env.Jwt__Audience || 'CareerPathApp';
}

export function signUserToken(user) {
  return jwt.sign(
    {
      sub: String(user.id),
      email: user.email,
      name: user.name,
    },
    jwtKey(),
    {
      issuer: jwtIssuer(),
      audience: jwtAudience(),
      expiresIn: '7d',
    },
  );
}

export function verifyBearerToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  if (!token) return null;
  try {
    const payload = jwt.verify(token, jwtKey(), {
      issuer: jwtIssuer(),
      audience: jwtAudience(),
    });
    const id = Number.parseInt(String(payload.sub ?? ''), 10);
    if (!Number.isFinite(id)) return null;
    return { id, email: payload.email, name: payload.name };
  } catch {
    return null;
  }
}
