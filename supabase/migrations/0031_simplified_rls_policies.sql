-- Remover políticas anteriores
DROP POLICY IF EXISTS "users_can_view_goals" ON goals;
DROP POLICY IF EXISTS "users_can_view_invitations" ON goal_invitations;

-- Política simplificada para metas
CREATE POLICY "users_can_view_goals" ON goals
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND 
        (
            created_by = auth.uid() OR 
            -- Verificar se o usuário tem um convite aceito para esta meta
            EXISTS (
                SELECT 1 FROM goal_invitations 
                WHERE 
                    goal_invitations.goal_id = goals.id AND
                    goal_invitations.invited_email = auth.email() AND 
                    goal_invitations.status = 'accepted'
            )
        )
    );

-- Política simplificada para convites
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
CREATE POLICY "users_can_create_invitations" ON goal_invitations
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND 
        invited_by = auth.uid()
    );

-- Política para atualizar convites
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

-- Adicionar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_goals_created_by ON goals(created_by);
CREATE INDEX IF NOT EXISTS idx_goal_invitations_invited_email ON goal_invitations(invited_email);
CREATE INDEX IF NOT EXISTS idx_goal_invitations_invited_by ON goal_invitations(invited_by);
CREATE INDEX IF NOT EXISTS idx_goal_invitations_goal_id ON goal_invitations(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_invitations_status ON goal_invitations(status);
