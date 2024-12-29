-- Verificar e criar extensão UUID se não existir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tipo de status de meta se não existir
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'goal_status') THEN
    CREATE TYPE goal_status AS ENUM ('active', 'completed', 'paused');
  END IF;
END $$;

-- Criar tipo de status de convite se não existir
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invitation_status') THEN
    CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'rejected');
  END IF;
END $$;

-- Criar tabela de metas de poupança se não existir
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'savings_goals') THEN
    CREATE TABLE savings_goals (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title TEXT NOT NULL,
      target_amount NUMERIC(15, 2) NOT NULL,
      total_deposits NUMERIC(15, 2) DEFAULT 0,
      total_deposit_slots INTEGER DEFAULT 250,
      created_by UUID REFERENCES auth.users(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      status goal_status DEFAULT 'active',
      is_group BOOLEAN DEFAULT false,
      participants UUID[] DEFAULT ARRAY[]::UUID[]
    );

    -- Criar índices para melhorar performance
    CREATE INDEX idx_savings_goals_created_by ON savings_goals(created_by);
    CREATE INDEX idx_savings_goals_participants ON savings_goals USING gin(participants);
  END IF;
END $$;

-- Trigger para atualizar timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Adicionar trigger se não existir
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE event_object_table = 'savings_goals' AND trigger_name = 'update_savings_goals_modtime') THEN
    CREATE TRIGGER update_savings_goals_modtime
    BEFORE UPDATE ON savings_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
  END IF;
END $$;

-- Criar tabela de convites para metas se não existir
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'goal_invitations') THEN
    CREATE TABLE goal_invitations (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      goal_id UUID REFERENCES savings_goals(id) ON DELETE CASCADE,
      invited_by UUID REFERENCES auth.users(id),
      invited_email TEXT NOT NULL,
      status invitation_status DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Criar índices para melhorar performance
    CREATE INDEX idx_goal_invitations_goal_id ON goal_invitations(goal_id);
    CREATE INDEX idx_goal_invitations_invited_email ON goal_invitations(invited_email);
  END IF;
END $$;

-- Criar tabela de comprovantes de pagamento se não existir
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_proofs') THEN
    CREATE TABLE payment_proofs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      goal_id UUID REFERENCES savings_goals(id) ON DELETE CASCADE,
      user_id UUID REFERENCES auth.users(id),
      file_url TEXT NOT NULL,
      verified BOOLEAN DEFAULT false,
      verified_by UUID REFERENCES auth.users(id),
      verified_at TIMESTAMPTZ,
      deposit_number INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Criar índices para melhorar performance
    CREATE INDEX idx_payment_proofs_goal_id ON payment_proofs(goal_id);
    CREATE INDEX idx_payment_proofs_user_id ON payment_proofs(user_id);
  END IF;
END $$;

-- Função para solicitar números de depósito
CREATE OR REPLACE FUNCTION request_deposit_numbers(
  p_goal_id UUID, 
  p_user_id UUID, 
  p_quantity INTEGER DEFAULT 1
)
RETURNS INTEGER[]
LANGUAGE plpgsql
AS $$
DECLARE
  available_numbers INTEGER[];
  selected_numbers INTEGER[];
BEGIN
  -- Buscar números já utilizados
  SELECT ARRAY_AGG(deposit_number) INTO available_numbers
  FROM payment_proofs
  WHERE goal_id = p_goal_id AND deposit_number IS NOT NULL;

  -- Selecionar números disponíveis
  WITH available_slots AS (
    SELECT generate_series(1, 250) AS number
    EXCEPT 
    SELECT unnest(available_numbers)
    LIMIT p_quantity
  )
  SELECT ARRAY_AGG(number) INTO selected_numbers
  FROM available_slots;

  -- Retornar números selecionados
  RETURN selected_numbers;
END;
$$;

-- Permissões para funções e tabelas
GRANT SELECT, INSERT, UPDATE, DELETE ON savings_goals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON goal_invitations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON payment_proofs TO authenticated;
GRANT EXECUTE ON FUNCTION request_deposit_numbers(UUID, UUID, INTEGER) TO authenticated;
