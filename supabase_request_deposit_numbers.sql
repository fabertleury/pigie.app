-- Testar a função request_deposit_numbers
-- Substitua os valores abaixo pelos corretos

-- Função para solicitar números de depósito
CREATE OR REPLACE FUNCTION request_deposit_numbers(
  p_goal_id UUID, 
  p_quantity INT DEFAULT 10, 
  p_user_id UUID DEFAULT NULL
) RETURNS INT[] AS $$
DECLARE
  v_available_numbers INT[];
  v_used_numbers INT[];
  v_total_slots INT;
  v_goal_record RECORD;
BEGIN
  -- Buscar detalhes da meta
  SELECT * INTO v_goal_record 
  FROM savings_goals 
  WHERE id = p_goal_id;

  IF v_goal_record IS NULL THEN
    RAISE EXCEPTION 'Meta não encontrada';
  END IF;

  -- Definir total de slots
  v_total_slots := v_goal_record.total_deposit_slots;

  -- Buscar números já usados
  v_used_numbers := ARRAY(
    SELECT DISTINCT deposit_number 
    FROM payment_proofs 
    WHERE goal_id = p_goal_id AND deposit_number IS NOT NULL
  );

  -- Gerar números disponíveis
  WITH all_numbers AS (
    SELECT generate_series(1, v_total_slots) AS number
  )
  SELECT ARRAY_AGG(number ORDER BY RANDOM())
  INTO v_available_numbers
  FROM all_numbers
  WHERE number != ALL(v_used_numbers)
  LIMIT p_quantity;

  RETURN v_available_numbers;
END;
$$ LANGUAGE plpgsql;
