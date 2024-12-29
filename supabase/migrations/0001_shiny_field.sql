/*
  # Initial Schema Setup

  1. New Tables
    - `profiles`
      - `id` (uuid, references auth.users)
      - `email` (text)
      - `pix_key` (text, optional)
      - `created_at` (timestamp)
    
    - `goals`
      - `id` (uuid)
      - `title` (text)
      - `target_amount` (numeric)
      - `total_deposits` (numeric)
      - `created_by` (uuid, references profiles)
      - `is_group` (boolean)
      - `created_at` (timestamp)
    
    - `deposits`
      - `id` (uuid)
      - `goal_id` (uuid, references goals)
      - `user_id` (uuid, references profiles)
      - `amount` (numeric)
      - `deposit_number` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  pix_key text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  target_amount numeric NOT NULL CHECK (target_amount > 0),
  total_deposits numeric NOT NULL DEFAULT 0 CHECK (total_deposits >= 0),
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  is_group boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own goals"
  ON goals
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can insert own goals"
  ON goals
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own goals"
  ON goals
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- Create deposits table
CREATE TABLE IF NOT EXISTS deposits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid REFERENCES goals(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  deposit_number integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own deposits"
  ON deposits
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own deposits"
  ON deposits
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create function to update total_deposits
CREATE OR REPLACE FUNCTION update_goal_total_deposits()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE goals
    SET total_deposits = total_deposits + NEW.amount
    WHERE id = NEW.goal_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for deposits
CREATE TRIGGER update_goal_total_deposits_trigger
AFTER INSERT ON deposits
FOR EACH ROW
EXECUTE FUNCTION update_goal_total_deposits();