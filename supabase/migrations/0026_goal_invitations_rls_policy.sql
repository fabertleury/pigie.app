-- Habilitar RLS na tabela goal_invitations
ALTER TABLE goal_invitations ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam seus próprios convites
CREATE POLICY "Usuários podem ver seus próprios convites" 
ON goal_invitations 
FOR SELECT 
USING (
  auth.uid() = invited_by OR 
  invited_email = auth.email()
);

-- Política para permitir que usuários insiram convites
CREATE POLICY "Usuários podem criar convites para suas metas" 
ON goal_invitations 
FOR INSERT 
WITH CHECK (
  auth.uid() = invited_by
);

-- Política para permitir que usuários atualizem o status dos convites
CREATE POLICY "Usuários podem atualizar o status de seus convites" 
ON goal_invitations 
FOR UPDATE 
USING (
  auth.uid() = invited_by OR 
  invited_email = auth.email()
);

-- Política para permitir que usuários excluam convites
CREATE POLICY "Usuários podem excluir seus próprios convites" 
ON goal_invitations 
FOR DELETE 
USING (
  auth.uid() = invited_by
);
