-- Habilitar RLS para goal_invitations
ALTER TABLE goal_invitations ENABLE ROW LEVEL SECURITY;

-- Política para permitir usuários autenticados verem seus próprios convites
DROP POLICY IF EXISTS "users_can_view_own_invitations" ON goal_invitations;
CREATE POLICY "users_can_view_own_invitations" ON goal_invitations
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND 
        (
            invited_email = auth.email() OR 
            invited_by = auth.uid()
        )
    );

-- Política para permitir usuários autenticados criarem convites
DROP POLICY IF EXISTS "users_can_create_invitations" ON goal_invitations;
CREATE POLICY "users_can_create_invitations" ON goal_invitations
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND 
        invited_by = auth.uid()
    );

-- Política para permitir usuários atualizarem o status dos próprios convites
DROP POLICY IF EXISTS "users_can_update_own_invitations" ON goal_invitations;
CREATE POLICY "users_can_update_own_invitations" ON goal_invitations
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL AND 
        (
            invited_email = auth.email() OR 
            invited_by = auth.uid()
        )
    );
