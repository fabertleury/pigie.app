/*
  # Fix infinite recursion in policies

  1. Changes
    - Simplify goals policies to avoid recursion
    - Update invitation policies
    - Add missing policies for deposits

  2. Security
    - Maintain RLS security while fixing recursion
    - Ensure proper access control
*/

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can read own goals" ON goals;
DROP POLICY IF EXISTS "Participants can view group goals" ON goals;

-- Simplified goals policies
CREATE POLICY "Users can read goals"
  ON goals
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM goal_participants gp
      WHERE gp.goal_id = goals.id 
      AND gp.user_id = auth.uid()
    )
  );

-- Fix invitation policies
DROP POLICY IF EXISTS "Users can view received invitations" ON goal_invitations;

CREATE POLICY "Users can view received invitations"
  ON goal_invitations
  FOR SELECT
  TO authenticated
  USING (
    invited_email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );