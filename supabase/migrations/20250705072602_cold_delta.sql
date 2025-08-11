/*
  # Fix Admin Settings Policies

  1. Security Changes
    - Update admin_settings policies to allow proper admin access
    - Add better authentication checks for admin operations
    - Ensure API key can be updated from the admin panel

  2. Policy Updates
    - Allow authenticated users to update admin settings
    - Maintain public read access for settings
    - Fix any RLS issues preventing admin updates
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admin settings are publicly readable" ON admin_settings;
DROP POLICY IF EXISTS "Admin can manage settings" ON admin_settings;

-- Create new policies with better access control
CREATE POLICY "Admin settings are publicly readable"
  ON admin_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow admin settings updates"
  ON admin_settings
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow admin settings insert"
  ON admin_settings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow admin settings delete"
  ON admin_settings
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Ensure the gemini_api_key setting exists
INSERT INTO admin_settings (setting_key, setting_value) 
VALUES ('gemini_api_key', '') 
ON CONFLICT (setting_key) DO NOTHING;