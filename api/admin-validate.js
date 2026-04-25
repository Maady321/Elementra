import crypto from 'node:crypto';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'fallback-secret-change-me';

export default function handler(req, res) {
  // Read token from cookies
  const cookies = req.headers.cookie || '';
  const tokenMatch = cookies.match(/elmentra_admin_token=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;

  if (!token) {
    return res.status(200).json({ valid: false });
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 2) return res.status(200).json({ valid: false });

    const [tokenData, signature] = parts;
    
    // Verify HMAC signature
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(tokenData).digest('hex');
    
    // Constant-time comparison
    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return res.status(200).json({ valid: false });
    }

    const [username, expiry] = tokenData.split(':');
    
    // Check if token has expired
    if (Date.now() > parseInt(expiry)) {
      return res.status(200).json({ valid: false });
    }

    return res.status(200).json({ valid: true, username });
  } catch (err) {
    return res.status(200).json({ valid: false });
  }
}
