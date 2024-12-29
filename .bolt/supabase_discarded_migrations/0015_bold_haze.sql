/*
  # Fix Goals Policies - Final Version

  1. Changes
    - Remove all existing policies
    - Create new non-recursive policies
    - Separate policies for different operations
    - Fix null value constraint for target_amount

  2. Security
    - Maintain proper access control
    - Prevent infinite recursion
    - Keep data isolation between users
*/

-- Remove all existing policies
DROP POLICY IF EXISTS "goals_read" ON goals;
DROP POLICY IF EXISTS "goals_insert" ON goals;
DROP POLICY IF EXISTS "goals_update" ON goals;
DROP POLICY IF EXISTS "goals_delete" ON goals;

-- Create new simplified policies

-- Read policy (SELECT)
CREATE POLICY "goals_read"
  ON goals
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 
      FROM goal_participants 
      WHERE goal_id = goals.id 
      AND user_id = auth.uid()
    )
  );

-- Write policies
CREATE POLICY "goals_insert"
  ON goals
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    target_amount IS NOT NULL AND
    target_amount > 0
  );

CREATE POLICY "goals_update"
  ON goals
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "goals_delete"
  ON goals
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());