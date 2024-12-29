-- Remover políticas existentes para goal_invitations
DO $$
DECLARE 
  policy_name TEXT;
BEGIN
  -- Dropar todas as políticas existentes para goal_invitations
  FOR policy_name IN (
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'goal_invitations'
  ) LOOP
    EXECUTE format('DROP POLICY %I ON goal_invitations', policy_name);
  END LOOP;
END $$;

-- Criar política de segurança simples e direta para goal_invitations
CREATE POLICY "Users can manage their own goal invitations" 
ON goal_invitations 
FOR ALL 
USING (
  -- Permitir acesso baseado em quem convidou ou para quem foi convidado
  auth.uid() = invited_by 
  OR 
  (
    SELECT email 
    FROM auth.users 
    WHERE id = auth.uid()
  ) = invited_email
);

-- Habilitar RLS na tabela
ALTER TABLE goal_invitations ENABLE ROW LEVEL SECURITY;

-- Garantir permissões básicas
GRANT SELECT, INSERT, UPDATE, DELETE ON goal_invitations TO authenticated;

-- Função para verificar e corrigir convites pendentes
CREATE OR REPLACE FUNCTION clean_stale_invitations()
RETURNS TRIGGER AS $$
BEGIN
  -- Remover convites com mais de 30 dias
  DELETE FROM goal_invitations 
  WHERE created_at < NOW() - INTERVAL '30 days' 
    AND status = 'pending';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para limpar convites antigos
CREATE OR REPLACE TRIGGER clean_old_invitations
AFTER INSERT OR UPDATE ON goal_invitations
FOR EACH STATEMENT
EXECUTE FUNCTION clean_stale_invitations();
