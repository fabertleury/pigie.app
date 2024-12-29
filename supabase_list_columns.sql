-- Listar colunas da tabela profiles
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'profiles';
