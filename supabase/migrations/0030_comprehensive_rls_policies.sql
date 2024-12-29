-- Habilitar RLS para tabelas relevantes
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_invitations ENABLE ROW LEVEL SECURITY;

-- Política para metas: usuários podem ver metas que criaram ou foram convidados
DROP POLICY IF EXISTS "users_can_view_goals" ON goals;
CREATE POLICY "users_can_view_goals" ON goals
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND 
        (
            created_by = auth.uid() OR 
            -- Verificar se o usuário está em algum convite para esta meta
            EXISTS (
                SELECT 1 FROM goal_invitations 
                WHERE 
                    goal_invitations.goal_id = goals.id AND
                    (
                        goal_invitations.invited_email = auth.email() OR 
                        goal_invitations.invited_by = auth.uid()
                    ) AND 
                    goal_invitations.status = 'accepted'
            )
        )
    );

-- Política para convites: usuários podem ver seus próprios convites
DROP POLICY IF EXISTS "users_can_view_invitations" ON goal_invitations;
CREATE POLICY "users_can_view_invitations" ON goal_invitations
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND 
        (
            invited_email = auth.email() OR 
            invited_by = auth.uid()
        )
    );

-- Política para criar convites
DROP POLICY IF EXISTS "users_can_create_invitations" ON goal_invitations;
CREATE POLICY "users_can_create_invitations" ON goal_invitations
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND 
        invited_by = auth.uid()
    );

-- Política para atualizar convites
DROP POLICY IF EXISTS "users_can_update_invitations" ON goal_invitations;
CREATE POLICY "users_can_update_invitations" ON goal_invitations
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL AND 
        (
            invited_email = auth.email() OR 
            invited_by = auth.uid()
        )
    );

-- Garantir que todos os usuários autenticados possam fazer operações básicas
GRANT SELECT, INSERT, UPDATE ON goals TO authenticated;
GRANT SELECT, INSERT, UPDATE ON goal_invitations TO authenticated;

-- Adicionar índices para melhorar performance das políticas
CREATE INDEX IF NOT EXISTS idx_goals_created_by ON goals(created_by);
CREATE INDEX IF NOT EXISTS idx_goal_invitations_invited_email ON goal_invitations(invited_email);
CREATE INDEX IF NOT EXISTS idx_goal_invitations_invited_by ON goal_invitations(invited_by);
CREATE INDEX IF NOT EXISTS idx_goal_invitations_goal_id ON goal_invitations(goal_id);
