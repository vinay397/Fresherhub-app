/*
  # Add HR Email field to jobs table

  1. Changes
    - Add `hr_email` column to jobs table
    - Update existing jobs to have null hr_email (optional field)
  
  2. Security
    - No changes to RLS policies needed
    - HR email is optional and publicly readable like other job fields
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'hr_email'
  ) THEN
    ALTER TABLE jobs ADD COLUMN hr_email text;
  END IF;
END $$;