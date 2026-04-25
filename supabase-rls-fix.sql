-- =====================================================
-- Elmentra RLS Policy Migration
-- Run this AFTER the initial schema has been applied
-- to tighten overly-permissive Row Level Security.
-- =====================================================

-- 1. Drop overly-permissive wildcard policies
--    These grant FULL access (SELECT/INSERT/UPDATE/DELETE) to ALL users
--    including anonymous visitors, which is a data breach risk.
DROP POLICY IF EXISTS "Admin full access leads" ON leads;
DROP POLICY IF EXISTS "Admin full access lead messages" ON lead_messages;
DROP POLICY IF EXISTS "Admin full access activities" ON activities;

-- 2. Drop the unrestricted public SELECT on leads
--    This exposed all client PII (name, email) to any anonymous visitor.
DROP POLICY IF EXISTS "Public can view own lead" ON leads;

-- 3. Re-create leads policies with proper scoping
--    INSERT: Public can still create leads (chatbot flow) — already exists
--    SELECT: No public read. Admin reads via service_role key (bypasses RLS).
--    UPDATE/DELETE: service_role only.

-- 4. Lead messages: Keep INSERT open (chatbot writes messages).
--    SELECT: Keep open for Realtime subscriptions (messages are non-PII).
--    The existing "Public can insert lead messages" and
--    "Public can view lead messages" policies remain as-is since lead_messages
--    only contain conversation text, not PII. The Realtime subscription
--    filters by lead_id client-side.

-- 5. Activities: Authenticated project owners can view (existing policy).
--    Admin operations go through service_role key.
--    No public wildcard needed.

-- =====================================================
-- NOTE FOR PRODUCTION HARDENING
-- =====================================================
-- The admin dashboard currently uses the Supabase `anon` key for ALL
-- data operations. For full RLS security, admin CRUD should be migrated
-- to Vercel serverless API routes that use the `service_role` key
-- (which bypasses RLS entirely). Once migrated:
--
--   1. All "admin" wildcard policies can be removed
--   2. Client-facing policies stay scoped to auth.uid()
--   3. The anon key will have minimal permissions
--
-- This migration addresses the MOST CRITICAL gap (public read on leads).
-- The admin dashboard anon-key access remains a known limitation until
-- the full API-route migration is completed.
-- =====================================================
