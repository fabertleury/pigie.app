-- Diagnóstico de criação de convites

-- Função para simular criação de convite
CREATE OR REPLACE FUNCTION test_goal_invitation_creation(
    test_goal_id UUID, 
    test_invited_email TEXT
)
RETURNS TABLE (
    invitation_id UUID,
    goal_id UUID,
    invited_email TEXT,
    invited_by UUID,
    status TEXT,
    creation_result TEXT
) AS $$
DECLARE
    v_current_user_id UUID;
    v_invitation_id UUID;
BEGIN
    -- Obter ID do usuário atual
    v_current_user_id := auth.uid();

    -- Tentar inserir convite
    BEGIN
        INSERT INTO goal_invitations (
            goal_id, 
            invited_email, 
            invited_by, 
            status
        ) VALUES (
            test_goal_id, 
            test_invited_email, 
            v_current_user_id, 
            'pending'
        ) RETURNING id INTO v_invitation_id;

        RETURN QUERY 
        SELECT 
            v_invitation_id,
            test_goal_id,
            test_invited_email,
            v_current_user_id,
            'pending'::TEXT,
            'Convite criado com sucesso'::TEXT;
    EXCEPTION 
        WHEN OTHERS THEN
            RETURN QUERY 
            SELECT 
                NULL::UUID,
                test_goal_id,
                test_invited_email,
                v_current_user_id,
                'error'::TEXT,
                SQLERRM::TEXT;
    END;
END;
$$ LANGUAGE plpgsql;

-- Verificar um objetivo existente para teste
SELECT id, title, created_by 
FROM goals 
LIMIT 1;

-- Executar teste de criação de convite
-- SUBSTITUIR goal_id E email ANTES DE EXECUTAR
-- SELECT * FROM test_goal_invitation_creation(
--     'SUBSTITUIR_COM_UUID_DO_OBJETIVO', 
--     'email_para_convidar@exemplo.com'
-- );
