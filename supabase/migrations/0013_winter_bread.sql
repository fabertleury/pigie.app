/*
  # Fix Goals Policies

  1. Changes
    - Remove all existing policies from goals table
    - Create new simplified non-recursive policies
    - Separate policies for owners and participants
    - Ensure no circular dependencies in policy definitions

  2. Security
    - Maintain proper access control
    - Prevent infinite recursion
    - Keep data isolation between users
*/

-- Remove all existing policies from goals table to start fresh
DROP POLICY IF EXISTS "goals_owner_all" ON goals;
DROP POLICY IF EXISTS "goals_participant_select" ON goals;

-- Create new simplified policies for goals

-- Policy for goal owners (full access)
CREATE POLICY "goals_owner_access"
  ON goals
  FOR ALL
  TO authenticated
  USING (created_by = auth.uid());

-- Policy for participants (read-only)
CREATE POLICY "goals_participant_access"
  ON goals
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT DISTINCT goal_id 
      FROM goal_participants 
      WHERE user_id = auth.uid()
    )
  );