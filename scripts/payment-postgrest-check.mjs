// Disposable Docker network/PostgreSQL/PostgREST; synthetic data only. No .env is read.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { randomUUID, createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import jwt from 'jsonwebtoken';
import { PostgrestClient } from '@supabase/postgrest-js';
const require = createRequire(import.meta.url);
const { NextRequest } = require('next/server');
const suffix = randomUUID().slice(0, 8);
const network = `skezire-payment-test-${suffix}`;
const db = `${network}-db`, rest = `${network}-rest`;
const secret = `synthetic-local-only-${randomUUID()}`;
const docker = (...args) => execFileSync('docker', args, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
const sql = query => execFileSync('docker', ['exec', '-i', db, 'psql', '-h', '127.0.0.1', '-U', 'postgres', '-XqAt', '-v', 'ON_ERROR_STOP=1'], { input: query, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
const load = (path, mocks = {}, env = {}) => {
  const code = ts.transpileModule(readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const loaded = { exports: {} };
  vm.runInNewContext(code, { module: loaded, exports: loaded.exports, process: { env }, require: name => name in mocks ? mocks[name] : require(name) });
  return loaded.exports;
};
const pause = () => new Promise(resolve => setTimeout(resolve, 100));
const started = [];
try {
  docker('network', 'create', network);
  docker('run', '-d', '--name', db, '--network', network, '--network-alias', 'db', '--memory=256m', '-e', `POSTGRES_PASSWORD=${secret}`, 'postgres:16'); started.push(db);
  for (let i = 0; ; i++) { try { sql('SELECT 1'); break; } catch { assert(i < 100, 'isolated postgres did not start'); await pause(); } }
  sql(`CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN; CREATE ROLE service_role NOLOGIN BYPASSRLS;
    CREATE TABLE public.users(id uuid PRIMARY KEY, paid_generations integer DEFAULT 0);`);
  sql(readFileSync('supabase/migrations/001_monetization.sql', 'utf8'));
  sql(`GRANT USAGE ON SCHEMA public TO service_role, anon, authenticated;
    GRANT SELECT, UPDATE ON public.payments, public.users, public.packages TO service_role;
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY; ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY; ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;`);
  const migration = readFileSync('supabase/migrations/20260905183201_atomic_package_payment.sql', 'utf8');
  assert.match(migration, /SET LOCAL lock_timeout = '5s'/); assert.match(migration, /SET LOCAL statement_timeout = '60s'/);
  sql(migration);
  docker('run', '-d', '--name', rest, '--network', network, '--memory=128m', '-p', '127.0.0.1::3000', '-e', `PGRST_DB_URI=postgres://postgres:${secret}@db:5432/postgres`, '-e', 'PGRST_DB_SCHEMAS=public', '-e', 'PGRST_DB_ANON_ROLE=anon', '-e', `PGRST_JWT_SECRET=${secret}`, 'public.ecr.aws/supabase/postgrest:v14.14'); started.push(rest);
  const url = `http://${docker('port', rest, '3000/tcp')}`;
  for (let i = 0; ; i++) { try { const r = await fetch(url); if (r.ok) break; } catch {} assert(i < 100, 'isolated PostgREST did not start'); await pause(); }
  const client = role => new PostgrestClient(url, { headers: { Authorization: `Bearer ${jwt.sign({ role }, secret, { expiresIn: '5m' })}` } });
  const service = client('service_role');
  const user = randomUUID(); sql(`INSERT INTO public.users(id) VALUES ('${user}')`);
  const fixture = () => JSON.parse(sql(`INSERT INTO public.payments(user_id,package_id,amount_kzt,status) SELECT '${user}',id,990,'pending' FROM packages WHERE slug='starter' RETURNING row_to_json(payments)`));
  const state = id => JSON.parse(sql(`SELECT json_build_object('status',p.status,'paid_at',p.paid_at,'receipt',p.credited_generations,'balance',u.paid_generations) FROM payments p JOIN users u ON u.id=p.user_id WHERE p.id='${id}'`));
  const args = p => ({ p_payment_id:p.id, p_inv_id:p.inv_id, p_amount_kzt:'990.000000' });
  const probe = fixture();
  for (const role of ['anon', 'authenticated']) { const r = await client(role).rpc('confirm_package_payment', args(probe)); assert(r.error, `${role} unexpectedly permitted`); }
  assert.equal(state(probe.id).balance, 0);
  const robokassa = load('src/lib/robokassa.ts', {}, { ROBOKASSA_PASSWORD2: secret });
  const handler = load('src/app/api/payments/result/route.ts', { '@/lib/supabase': { getSupabase: () => service }, '@/lib/robokassa': robokassa, '@/lib/telegram-bot': { isBotConfigured: () => false } }, { ROBOKASSA_PASSWORD2: secret });
  const callback = async (p, method='POST', amount='990.000000') => {
    const params = new URLSearchParams({ OutSum:amount, InvId:String(p.inv_id), Shp_paymentId:p.id });
    params.set('SignatureValue', createHash('md5').update(`${amount}:${p.inv_id}:${secret}:Shp_paymentId=${p.id}`).digest('hex'));
    const req = new NextRequest(`http://localhost/api/payments/result${method==='GET'?'?'+params:''}`, method==='POST'?{method,body:params}:{});
    return handler[method](req);
  };
  const first = await callback(probe); assert.equal(first.status, 200); assert.equal(await first.text(), `OK${probe.inv_id}`);
  const once = state(probe.id); assert.equal(once.receipt, 5); assert.equal(once.balance, 5);
  assert.equal((await callback(probe,'GET')).status,200); assert.deepEqual(state(probe.id),once);
  const race = fixture(); const repeated = await Promise.all(Array.from({length:8}, (_,i)=>callback(race,i%2?'GET':'POST')));
  assert(repeated.every(r=>r.status===200)); assert.equal(state(race.id).balance,10);
  assert.equal((await callback(race,'POST','991')).status,400); assert.equal(state(race.id).balance,10);
  const failure=fixture();sql(`CREATE FUNCTION deny_credit_test() RETURNS trigger LANGUAGE plpgsql AS $$BEGIN RAISE EXCEPTION 'synthetic_credit_failure'; END$$; CREATE TRIGGER deny_credit_test BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION deny_credit_test();`);
  assert.equal((await callback(failure)).status,503); assert.equal(state(failure.id).status,'pending'); assert.equal(state(failure.id).receipt,null);
  sql('DROP TRIGGER deny_credit_test ON users'); assert.equal((await callback(failure)).status,200); assert.equal(state(failure.id).balance,15);
  console.log('PASS actual PostgREST 14.14 + PostgreSQL16: schema/RPC/role denial, real GET/POST handler, six-decimal KZT, stable repeat, eight concurrent callbacks, wrong amount, rollback and retry. Synthetic provider signature only; no provider sandbox or target DB verified.');
} finally {
  for (const container of started.reverse()) { try { docker('rm','-f',container); } catch {} }
  try { docker('network','rm',network); } catch {}
}
