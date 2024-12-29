-- Atualização do schema para tabela savings_goals

-- Adicionar coluna pix_key se não existir
ALTER TABLE savings_goals 
ADD COLUMN pix_key TEXT;

-- Comentário para explicar o propósito da coluna
COMMENT ON COLUMN savings_goals.pix_key IS 'Chave PIX para identificação de pagamentos na meta';

-- Opcional: Criar índice para melhorar performance de busca
CREATE INDEX idx_savings_goals_pix_key ON savings_goals(pix_key);

-- Exemplo de atualização em lote para usuários existentes
-- IMPORTANTE: Substitua com a lógica correta de geração de chave PIX
UPDATE savings_goals 
SET pix_key = (
    SELECT id FROM profiles 
    WHERE profiles.id = savings_goals.created_by
) 
WHERE pix_key IS NULL;
