/*
  # Correção de políticas de acesso

  1. Correções
    - Remove políticas recursivas
    - Simplifica políticas de acesso
    - Corrige políticas de convites
  
  2. Novas Políticas
    - Políticas simplificadas para metas
    - Políticas diretas para convites
    - Políticas de participantes
*/

-- Remove políticas existentes
DROP POLICY IF EXISTS "Goals access policy" ON goals;
DROP POLICY IF EXISTS "Invitations view policy" ON goal_invitations;
DROP POLICY IF EXISTS "Invitations insert policy" ON goal_invitations;

-- Política simplificada para metas
CREATE POLICY "goals_policy"
  ON goals
  FOR ALL
  TO authenticated
  USING (
    created_by = auth.uid() OR
    id IN (
      SELECT goal_id FROM goal_participants WHERE user_id = auth.uid()
    )
  );

-- Política para convites
CREATE POLICY "invitations_select_policy"
  ON goal_invitations
  FOR SELECT
  TO authenticated
  USING (
    invited_email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "invitations_insert_policy"
  ON goal_invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM goals WHERE id = goal_invitations.goal_id AND created_by = auth.uid()
    )
  );

-- Política para participantes
CREATE POLICY "participants_policy"
  ON goal_participants
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR
    goal_id IN (SELECT id FROM goals WHERE created_by = auth.uid())
  );