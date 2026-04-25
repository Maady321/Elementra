export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Clear the admin HMAC token cookie
  res.setHeader('Set-Cookie', 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict');
  
  return res.status(200).json({ message: 'Logged out successfully' });
}
