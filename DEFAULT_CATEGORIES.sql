-- Script pour créer des catégories par défaut
-- MÉTHODE 1: Trouvez d'abord votre user_id avec cette requête:
-- SELECT id FROM auth.users WHERE email = 'votre.email@example.com';
-- Puis remplacez 'YOUR_USER_ID_HERE' ci-dessous par votre user_id

-- MÉTHODE 2 (Recommandée): Utilisez cette fonction pour tous les utilisateurs existants
-- Cette fonction créera les catégories pour TOUS les utilisateurs qui n'en ont pas encore

DO $$
DECLARE
    user_record RECORD;
BEGIN
    -- Pour chaque utilisateur
    FOR user_record IN SELECT id FROM auth.users
    LOOP
        -- Catégories de DÉPENSES
        INSERT INTO transaction_categories (user_id, name, color, icon, type) VALUES
        (user_record.id, 'Alimentation', '#FF6B6B', '🍔', 'expense'),
        (user_record.id, 'Transport', '#4ECDC4', '🚗', 'expense'),
        (user_record.id, 'Logement', '#95E1D3', '🏠', 'expense'),
        (user_record.id, 'Santé', '#F38181', '💊', 'expense'),
        (user_record.id, 'Loisirs', '#AA96DA', '🎮', 'expense'),
        (user_record.id, 'Shopping', '#FCBAD3', '🛍️', 'expense'),
        (user_record.id, 'Restaurants', '#FF8C42', '🍽️', 'expense'),
        (user_record.id, 'Abonnements', '#6C5CE7', '📱', 'expense'),
        (user_record.id, 'Éducation', '#0984E3', '📚', 'expense'),
        (user_record.id, 'Autres dépenses', '#B2BEC3', '📦', 'expense')
        ON CONFLICT (user_id, name) DO NOTHING;

        -- Catégories de REVENUS
        INSERT INTO transaction_categories (user_id, name, color, icon, type) VALUES
        (user_record.id, 'Salaire', '#00B894', '💰', 'income'),
        (user_record.id, 'Freelance', '#6C5CE7', '💼', 'income'),
        (user_record.id, 'Investissements', '#FDCB6E', '📈', 'income'),
        (user_record.id, 'Bonus', '#00CEC9', '🎁', 'income'),
        (user_record.id, 'Remboursement', '#74B9FF', '💵', 'income'),
        (user_record.id, 'Autres revenus', '#55EFC4', '✨', 'income')
        ON CONFLICT (user_id, name) DO NOTHING;
    END LOOP;
END $$;
