/*
  # Fix Infinite Recursion in Policies

  1. Changes
    - Remove all existing policies from goals table
    - Create new simplified non-recursive policies
    - Separate read and write access clearly
    - Use direct user ID comparisons
    - Avoid nested queries where possible

  2. Security
    - Maintain proper access control
    - Ensure users can only access their own goals or goals they participate in
    - Prevent unauthorized modifications
*/

-- Remove all existing policies from goals table
DROP POLICY IF EXISTS "goals_read_access" ON goals;
DROP POLICY IF EXISTS "goals_insert_access" ON goals;
DROP POLICY IF EXISTS "goals_update_access" ON goals;
DROP POLICY IF EXISTS "goals_delete_access" ON goals;

-- Create new simplified policies for goals

-- Read access (SELECT)
CREATE POLICY "goals_select"
  ON goals
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1
      FROM goal_participants
      WHERE goal_participants.goal_id = id
      AND goal_participants.user_id = auth.uid()
    )
  );

-- Insert access
CREATE POLICY "goals_insert"
  ON goals
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Update access
CREATE POLICY "goals_update"
  ON goals
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- Delete access
CREATE POLICY "goals_delete"
  ON goals
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Ensure RLS is enabled
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;