-- Adicionar coluna de participantes à tabela goals
ALTER TABLE goals 
ADD COLUMN participants UUID[] DEFAULT ARRAY[]::UUID[];

-- Criar índice para busca eficiente de participantes
CREATE INDEX idx_goals_participants ON goals USING gin (participants);
