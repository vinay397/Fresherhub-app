/*
  # Add INSERT policy for jobs table

  1. Security Changes
    - Add policy to allow anonymous users to insert jobs
    - This enables the CSV upload functionality to work without authentication
    - Maintains existing security for other operations

  2. Policy Details
    - Allows INSERT operations for anonymous (anon) role
    - Enables bulk CSV uploads to function properly
    - Does not affect existing read/update/delete policies
*/

-- Add policy to allow anonymous users to insert jobs (for CSV upload functionality)
CREATE POLICY "Allow anonymous job insertion"
  ON jobs
  FOR INSERT
  TO anon
  WITH CHECK (true);