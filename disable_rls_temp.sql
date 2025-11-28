-- ATTENTION: À utiliser UNIQUEMENT en développement pour déboguer
-- Désactiver temporairement RLS sur les tables de commandes

-- Désactiver RLS
ALTER TABLE commande DISABLE ROW LEVEL SECURITY;
ALTER TABLE commande_plat DISABLE ROW LEVEL SECURITY;
ALTER TABLE plat DISABLE ROW LEVEL SECURITY;

-- Vérifier que c'est bien désactivé
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('commande', 'commande_plat', 'plat');

-- Vérifier les données
SELECT 'Commandes' as table_name, COUNT(*) as count FROM commande
UNION ALL
SELECT 'Commande_plat', COUNT(*) FROM commande_plat
UNION ALL
SELECT 'Plat', COUNT(*) FROM plat;

-- Pour réactiver plus tard (NE PAS EXÉCUTER MAINTENANT):
-- ALTER TABLE commande ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE commande_plat ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE plat ENABLE ROW LEVEL SECURITY;
