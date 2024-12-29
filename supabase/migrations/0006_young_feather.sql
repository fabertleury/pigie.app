/*
  # Fix database policies

  1. Changes
    - Remove problematic policies
    - Add correct policies for goals, invitations and deposits
    - Fix column references in policies

  2. Security
    - Maintain RLS with proper column references
    - Ensure proper access control for all tables
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can read goals" ON goals;
DROP POLICY IF EXISTS "Users can read own goals" ON goals;
DROP POLICY IF EXISTS "Participants can view group goals" ON goals;
DROP POLICY IF EXISTS "Users can view received invitations" ON goal_invitations;

-- Clear policies for goals
CREATE POLICY "Goals access policy"
  ON goals
  FOR ALL
  TO authenticated
  USING (
    created_by = auth.uid() OR
    id IN (
      SELECT goal_id 
      FROM goal_participants 
      WHERE user_id = auth.uid()
    )
  );

-- Fix invitation policies
CREATE POLICY "Invitations view policy"
  ON goal_invitations
  FOR SELECT
  TO authenticated
  USING (
    invited_email IN (
      SELECT email 
      FROM auth.users 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Invitations insert policy"
  ON goal_invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM goals 
      WHERE id = goal_id 
      AND created_by = auth.uid()
    )
  );

-- Add missing deposit policies
CREATE POLICY "Deposits access policy"
  ON deposits
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR
    goal_id IN (
      SELECT id 
      FROM goals 
      WHERE created_by = auth.uid()
    )
  );