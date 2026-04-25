-- ========================================================
-- Elementra Secure RLS Policies
-- Run this in your Supabase SQL Editor
-- ========================================================

-- Disable insecure public patterns
DROP POLICY IF EXISTS "Admin full access leads" ON leads;
DROP POLICY IF EXISTS "Admin full access lead messages" ON lead_messages;
DROP POLICY IF EXISTS "Admin full access activities" ON activities;
DROP POLICY IF EXISTS "Users can view activities" ON activities;

-- 1. LEADS: Public can submit inquiries, Admin (via service_role) manages them
CREATE POLICY "Public can insert leads" ON leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role full access leads" ON leads
  FOR ALL USING (auth.role() = 'service_role');

-- 2. LEAD MESSAGES: Chat continuity
CREATE POLICY "Public can insert lead messages" ON lead_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can read messages" ON lead_messages
  FOR SELECT USING (true); -- Required for anonymous chatbot to showing history

CREATE POLICY "Service role full access lead messages" ON lead_messages
  FOR ALL USING (auth.role() = 'service_role');

-- 3. ACTIVITIES: Client visibility
CREATE POLICY "Users can view own activities" ON activities
  FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own activities" ON activities
  FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Service role full access activities" ON activities
  FOR ALL USING (auth.role() = 'service_role');

-- 4. PROFILES (Security fix for issue discovered earlier)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
CREATE POLICY "Service role full access profiles" ON profiles
  FOR ALL USING (auth.role() = 'service_role');
