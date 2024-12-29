/*
  # Fix Goals Policies - Final Version

  1. Changes
    - Remove all existing policies
    - Create new non-recursive policies
    - Separate policies for different operations
    - Use materialized views for performance
    - Avoid any circular references

  2. Security
    - Maintain proper access control
    - Prevent infinite recursion
    - Keep data isolation between users
*/

-- First, remove all existing policies
DROP POLICY IF EXISTS "goals_read" ON goals;
DROP POLICY IF EXISTS "goals_insert" ON goals;
DROP POLICY IF EXISTS "goals_update" ON goals;
DROP POLICY IF EXISTS "goals_delete" ON goals;

-- Create a materialized view for participant access
DROP MATERIALIZED VIEW IF EXISTS user_accessible_goals;
CREATE MATERIALIZED VIEW user_accessible_goals AS
SELECT DISTINCT goal_id, user_id
FROM goal_participants;

CREATE INDEX idx_user_accessible_goals ON user_accessible_goals(user_id, goal_id);

-- Create function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_user_accessible_goals()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_accessible_goals;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to refresh the view
DROP TRIGGER IF EXISTS refresh_user_accessible_goals_trigger ON goal_participants;
CREATE TRIGGER refresh_user_accessible_goals_trigger
AFTER INSERT OR UPDATE OR DELETE ON goal_participants
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_user_accessible_goals();

-- Create new simplified policies for goals

-- Read policy (SELECT)
CREATE POLICY "goals_select"
  ON goals
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    id IN (
      SELECT goal_id 
      FROM user_accessible_goals 
      WHERE user_id = auth.uid()
    )
  );

-- Write policies
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

-- Initial refresh of the materialized view
REFRESH MATERIALIZED VIEW user_accessible_goals;