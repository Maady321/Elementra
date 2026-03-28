-- ==============================
-- Elmentra Supabase Database Schema
-- Run this in Supabase SQL Editor
-- ==============================

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  project_name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'Basic',
  amount INTEGER NOT NULL DEFAULT 1499,
  num_pages INTEGER NOT NULL DEFAULT 1,
  email TEXT,
  paid BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'in_progress',
  theme TEXT DEFAULT 'Modern',
  features JSONB DEFAULT '{"contactForm": false, "whatsapp": false, "booking": false}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Updates Table (developer posts progress updates with images)
CREATE TABLE IF NOT EXISTS project_updates (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments Table (client feedback / developer responses)
CREATE TABLE IF NOT EXISTS comments (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  text TEXT,
  image_url TEXT,
  is_client BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Progress Steps Table
CREATE TABLE IF NOT EXISTS progress_steps (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
  step_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, current, completed
  completed_at TIMESTAMPTZ,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Row Level Security Policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_steps ENABLE ROW LEVEL SECURITY;

-- Clients can only view their own projects
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

-- Clients can view updates for their projects
CREATE POLICY "Users can view project updates"
  ON project_updates FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- Clients can view and insert comments on their projects
CREATE POLICY "Users can view project comments"
  ON comments FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert comments"
  ON comments FOR INSERT
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- Clients can view progress steps for their projects
CREATE POLICY "Users can view progress steps"
  ON progress_steps FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- Storage bucket for project images
-- Run in Supabase Dashboard > Storage > Create bucket "project-images" (public)

-- ==============================
-- Admin Authentication Support
-- ==============================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS admins (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert the default admin credential securely
-- You can change 'admin@elmentra' and 'ADm!N@e1enTra@2026' before running
INSERT INTO admins (username, password_hash) 
VALUES ('admin@elmentra', crypt('ADm!N@e1enTra@2026', gen_salt('bf')));

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Secure Remote Procedure Call (RPC) to verify credentials without exposing password hashes to the frontend
CREATE OR REPLACE FUNCTION verify_admin(p_username TEXT, p_password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_hash TEXT;
BEGIN
  SELECT password_hash INTO v_hash FROM admins WHERE username = p_username;
  IF v_hash IS NULL THEN
    RETURN false;
  END IF;
  RETURN v_hash = crypt(p_password, v_hash);
END;
$$;
-- Leads Table for Chatbot / Anonymous Inquiry
CREATE TABLE IF NOT EXISTS leads (
  id BIGSERIAL PRIMARY KEY,
  name TEXT,
  email TEXT,
  business_type TEXT,
  pages INTEGER,
  plan TEXT,
  status TEXT NOT NULL DEFAULT 'new', -- new, contacted, closed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages Table for Lead Chats
CREATE TABLE IF NOT EXISTS lead_messages (
  id BIGSERIAL PRIMARY KEY,
  lead_id BIGINT REFERENCES leads(id) ON DELETE CASCADE,
  sender TEXT NOT NULL, -- user, bot, admin
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities Table (log for timeline)
CREATE TABLE IF NOT EXISTS activities (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  description TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_messages ENABLE ROW LEVEL SECURITY;

-- Policies for anon usage (chatbot)
CREATE POLICY "Public can insert leads" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view own lead" ON leads FOR SELECT USING (true);
CREATE POLICY "Public can insert lead messages" ON lead_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view lead messages" ON lead_messages FOR SELECT USING (true);

-- Admin policies (assuming admin has access to all)
CREATE POLICY "Admin full access leads" ON leads FOR ALL USING (true);
CREATE POLICY "Admin full access lead messages" ON lead_messages FOR ALL USING (true);

-- Activities Policies
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view activities" ON activities FOR SELECT USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));
CREATE POLICY "Admin full access activities" ON activities FOR ALL USING (true);
