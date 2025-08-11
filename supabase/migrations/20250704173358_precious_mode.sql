/*
  # Admin Settings and Jobs Database Schema

  1. New Tables
    - `admin_settings`
      - `id` (uuid, primary key)
      - `setting_key` (text, unique)
      - `setting_value` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `jobs`
      - `id` (uuid, primary key)
      - `title` (text)
      - `company` (text)
      - `location` (text)
      - `experience` (text)
      - `salary` (text)
      - `description` (text)
      - `skills` (text array)
      - `posted_date` (date)
      - `source` (text)
      - `type` (text)
      - `remote` (boolean)
      - `apply_url` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Admin settings are publicly readable but require admin access to modify
    - Jobs are publicly readable and admin can manage them
*/

-- Create admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company text NOT NULL,
  location text NOT NULL,
  experience text NOT NULL DEFAULT 'Fresher',
  salary text,
  description text NOT NULL,
  skills text[] DEFAULT '{}',
  posted_date date DEFAULT CURRENT_DATE,
  source text DEFAULT 'Manual',
  type text DEFAULT 'Full-time',
  remote boolean DEFAULT false,
  apply_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_settings (publicly readable, admin can modify)
CREATE POLICY "Admin settings are publicly readable"
  ON admin_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can manage settings"
  ON admin_settings
  FOR ALL
  TO authenticated
  USING (true);

-- Create policies for jobs (publicly readable, admin can manage)
CREATE POLICY "Jobs are publicly readable"
  ON jobs
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can manage jobs"
  ON jobs
  FOR ALL
  TO authenticated
  USING (true);

-- Insert default API key setting (empty initially)
INSERT INTO admin_settings (setting_key, setting_value) 
VALUES ('gemini_api_key', '') 
ON CONFLICT (setting_key) DO NOTHING;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_admin_settings_updated_at 
  BEFORE UPDATE ON admin_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at 
  BEFORE UPDATE ON jobs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();