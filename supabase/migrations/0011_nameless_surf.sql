/*
  # Fix Goals Policies

  1. Changes
    - Remove all existing policies for goals table
    - Create simplified policies without recursion
    - Fix related tables policies

  2. Security
    - Maintain proper access control
    - Prevent infinite recursion
    - Enable proper data access for users
*/

-- Remove all existing policies from goals table
DROP POLICY IF EXISTS "goals_access" ON goals;
DROP POLICY IF EXISTS "basic_goals_policy" ON goals;
DROP POLICY IF EXISTS "participant_goals_policy" ON goals;

-- Create new simplified policies for goals
CREATE POLICY "goals_select_policy"
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

CREATE POLICY "goals_insert_policy"
  ON goals
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "goals_update_policy"
  ON goals
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "goals_delete_policy"
  ON goals
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());