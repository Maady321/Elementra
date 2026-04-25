/**
 * Vercel Serverless Function — Admin Token Validation
 * Verifies the HMAC-signed token on every admin page load
 * so a spoofed localStorage entry cannot grant access.
 */
import crypto from 'node:crypto';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false, error: 'Missing authorization token.' });
  }

  const token = authHeader.slice(7);
  const parts = token.split('.');

  if (parts.length !== 2) {
    return res.status(401).json({ valid: false, error: 'Malformed token.' });
  }

  const jwtSecret = process.env.ADMIN_JWT_SECRET;
  if (!jwtSecret || jwtSecret.includes('replace-this-with-a-random')) {
    console.error('Missing or invalid ADMIN_JWT_SECRET environment variable');
    return res.status(500).json({ valid: false, error: 'Server configuration error: ADMIN_JWT_SECRET is not correctly configured.' });
  }

  const [payloadB64, signature] = parts;

  // Recompute expected signature
  const expectedSig = crypto
    .createHmac('sha256', jwtSecret)
    .update(payloadB64)
    .digest('base64url');

  // Constant-time comparison to prevent timing attacks
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSig);

  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return res.status(401).json({ valid: false, error: 'Invalid token signature.' });
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());

    // Check expiry
    if (payload.exp && Date.now() > payload.exp) {
      return res.status(401).json({ valid: false, error: 'Token expired.' });
    }

    return res.status(200).json({
      valid: true,
      username: payload.sub,
      role: payload.role,
    });
  } catch {
    return res.status(401).json({ valid: false, error: 'Invalid token payload.' });
  }
}
