/*
  # Fix Goals Policies - Final Version

  1. Changes
    - Remove all existing policies
    - Create new simplified non-recursive policies
    - Separate read and write operations
    - Use direct user ID comparisons
    - Avoid any potential circular references

  2. Security
    - Maintain proper access control
    - Prevent infinite recursion
    - Keep data isolation between users
*/

-- Remove all existing policies from goals table
DROP POLICY IF EXISTS "goals_owner_access" ON goals;
DROP POLICY IF EXISTS "goals_participant_access" ON goals;

-- Create new simplified policies for goals

-- Read policy (SELECT)
CREATE POLICY "goals_read"
  ON goals
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    id IN (
      SELECT goal_id 
      FROM goal_participants 
      WHERE user_id = auth.uid()
    )
  );

-- Write policies (INSERT, UPDATE, DELETE)
CREATE POLICY "goals_insert"
  ON goals
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

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