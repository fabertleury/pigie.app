/*
  # Fix Recursive Policies

  1. Changes
    - Remove recursive policies that were causing infinite recursion
    - Simplify access control for goals and related tables
    - Add policies for payment proofs table
    
  2. Security
    - Maintain proper access control while avoiding recursion
    - Enable RLS on new tables
    - Add appropriate policies for CRUD operations
*/

-- Remove problematic policies
DROP POLICY IF EXISTS "basic_goals_policy" ON goals;
DROP POLICY IF EXISTS "participant_goals_policy" ON goals;
DROP POLICY IF EXISTS "basic_invitations_policy" ON goal_invitations;
DROP POLICY IF EXISTS "create_invitations_policy" ON goal_invitations;
DROP POLICY IF EXISTS "basic_participants_policy" ON goal_participants;

-- Create payment_proofs table
CREATE TABLE IF NOT EXISTS payment_proofs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid REFERENCES goals(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  deposit_number integer NOT NULL,
  file_url text NOT NULL,
  verified boolean,
  verified_by uuid REFERENCES profiles(id),
  verified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE payment_proofs ENABLE ROW LEVEL SECURITY;

-- Simplified goals policies
CREATE POLICY "goals_access"
  ON goals
  FOR ALL
  TO authenticated
  USING (
    created_by = auth.uid() OR
    id IN (
      SELECT goal_id FROM goal_participants WHERE user_id = auth.uid()
    )
  );

-- Simplified invitations policies
CREATE POLICY "invitations_select"
  ON goal_invitations
  FOR SELECT
  TO authenticated
  USING (
    invited_email = (SELECT email FROM profiles WHERE id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM goals WHERE id = goal_invitations.goal_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "invitations_insert"
  ON goal_invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM goals WHERE id = goal_id AND created_by = auth.uid()
    )
  );

-- Participants policies
CREATE POLICY "participants_access"
  ON goal_participants
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM goals WHERE id = goal_id AND created_by = auth.uid()
    )
  );

-- Payment proofs policies
CREATE POLICY "proofs_select"
  ON payment_proofs
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM goals WHERE id = goal_id AND (created_by = auth.uid() OR id IN (
        SELECT goal_id FROM goal_participants WHERE user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "proofs_insert"
  ON payment_proofs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "proofs_update"
  ON payment_proofs
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM goals WHERE id = goal_id AND created_by = auth.uid()
    )
  );