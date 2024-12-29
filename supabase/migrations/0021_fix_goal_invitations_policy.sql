-- Atualizar política de goal_invitations para usar invited_email

-- Remover políticas existentes
DROP POLICY IF EXISTS "invitations_policy" ON goal_invitations;
DROP POLICY IF EXISTS "invitations_insert_policy" ON goal_invitations;
DROP POLICY IF EXISTS "invitations_update_policy" ON goal_invitations;
DROP POLICY IF EXISTS "invitations_delete_policy" ON goal_invitations;

-- Nova política para goal_invitations usando invited_email
CREATE POLICY "invitations_policy"
  ON goal_invitations
  FOR SELECT
  TO authenticated
  USING (
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
    invited_by = auth.uid()
  );

-- Política para inserção de convites
CREATE POLICY "invitations_insert_policy"
  ON goal_invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    invited_by = auth.uid()
  );

-- Política para atualização de convites
CREATE POLICY "invitations_update_policy"
  ON goal_invitations
  FOR UPDATE
  TO authenticated
  USING (
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
    invited_by = auth.uid()
  );

-- Política para exclusão de convites
CREATE POLICY "invitations_delete_policy"
  ON goal_invitations
  FOR DELETE
  TO authenticated
  USING (
    invited_by = auth.uid()
  );

-- Habilitar Row Level Security se não estiver ativo
ALTER TABLE goal_invitations ENABLE ROW LEVEL SECURITY;
