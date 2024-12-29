-- Diagnóstico detalhado de goal_invitations

-- Verificar total de registros
SELECT COUNT(*) AS total_invitations FROM goal_invitations;

-- Listar todos os convites com detalhes
SELECT 
    id, 
    goal_id, 
    invited_email, 
    invited_by, 
    status, 
    created_at
FROM goal_invitations
LIMIT 50;

-- Verificar emails dos usuários autenticados
SELECT 
    id, 
    email, 
    raw_user_meta_data
FROM auth.users
LIMIT 10;

-- Função para verificar convites relacionados ao usuário atual
CREATE OR REPLACE FUNCTION check_user_invitations()
RETURNS TABLE (
    invitation_id UUID,
    goal_id UUID,
    invited_email TEXT,
    invited_by UUID,
    status TEXT,
    current_user_id UUID,
    current_user_email TEXT
) AS $$
DECLARE
    v_current_user_id UUID;
    v_current_user_email TEXT;
BEGIN
    v_current_user_id := auth.uid();
    v_current_user_email := auth.email();

    RETURN QUERY
    SELECT 
        gi.id,
        gi.goal_id,
        gi.invited_email,
        gi.invited_by,
        gi.status,
        v_current_user_id,
        v_current_user_email
    FROM goal_invitations gi
    WHERE 
        gi.invited_email = v_current_user_email OR 
        gi.invited_by = v_current_user_id;
END;
$$ LANGUAGE plpgsql;

-- Executar função de diagnóstico
SELECT * FROM check_user_invitations();
