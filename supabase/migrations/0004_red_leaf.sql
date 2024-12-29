/*
  # Group Goals and Invitations Setup

  1. New Tables
    - goal_participants: Tracks users participating in group goals
    - goal_invitations: Manages invitations to group goals
  
  2. Changes
    - Add new policies for group goals access
    - Add functions for managing deposits and numbers
*/

-- Create goal participants table
CREATE TABLE IF NOT EXISTS goal_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid REFERENCES goals(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  deposit_numbers integer[] DEFAULT array[]::integer[],
  joined_at timestamptz DEFAULT now(),
  UNIQUE(goal_id, user_id)
);

ALTER TABLE goal_participants ENABLE ROW LEVEL SECURITY;

-- Create goal invitations table
CREATE TABLE IF NOT EXISTS goal_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid REFERENCES goals(id) ON DELETE CASCADE,
  invited_email text NOT NULL,
  invited_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(goal_id, invited_email)
);

ALTER TABLE goal_invitations ENABLE ROW LEVEL SECURITY;

-- Update goals policies to include group participants
CREATE POLICY "Participants can view group goals"
  ON goals
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM goal_participants
      WHERE goal_id = goals.id AND user_id = auth.uid()
    )
  );

-- Policies for goal participants
CREATE POLICY "Users can view their participations"
  ON goal_participants
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Goal owners can manage participants"
  ON goal_participants
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM goals
      WHERE id = goal_participants.goal_id
      AND created_by = auth.uid()
    )
  );

-- Policies for invitations
CREATE POLICY "Users can view received invitations"
  ON goal_invitations
  FOR SELECT
  TO authenticated
  USING (
    invited_email = (
      SELECT email FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Goal owners can manage invitations"
  ON goal_invitations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM goals
      WHERE id = goal_invitations.goal_id
      AND created_by = auth.uid()
    )
  );

-- Function to assign random deposit numbers
CREATE OR REPLACE FUNCTION assign_deposit_numbers(
  p_goal_id uuid,
  p_user_id uuid,
  p_count integer
)
RETURNS integer[] AS $$
DECLARE
  v_available integer[];
  v_assigned integer[];
  v_used integer[];
BEGIN
  -- Get all numbers already assigned for this goal
  SELECT array_agg(unnest(deposit_numbers))
  INTO v_used
  FROM goal_participants
  WHERE goal_id = p_goal_id;

  -- Generate sequence of all possible numbers
  WITH RECURSIVE numbers AS (
    SELECT 1 as n
    UNION ALL
    SELECT n + 1
    FROM numbers
    WHERE n < (
      SELECT target_amount
      FROM goals
      WHERE id = p_goal_id
    )
  )
  SELECT array_agg(n)
  INTO v_available
  FROM numbers
  WHERE n NOT IN (SELECT unnest(v_used) WHERE v_used IS NOT NULL);

  -- Randomly select numbers
  SELECT array_agg(x)
  INTO v_assigned
  FROM (
    SELECT v_available[ceil(random() * array_length(v_available, 1))] as x
    FROM generate_series(1, p_count)
  ) t;

  -- Update participant's numbers
  UPDATE goal_participants
  SET deposit_numbers = array_cat(deposit_numbers, v_assigned)
  WHERE goal_id = p_goal_id AND user_id = p_user_id;

  RETURN v_assigned;
END;
$$ LANGUAGE plpgsql;