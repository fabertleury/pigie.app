/*
  # Fix Infinite Recursion in Policies

  1. Changes
    - Remove all existing policies from goals table
    - Create new simplified, non-recursive policies
    - Separate read and write access clearly
    - Use direct user ID comparisons instead of nested queries
    - Avoid policy chains that could cause recursion

  2. Security
    - Maintain proper access control
    - Ensure users can only access their own goals or goals they participate in
    - Prevent unauthorized modifications
*/

-- Remove all existing policies from goals table
DROP POLICY IF EXISTS "goals_read" ON goals;
DROP POLICY IF EXISTS "goals_insert" ON goals;
DROP POLICY IF EXISTS "goals_update" ON goals;
DROP POLICY IF EXISTS "goals_delete" ON goals;

-- Create new simplified policies for goals

-- Read policy (SELECT) - Direct access without recursion
CREATE POLICY "goals_read_access"
  ON goals
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1
      FROM goal_participants
      WHERE goal_participants.goal_id = goals.id
      AND goal_participants.user_id = auth.uid()
    )
  );

-- Write policies with simple ownership checks
CREATE POLICY "goals_insert_access"
  ON goals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "goals_update_access"
  ON goals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "goals_delete_access"
  ON goals
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);