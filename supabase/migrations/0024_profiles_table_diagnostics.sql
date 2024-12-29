-- Diagnóstico da tabela profiles

-- Verificar colunas da tabela profiles
SELECT 
    column_name, 
    data_type, 
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'profiles';

-- Listar todas as colunas da tabela
SELECT * FROM profiles LIMIT 1;

-- Verificar estrutura completa da tabela
SELECT 
    a.attname AS column_name,
    t.typname AS data_type
FROM 
    pg_catalog.pg_attribute a
JOIN 
    pg_catalog.pg_class c ON a.attrelid = c.oid
JOIN 
    pg_catalog.pg_type t ON a.atttypid = t.oid
WHERE 
    c.relname = 'profiles'
    AND a.attnum > 0
    AND NOT a.attisdropped;

-- Diagnosticar relacionamento com tabela de autenticação
SELECT 
    id, 
    email, 
    raw_user_meta_data
FROM auth.users
LIMIT 5;
