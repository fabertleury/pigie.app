-- Configurar permissões para acesso à tabela de usuários
DO $$
BEGIN
  -- Garantir que usuários autenticados possam acessar informações básicas
  GRANT SELECT (
    id, 
    email, 
    raw_user_meta_data, 
    created_at, 
    last_sign_in_at
  ) ON auth.users TO authenticated;
END $$;

-- Criar função para buscar email do usuário atual
CREATE OR REPLACE FUNCTION public.get_current_user_email()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  RETURN user_email;
END;
$$;

-- Configurações adicionais
DO $$
BEGIN
  -- Garantir permissão de execução da função
  GRANT EXECUTE ON FUNCTION public.get_current_user_email() TO authenticated;

  -- Criar view de perfil público para usuários
  CREATE OR REPLACE VIEW public.user_profiles AS
  SELECT 
    id, 
    email, 
    raw_user_meta_data->>'full_name' AS full_name,
    raw_user_meta_data->>'avatar_url' AS avatar_url,
    created_at
  FROM auth.users;

  -- Permissão de leitura para usuários autenticados
  GRANT SELECT ON public.user_profiles TO authenticated;
END $$;

-- Ajustar permissões para tabelas relacionadas
GRANT SELECT, INSERT, UPDATE ON 
  goal_invitations, 
  savings_goals, 
  payment_proofs 
TO authenticated;

-- Garantir que usuários possam ver seus próprios dados
CREATE POLICY "Users can view their own data" 
ON auth.users 
FOR SELECT 
USING (auth.uid() = id);
