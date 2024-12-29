-- Diagnóstico específico de convites para fabert_@hotmail.com

-- Listar todos os convites para este email
SELECT 
    id, 
    goal_id, 
    invited_email, 
    invited_by, 
    status, 
    created_at
FROM goal_invitations
WHERE invited_email = 'fabert_@hotmail.com';

-- Verificar informações dos goals relacionados aos convites
SELECT 
    gi.id AS invitation_id,
    gi.goal_id,
    g.title AS goal_title,
    g.created_by AS goal_creator,
    gi.invited_email,
    gi.invited_by,
    gi.status,
    gi.created_at
FROM goal_invitations gi
JOIN goals g ON gi.goal_id = g.id
WHERE gi.invited_email = 'fabert_@hotmail.com';

-- Verificar perfil do usuário criador do convite
SELECT 
    gi.id AS invitation_id,
    gi.goal_id,
    gi.invited_email,
    gi.invited_by,
    au.email AS inviter_email,
    gi.status,
    gi.created_at
FROM goal_invitations gi
JOIN auth.users au ON gi.invited_by = au.id
WHERE gi.invited_email = 'fabert_@hotmail.com';
