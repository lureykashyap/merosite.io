/*
  # Family Tree Database Schema

  1. New Tables
    - `family_members`
      - `id` (uuid, primary key)
      - `name` (text)
      - `address` (text)
      - `mobile` (text)
      - `dob` (date)
      - `is_alive` (boolean)
      - `generation_id` (integer)
      - `occupation` (text)
      - `education` (text)
      - `facebook_id` (text)
      - `relation` (text)
      - `photo_url` (text)
      - `parent_id` (uuid, self-referential foreign key)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `family_members` table
    - Add policies for authenticated users to:
      - Read their own family members
      - Create new family members
      - Update their own family members
      - Delete their own family members
*/

CREATE TABLE IF NOT EXISTS family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  mobile text,
  dob date,
  is_alive boolean DEFAULT true,
  generation_id integer NOT NULL,
  occupation text,
  education text,
  facebook_id text,
  relation text,
  photo_url text,
  parent_id uuid REFERENCES family_members(id),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own family members"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create family members"
  ON family_members
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own family members"
  ON family_members
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own family members"
  ON family_members
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_family_members_updated_at
  BEFORE UPDATE ON family_members
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();