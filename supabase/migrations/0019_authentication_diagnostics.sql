-- Diagnóstico de Autenticação e Permissões

-- Verificar configurações de autenticação
SELECT 
    current_setting('role') AS current_role,
    current_user,
    session_user,
    auth.uid() AS authenticated_user_id,
    auth.email() AS authenticated_user_email;

-- Verificar status de RLS para tabelas críticas
SELECT 
    schemaname, 
    tablename, 
    rowsecurity AS row_level_security_enabled
FROM pg_tables
WHERE schemaname = 'public' AND tablename IN (
    'goals', 
    'goal_invitations', 
    'goal_participants', 
    'payment_proofs'
);

-- Listar todas as políticas de segurança existentes
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    cmd, 
    qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename IN (
    'goals', 
    'goal_invitations', 
    'goal_participants', 
    'payment_proofs'
);

-- Verificar usuários no sistema de autenticação
SELECT 
    id, 
    email, 
    created_at, 
    last_sign_in_at, 
    raw_user_meta_data
FROM auth.users
LIMIT 10;

-- Diagnóstico de permissões para tabelas específicas
DO $$
BEGIN
    -- Tentativa de acesso a tabelas críticas
    PERFORM * FROM goal_invitations LIMIT 1;
    RAISE NOTICE 'Acesso a goal_invitations: SUCESSO';
EXCEPTION 
    WHEN OTHERS THEN 
        RAISE NOTICE 'Erro ao acessar goal_invitations: %', SQLERRM;
END $$;

-- Script de teste de políticas
CREATE OR REPLACE FUNCTION test_table_policies()
RETURNS TABLE (
    table_name TEXT, 
    policy_check_result TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 'goal_invitations'::TEXT, 
        CASE 
            WHEN EXISTS (SELECT 1 FROM goal_invitations) 
            THEN 'Acesso permitido' 
            ELSE 'Sem registros ou acesso negado' 
        END;
END;
$$ LANGUAGE plpgsql;

-- Executar teste de políticas
SELECT * FROM test_table_policies();

-- Informações de configuração do banco de dados
SELECT 
    current_database(),
    version(),
    current_setting('server_version_num') AS server_version_number,
    current_setting('server_encoding') AS database_encoding;
