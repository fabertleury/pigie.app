-- Diagnóstico Detalhado de Autenticação e Permissões

-- Verificar configurações de autenticação e permissões
DO $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT;
    v_has_goal_invitations BOOLEAN := FALSE;
    v_has_goals BOOLEAN := FALSE;
BEGIN
    -- Tentar obter o usuário autenticado
    BEGIN
        v_user_id := auth.uid();
        v_user_email := auth.email();
        RAISE NOTICE 'Usuário Autenticado - ID: %, Email: %', v_user_id, v_user_email;
    EXCEPTION 
        WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao obter usuário autenticado: %', SQLERRM;
    END;

    -- Verificar existência de registros em tabelas críticas
    BEGIN
        PERFORM 1 FROM goal_invitations LIMIT 1;
        v_has_goal_invitations := TRUE;
        RAISE NOTICE 'Tabela goal_invitations: Registros encontrados';
    EXCEPTION 
        WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao acessar goal_invitations: %', SQLERRM;
    END;

    BEGIN
        PERFORM 1 FROM goals LIMIT 1;
        v_has_goals := TRUE;
        RAISE NOTICE 'Tabela goals: Registros encontrados';
    EXCEPTION 
        WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao acessar goals: %', SQLERRM;
    END;

    -- Relatório final
    RAISE NOTICE '--- RELATÓRIO FINAL ---';
    RAISE NOTICE 'Usuário Autenticado: %', COALESCE(v_user_id::TEXT, 'NÃO AUTENTICADO');
    RAISE NOTICE 'Goal Invitations Acessível: %', v_has_goal_invitations;
    RAISE NOTICE 'Goals Acessível: %', v_has_goals;
END $$;

-- Listar políticas de segurança detalhadas
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    cmd AS command_type,
    qual AS policy_condition
FROM pg_policies
WHERE schemaname = 'public' AND tablename IN (
    'goals', 
    'goal_invitations', 
    'goal_participants', 
    'payment_proofs'
);

-- Verificar status de RLS para tabelas
SELECT 
    schemaname, 
    tablename, 
    rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public' AND tablename IN (
    'goals', 
    'goal_invitations', 
    'goal_participants', 
    'payment_proofs'
);

-- Diagnóstico de permissões de usuário
SELECT 
    grantee, 
    table_schema, 
    table_name, 
    privilege_type
FROM information_schema.table_privileges
WHERE 
    table_schema = 'public' AND 
    table_name IN (
        'goals', 
        'goal_invitations', 
        'goal_participants', 
        'payment_proofs'
    )
LIMIT 50;

-- Informações de sessão e autenticação
SELECT 
    current_setting('role') AS current_role,
    current_user,
    session_user,
    current_database(),
    current_setting('server_version_num') AS server_version_number;
