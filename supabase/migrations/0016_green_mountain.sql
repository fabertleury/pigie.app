/*
  # Fix Goals Table Policies

  1. Changes
    - Remove all existing policies
    - Create new simplified non-recursive policies
    - Separate policies for different operations
    - Use direct comparisons instead of complex queries

  2. Security
    - Maintain proper access control
    - Prevent unauthorized access
    - Keep policies simple and efficient
*/

-- First, remove any existing policies
DROP POLICY IF EXISTS "goals_read_access" ON goals;
DROP POLICY IF EXISTS "goals_insert_access" ON goals;
DROP POLICY IF EXISTS "goals_update_access" ON goals;
DROP POLICY IF EXISTS "goals_delete_access" ON goals;

-- Create new simplified policies

-- Allow users to read their own goals and goals they participate in
CREATE POLICY "goal_select_policy"
  ON goals
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1
      FROM goal_participants
      WHERE goal_participants.goal_id = goals.id
      AND goal_participants.user_id = auth.uid()
    )
  );

-- Allow users to create goals (must be the owner)
CREATE POLICY "goal_insert_policy"
  ON goals
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Allow owners to update their goals
CREATE POLICY "goal_update_policy"
  ON goals
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- Allow owners to delete their goals
CREATE POLICY "goal_delete_policy"
  ON goals
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());