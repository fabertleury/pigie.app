-- Verificar e renomear tabelas existentes
DO $$
DECLARE 
  old_goal_record RECORD;
BEGIN
  -- Verificar se a tabela goals existe
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'goals') THEN
    -- Verificar se savings_goals já não existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'savings_goals') THEN
      -- Criar tabela savings_goals com a estrutura correta
      CREATE TABLE savings_goals (
        id UUID PRIMARY KEY,
        title TEXT,
        target_amount NUMERIC(15, 2),
        total_deposits NUMERIC(15, 2) DEFAULT 0,
        total_deposit_slots INTEGER DEFAULT 250,
        created_by UUID,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        status goal_status DEFAULT 'active',
        is_group BOOLEAN DEFAULT false,
        participants UUID[] DEFAULT ARRAY[]::UUID[]
      );

      -- Migrar dados com mapeamento explícito
      FOR old_goal_record IN 
        SELECT 
          id, 
          title, 
          target_amount, 
          total_deposits, 
          250 AS total_deposit_slots, 
          created_by, 
          created_at, 
          updated_at, 
          'active'::goal_status AS status, 
          false AS is_group,
          ARRAY[created_by]::UUID[] AS participants
        FROM goals
      LOOP
        INSERT INTO savings_goals (
          id, 
          title, 
          target_amount, 
          total_deposits, 
          total_deposit_slots, 
          created_by, 
          created_at, 
          updated_at, 
          status, 
          is_group,
          participants
        ) VALUES (
          old_goal_record.id,
          old_goal_record.title,
          old_goal_record.target_amount,
          old_goal_record.total_deposits,
          old_goal_record.total_deposit_slots,
          old_goal_record.created_by,
          old_goal_record.created_at,
          old_goal_record.updated_at,
          old_goal_record.status,
          old_goal_record.is_group,
          old_goal_record.participants
        ) ON CONFLICT (id) DO NOTHING;
      END LOOP;

      -- Dropar tabela antiga
      DROP TABLE goals;
    END IF;
  END IF;

  -- Atualizar referências de chaves estrangeiras
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'goal_invitations') THEN
    -- Verificar e corrigir referência para savings_goals
    IF NOT EXISTS (
      SELECT 1 
      FROM information_schema.table_constraints 
      WHERE table_name = 'goal_invitations' 
        AND constraint_type = 'FOREIGN KEY' 
        AND constraint_name LIKE '%savings_goals%'
    ) THEN
      -- Dropar constraint antiga
      ALTER TABLE "goal_invitations" 
      DROP CONSTRAINT IF EXISTS "goal_invitations_goal_id_fkey";

      -- Adicionar nova constraint
      ALTER TABLE "goal_invitations" 
      ADD CONSTRAINT "goal_invitations_goal_id_fkey" 
      FOREIGN KEY (goal_id) REFERENCES savings_goals(id) ON DELETE CASCADE;
    END IF;
  END IF;

  -- Atualizar referências em payment_proofs
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_proofs') THEN
    -- Verificar e corrigir referência para savings_goals
    IF NOT EXISTS (
      SELECT 1 
      FROM information_schema.table_constraints 
      WHERE table_name = 'payment_proofs' 
        AND constraint_type = 'FOREIGN KEY' 
        AND constraint_name LIKE '%savings_goals%'
    ) THEN
      -- Dropar constraint antiga
      ALTER TABLE "payment_proofs" 
      DROP CONSTRAINT IF EXISTS "payment_proofs_goal_id_fkey";

      -- Adicionar nova constraint
      ALTER TABLE "payment_proofs" 
      ADD CONSTRAINT "payment_proofs_goal_id_fkey" 
      FOREIGN KEY (goal_id) REFERENCES savings_goals(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- Adicionar índices se não existirem
DO $$
BEGIN
  -- Índice para participantes
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_indexes 
    WHERE tablename = 'savings_goals' 
      AND indexname = 'idx_savings_goals_participants'
  ) THEN
    CREATE INDEX idx_savings_goals_participants 
    ON savings_goals USING gin(participants);
  END IF;

  -- Índice para convites por email
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_indexes 
    WHERE tablename = 'goal_invitations' 
      AND indexname = 'idx_goal_invitations_invited_email'
  ) THEN
    CREATE INDEX idx_goal_invitations_invited_email 
    ON goal_invitations(invited_email);
  END IF;
END $$;
