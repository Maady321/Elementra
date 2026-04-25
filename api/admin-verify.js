/**
 * Vercel Serverless Function — Admin Login Verification
 * Uses service_role key to call the verify_admin RPC,
 * then issues a signed HMAC token instead of a plain localStorage flag.
 */
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'fallback-secret-change-me';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// In-memory rate limiting (simple version for Vercel)
const attempts = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function isRateLimited(ip) {
  const now = Date.now();
  const record = attempts.get(ip);
  
  if (!record) {
    attempts.set(ip, { count: 1, firstAttempt: now });
    return false;
  }
  
  if (now - record.firstAttempt > WINDOW_MS) {
    attempts.set(ip, { count: 1, firstAttempt: now });
    return false;
  }
  
  if (record.count >= MAX_ATTEMPTS) return true;
  
  record.count++;
  return false;
}

export default async function handler(req, res) {
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  
  if (isRateLimited(ip)) {
    return res.status(429).json({ 
      error: 'Too many login attempts. Please try again in 15 minutes.' 
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const { data: isValid, error } = await supabase.rpc('verify_admin', {
      p_username: username,
      p_password: password
    });

    if (error) {
      console.error('RPC Error details:', error);
      return res.status(500).json({ 
        error: `Database error: ${error.message || 'Credential verification failed.'}`,
        hint: 'Check if you have run the verify_admin SQL in your Supabase SQL Editor.'
      });
    }

    }

    // Build a signed HMAC token (payload.signature)
    const payload = JSON.stringify({
      sub: username,
      role: 'admin',
      iat: Date.now(),
      exp: Date.now() + 24 * 60 * 60 * 1000, // expires in 24 hours
    });

    const payloadB64 = Buffer.from(payload).toString('base64url');
    const signature = crypto
      .createHmac('sha256', jwtSecret)
      .update(payloadB64)
      .digest('base64url');

    const token = `${payloadB64}.${signature}`;

    return res.status(200).json({ token, username });
  } catch (err) {
    console.error('Admin verify error:', err);
    return res.status(500).json({ error: 'An internal error occurred.' });
  }
}
