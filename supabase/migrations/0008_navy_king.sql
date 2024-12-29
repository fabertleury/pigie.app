/*
  # Correção final das políticas de acesso

  1. Correções
    - Remove todas as políticas anteriores
    - Implementa políticas simplificadas sem recursão
    - Corrige permissões de acesso
  
  2. Novas Políticas
    - Políticas diretas para metas
    - Políticas simples para convites
    - Políticas para participantes
*/

-- Remove todas as políticas existentes
DROP POLICY IF EXISTS "goals_policy" ON goals;
DROP POLICY IF EXISTS "invitations_select_policy" ON goal_invitations;
DROP POLICY IF EXISTS "invitations_insert_policy" ON goal_invitations;
DROP POLICY IF EXISTS "participants_policy" ON goal_participants;

-- Política básica para metas (sem recursão)
CREATE POLICY "basic_goals_policy"
  ON goals
  FOR ALL
  TO authenticated
  USING (
    created_by = auth.uid()
  );

-- Política para participantes de metas
CREATE POLICY "participant_goals_policy"
  ON goals
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT goal_id 
      FROM goal_participants 
      WHERE user_id = auth.uid()
    )
  );

-- Política simplificada para convites
CREATE POLICY "basic_invitations_policy"
  ON goal_invitations
  FOR SELECT
  TO authenticated
  USING (
    invited_email = (
      SELECT email 
      FROM profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "create_invitations_policy"
  ON goal_invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM goals 
      WHERE id = goal_invitations.goal_id 
      AND created_by = auth.uid()
    )
  );

-- Política simplificada para participantes
CREATE POLICY "basic_participants_policy"
  ON goal_participants
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid()
  );