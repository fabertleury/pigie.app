/*
  # Clean Up and Simplify Policies

  1. Changes
    - Remove all existing problematic policies
    - Create new non-recursive policies
    - Simplify policy conditions
    - Fix infinite recursion issues

  2. Security
    - Maintain proper access control
    - Keep policies simple and efficient
    - Prevent unauthorized access
*/

-- First, drop all existing policies to start fresh
DROP POLICY IF EXISTS "goals_policy" ON goals;
DROP POLICY IF EXISTS "goal_select_policy" ON goals;
DROP POLICY IF EXISTS "goal_insert_policy" ON goals;
DROP POLICY IF EXISTS "goal_update_policy" ON goals;
DROP POLICY IF EXISTS "goal_delete_policy" ON goals;
DROP POLICY IF EXISTS "invitations_policy" ON goal_invitations;
DROP POLICY IF EXISTS "invitations_owner" ON goal_invitations;
DROP POLICY IF EXISTS "invitations_receiver_select" ON goal_invitations;
DROP POLICY IF EXISTS "invitations_policy_1" ON goal_invitations;
DROP POLICY IF EXISTS "invitations_policy_2" ON goal_invitations;

-- Simplify participants policies
DROP POLICY IF EXISTS "participants_policy" ON goal_participants;
DROP POLICY IF EXISTS "participants_owner" ON goal_participants;
DROP POLICY IF EXISTS "participants_goal_owner" ON goal_participants;
DROP POLICY IF EXISTS "participants_policy_1" ON goal_participants;
DROP POLICY IF EXISTS "participants_policy_2" ON goal_participants;

-- Simplify payment proofs policies
DROP POLICY IF EXISTS "proofs_policy" ON payment_proofs;
DROP POLICY IF EXISTS "proofs_owner" ON payment_proofs;
DROP POLICY IF EXISTS "proofs_goal_owner" ON payment_proofs;
DROP POLICY IF EXISTS "proofs_participant_select" ON payment_proofs;
DROP POLICY IF EXISTS "proofs_policy_1" ON payment_proofs;
DROP POLICY IF EXISTS "proofs_policy_2" ON payment_proofs;

-- Disable RLS for debugging
ALTER TABLE goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE goal_invitations DISABLE ROW LEVEL SECURITY;
ALTER TABLE goal_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_proofs DISABLE ROW LEVEL SECURITY;

-- Re-enable Row Level Security
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_proofs ENABLE ROW LEVEL SECURITY;

-- Simplified policies with direct checks
CREATE POLICY "goals_policy"
  ON goals
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid()
  );

CREATE POLICY "invitations_policy"
  ON goal_invitations
  FOR SELECT
  TO authenticated
  USING (
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM goals 
      WHERE id = goal_invitations.goal_id 
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "participants_policy"
  ON goal_participants
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM goals 
      WHERE id = goal_participants.goal_id 
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "proofs_policy"
  ON payment_proofs
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM goals 
      WHERE id = payment_proofs.goal_id 
      AND created_by = auth.uid()
    )
  );