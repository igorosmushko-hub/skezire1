-- READ ONLY. Run on the verified payment Supabase project, never the genealogy Neon DB.
-- Contains aggregates and schema/ACL only; no names, phones, payment IDs or credentials.
BEGIN READ ONLY;
SELECT current_database(), version();
SELECT table_name,column_name,data_type,is_nullable FROM information_schema.columns
 WHERE table_schema='public' AND table_name IN ('users','payments','packages') ORDER BY table_name,ordinal_position;
SELECT c.relname,c.relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
 WHERE n.nspname='public' AND c.relname IN ('users','payments','packages');
SELECT table_name,privilege_type,grantee FROM information_schema.role_table_grants
 WHERE table_schema='public' AND table_name IN ('users','payments','packages') ORDER BY table_name,grantee,privilege_type;
SELECT p.proname,p.prosecdef,p.proconfig,p.proacl,pg_get_functiondef(p.oid)
 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='public' AND p.proname IN ('confirm_package_payment','increment_paid_generations');
SELECT status,count(*) AS rows,count(*) FILTER(WHERE paid_at IS NULL) AS no_paid_at FROM payments GROUP BY status;
SELECT p.package_id,k.slug,k.generations,count(*) AS pending_invoices,min(p.created_at) AS oldest,max(p.created_at) AS newest
 FROM payments p LEFT JOIN packages k ON k.id=p.package_id WHERE p.status='pending' GROUP BY p.package_id,k.slug,k.generations;
SELECT count(*) AS invalid_balances FROM users WHERE paid_generations IS NULL OR paid_generations<0;
COMMIT;
-- After the receipt column is confirmed present, separately count paid rows without receipts.
-- A paid state/provider payment confirmation alone does not prove credits were delivered.
