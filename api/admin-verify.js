/**
 * Vercel Serverless Function — Admin Login Verification
 * Uses service_role key to call the verify_admin RPC,
 * then issues a signed HMAC token instead of a plain localStorage flag.
 */
import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const jwtSecret = process.env.ADMIN_JWT_SECRET;

  if (!supabaseUrl || !supabaseServiceKey || !jwtSecret || 
      supabaseServiceKey.includes('your-service-role-key') || 
      jwtSecret.includes('replace-this-with-a-random')) {
    console.error('Environment variables are either missing or contain placeholders (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_JWT_SECRET)');
    return res.status(500).json({ 
      error: 'Server configuration error: Please ensure your .env file has valid Supabase keys and a secure JWT secret.' 
    });
  }

  try {
    // Use service_role key — bypasses RLS for secure credential verification
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: isValid, error: rpcError } = await supabase.rpc('verify_admin', {
      p_username: username,
      p_password: password,
    });

    if (rpcError) {
      console.error('RPC Error details:', rpcError);
      return res.status(500).json({ 
        error: `Database error: ${rpcError.message || 'Credential verification failed.'}`,
        hint: 'Check if you have run the verify_admin SQL in your Supabase SQL Editor.'
      });
    }

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid admin credentials.' });
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
