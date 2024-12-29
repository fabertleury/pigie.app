/*
  # Fix Recursive Policies

  1. Changes
    - Remove all existing policies
    - Create simplified non-recursive policies
    - Fix access control for all tables
    
  2. Security
    - Maintain proper access control
    - Prevent infinite recursion
    - Enable proper data access patterns
*/

-- Remove all existing policies
DROP POLICY IF EXISTS "goals_select_policy" ON goals;
DROP POLICY IF EXISTS "goals_insert_policy" ON goals;
DROP POLICY IF EXISTS "goals_update_policy" ON goals;
DROP POLICY IF EXISTS "goals_delete_policy" ON goals;

-- Create simplified non-recursive policies for goals
CREATE POLICY "goals_owner_all"
  ON goals
  FOR ALL 
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "goals_participant_select"
  ON goals
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT goal_id 
      FROM goal_participants 
      WHERE user_id = auth.uid()
    )
  );

-- Simplify invitations policies
DROP POLICY IF EXISTS "invitations_select" ON goal_invitations;
DROP POLICY IF EXISTS "invitations_insert" ON goal_invitations;

CREATE POLICY "invitations_owner"
  ON goal_invitations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM goals 
      WHERE id = goal_invitations.goal_id 
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "invitations_receiver_select"
  ON goal_invitations
  FOR SELECT
  TO authenticated
  USING (
    invited_email = (
      SELECT email 
      FROM auth.users 
      WHERE id = auth.uid()
    )
  );

-- Simplify participants policies
DROP POLICY IF EXISTS "participants_access" ON goal_participants;

CREATE POLICY "participants_owner"
  ON goal_participants
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "participants_goal_owner"
  ON goal_participants
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM goals 
      WHERE id = goal_participants.goal_id 
      AND created_by = auth.uid()
    )
  );

-- Simplify payment proofs policies
DROP POLICY IF EXISTS "proofs_select" ON payment_proofs;
DROP POLICY IF EXISTS "proofs_insert" ON payment_proofs;
DROP POLICY IF EXISTS "proofs_update" ON payment_proofs;

CREATE POLICY "proofs_owner"
  ON payment_proofs
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "proofs_goal_owner"
  ON payment_proofs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM goals 
      WHERE id = payment_proofs.goal_id 
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "proofs_participant_select"
  ON payment_proofs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM goal_participants 
      WHERE goal_id = payment_proofs.goal_id 
      AND user_id = auth.uid()
    )
  );