// Isolated PostgreSQL + real callback/signature code. No .env, network DB or payments.
// Requires node >=22, installed project dependencies, initdb/pg_ctl/psql on PATH.
import assert from 'node:assert/strict';
import { execFile, execFileSync } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { randomUUID, createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import vm from 'node:vm';

const run = promisify(execFile);
const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);
const ts = require('typescript');
const { NextRequest } = require('next/server');
const dir = mkdtempSync('/tmp/skezire-payment-');
const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('PG')));
const psqlArgs = ['-X', '-qAt', '-h', dir, '-p', '5432', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-v', 'VERBOSITY=verbose'];
const sql = async (query) => (await run('psql', [...psqlArgs, '-c', query], { env })).stdout.trim();
const literal = (value) => value === null ? 'NULL' : `'${String(value).replaceAll("'", "''")}'`;
const call = (payment, amount = '990.000000', invoice = payment.inv_id, role = 'service_role') =>
  sql(`SET ROLE ${role}; SELECT public.confirm_package_payment(${literal(payment.id)}::uuid, ${literal(invoice)}::integer, ${literal(amount)}::numeric)`);
const expectSqlError = (promise, code) => assert.rejects(promise, (error) => {
  assert.match(error.stderr, new RegExp(`ERROR:  ${code}:`));
  return true;
});
let started = false;
let checks = 0;
const check = (name) => { checks++; console.log(`PASS ${name}`); };
try {
  execFileSync('initdb', ['-D', `${dir}/data`, '-U', 'postgres', '-A', 'trust', '--no-locale', '-E', 'UTF8'], { env, stdio: 'pipe' });
  execFileSync('pg_ctl', ['-D', `${dir}/data`, '-l', `${dir}/postgres.log`, '-o', `-k ${dir} -c listen_addresses=''`, '-w', 'start'], { env, stdio: 'pipe' });
  started = true;
  console.log(await sql('SELECT version()'));
  await sql(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
    CREATE TABLE public.users (id uuid PRIMARY KEY, paid_generations integer DEFAULT 0);
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO anon, authenticated, service_role;`);
  await sql(readFileSync(resolve(root, 'supabase/migrations/001_monetization.sql'), 'utf8'));
  const userId = randomUUID();
  await sql(`INSERT INTO public.users(id) VALUES (${literal(userId)});
    GRANT USAGE ON SCHEMA public TO service_role, anon, authenticated;
    GRANT SELECT, UPDATE ON public.payments, public.users TO service_role;
    GRANT SELECT, UPDATE ON public.packages TO service_role;`);
  const fixture = async (status = 'pending') => JSON.parse(await sql(`INSERT INTO public.payments(user_id, package_id, amount_kzt, status, paid_at)
    SELECT ${literal(userId)}, id, 990, ${literal(status)}, ${status === 'paid' ? "'2026-01-01Z'::timestamptz" : 'NULL'}
    FROM public.packages WHERE slug = 'starter' RETURNING row_to_json(payments)`));
  const legacy = await fixture('paid');
  await sql(readFileSync(resolve(root, 'supabase/migrations/20260905183201_atomic_package_payment.sql'), 'utf8'));
  await sql('ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY; ALTER TABLE public.users ENABLE ROW LEVEL SECURITY; ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;');
  const state = async (payment) => JSON.parse(await sql(`SELECT json_build_object('status', p.status, 'paid_at', p.paid_at, 'receipt', p.credited_generations, 'balance', u.paid_generations)
    FROM public.payments p JOIN public.users u ON u.id = p.user_id WHERE p.id = ${literal(payment.id)}`));
  const first = await fixture();
  assert.equal(await call(first), 'credited');
  const credited = await state(first);
  assert.equal(credited.balance, 5);
  assert.equal(credited.receipt, 5);
  assert.equal(credited.status, 'paid');
  assert.ok(credited.paid_at);
  assert.equal(await call(first), 'already_paid');
  assert.deepEqual(await state(first), credited);
  check('sequential retry: one credit, unchanged paid_at');

  const race = await fixture();
  // Hold the row in a separate transaction, then queue independent connections.
  const locker = sql(`BEGIN; SELECT id FROM public.payments WHERE id = ${literal(race.id)} FOR UPDATE; SELECT pg_sleep(1); COMMIT;`);
  // Observe the lock holder instead of assuming process scheduling from a timer.
  for (let i = 0; i < 100; i++) {
    if (await sql("SELECT count(*) FROM pg_stat_activity WHERE wait_event = 'PgSleep' AND pid <> pg_backend_pid()") !== '0') break;
    assert.ok(i < 99, 'lock holder did not start');
  }
  const concurrent = await Promise.all(Array.from({ length: 8 }, () => call(race)));
  await locker;
  assert.equal(concurrent.filter((result) => result === 'credited').length, 1);
  assert.equal(concurrent.filter((result) => result === 'already_paid').length, 7);
  assert.equal((await state(race)).balance, 10);
  check('eight concurrent sessions: exactly one credit');

  const otherPayments = await Promise.all([fixture(), fixture()]);
  assert.deepEqual(await Promise.all(otherPayments.map((p) => call(p))), ['credited', 'credited']);
  assert.equal((await state(first)).balance, 20);
  check('different concurrent payments for one user: no lost increment');

  const failing = await fixture();
  const beforeFailure = await state(failing);
  await sql(`CREATE FUNCTION public.fail_credit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'injected credit failure'; END $$;
    CREATE TRIGGER fail_credit BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.fail_credit();`);
  await expectSqlError(call(failing), 'P0001');
  assert.deepEqual(await state(failing), beforeFailure);
  await sql('DROP TRIGGER fail_credit ON public.users; DROP FUNCTION public.fail_credit();');
  assert.equal(await call(failing), 'credited');
  assert.equal((await state(failing)).balance, 25);
  check('credit failure rolls back paid/receipt/balance; retry succeeds');

  const legacyBefore = await state(legacy);
  await expectSqlError(call(legacy), '55000');
  assert.deepEqual(await state(legacy), legacyBefore);
  check('historical paid row preserved and quarantined, never guessed');

  const invalid = await fixture();
  const invalidBefore = await state(invalid);
  for (const amount of ['989', '990.000001', '991', '0', '-1', 'NaN', 'Infinity', null]) {
    await expectSqlError(call(invalid, amount), '22023');
  }
  await expectSqlError(call(invalid, '990', invalid.inv_id + 1), '22023');
  await expectSqlError(call({ ...invalid, id: randomUUID() }), '22023');
  await expectSqlError(call(invalid, '990', null), '22023');
  await expectSqlError(call({ ...invalid, id: null }), '22023');
  await expectSqlError(call(await fixture('cancelled')), '22023');
  await expectSqlError(call(first, '989'), '22023');
  assert.deepEqual(await state(invalid), invalidBefore);
  check('wrong amount/invoice/id/status rejected, including paid retry');

  await sql("UPDATE public.packages SET generations = 0 WHERE slug = 'starter'");
  await expectSqlError(call(invalid), '55000');
  assert.deepEqual(await state(invalid), invalidBefore);
  await sql("UPDATE public.packages SET generations = 7, price_kzt = 1000, active = false WHERE slug = 'starter'");
  // Existing fulfilled invoice stays acknowledged even after catalog changes.
  assert.equal(await call(first), 'already_paid');
  await sql("UPDATE public.packages SET generations = 5, price_kzt = 990, active = true WHERE slug = 'starter'");
  await sql(`UPDATE public.users SET paid_generations = NULL WHERE id = ${literal(userId)}`);
  const nullBefore = await state(invalid);
  await expectSqlError(call(invalid), '55000');
  assert.deepEqual(await state(invalid), nullBefore);
  await sql(`UPDATE public.users SET paid_generations = 2147483647 WHERE id = ${literal(userId)}`);
  const overflowBefore = await state(invalid);
  await expectSqlError(call(invalid), '22003');
  assert.deepEqual(await state(invalid), overflowBefore);
  await sql(`UPDATE public.users SET paid_generations = 25 WHERE id = ${literal(userId)}`);
  const inconsistent = await fixture();
  await sql(`UPDATE public.payments SET credited_generations = 5 WHERE id = ${literal(inconsistent.id)}`);
  await expectSqlError(call(inconsistent), '55000');
  await sql(`UPDATE public.payments SET status = 'paid' WHERE id = ${literal(inconsistent.id)}`);
  await expectSqlError(call(inconsistent), '55000');
  await sql(`UPDATE public.users SET paid_generations = -1 WHERE id = ${literal(userId)}`);
  const negativeBefore = await state(invalid);
  await expectSqlError(call(invalid), '55000');
  assert.deepEqual(await state(invalid), negativeBefore);
  await sql(`UPDATE public.users SET paid_generations = 25 WHERE id = ${literal(userId)}`);
  check('invalid package/null/negative balance/overflow/inconsistent receipt fail without partial fulfillment');

  for (const role of ['anon', 'authenticated']) {
    await expectSqlError(call(invalid, '990', invalid.inv_id, role), '42501');
    await expectSqlError(sql(`SET ROLE ${role}; SELECT public.increment_paid_generations(${literal(userId)}, 5)`), '42501');
  }
  await expectSqlError(sql(`SET ROLE service_role; SELECT public.increment_paid_generations(${literal(userId)}, 5)`), '42501');
  await sql('CREATE ROLE payment_outsider; GRANT USAGE ON SCHEMA public TO payment_outsider;');
  await expectSqlError(call(invalid, '990', invalid.inv_id, 'payment_outsider'), '42501');
  assert.equal(await sql("SELECT prosecdef FROM pg_proc WHERE oid = 'public.confirm_package_payment(uuid,integer,numeric)'::regprocedure"), 'f');
  assert.deepEqual(JSON.parse(await sql("SELECT array_to_json(proconfig) FROM pg_proc WHERE oid = 'public.confirm_package_payment(uuid,integer,numeric)'::regprocedure")), ['search_path=""']);
  check('RPC invoker only; public/anon/authenticated denied; service_role allowed');

  const secret = 'local-fixture-password-no-real-payment';
  process.env.ROBOKASSA_PASSWORD2 = secret;
  const loadTs = (path, mocks = {}) => {
    const source = ts.transpileModule(readFileSync(resolve(root, path), 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const loadedModule = { exports: {} };
    vm.runInThisContext(`(function(require,module,exports,process){${source}\n})`, { filename: path })(
      (name) => name in mocks ? mocks[name] : require(name), loadedModule, loadedModule.exports, process,
    );
    return loadedModule.exports;
  };
  const robokassa = loadTs('src/lib/robokassa.ts');
  let rpcCalls = 0;
  let mode = 'normal';
  let dbAvailable = true;
  const client = {
    from() { throw new Error('Package callback must use only the atomic RPC'); },
    async rpc(name, args) {
      rpcCalls++;
      assert.equal(name, 'confirm_package_payment');
      if (mode === 'transport') throw new Error('injected network failure');
      if (mode === 'unexpected') return { data: null, error: null };
      try {
        const data = await call({ id: args.p_payment_id, inv_id: args.p_inv_id }, args.p_amount_kzt);
        if (mode === 'lost_response') throw new Error('committed but response lost');
        return { data, error: null };
      } catch (error) {
        if (!error.stderr) throw error;
        return { data: null, error: { code: error.stderr.match(/ERROR:  (\w{5}):/)?.[1] } };
      }
    },
  };
  const handler = loadTs('src/app/api/payments/result/route.ts', {
    '@/lib/supabase': { getSupabase: () => dbAvailable ? client : null },
    '@/lib/robokassa': robokassa,
    '@/lib/telegram-bot': { isBotConfigured: () => false },
  });
  const signed = (payment, extra = {}) => {
    const params = { OutSum: '990.000000', InvId: String(payment.inv_id), Shp_paymentId: payment.id, ...extra };
    const shp = Object.keys(params).filter((k) => k.startsWith('Shp_')).sort().map((k) => `${k}=${params[k]}`);
    params.SignatureValue = createHash('md5').update([params.OutSum, params.InvId, secret, ...shp].join(':')).digest('hex');
    return params;
  };
  const callback = (params, method = 'GET') => {
    const encoded = new URLSearchParams(params);
    const req = new NextRequest(`http://localhost/api/payments/result${method === 'GET' ? `?${encoded}` : ''}`, {
      method, ...(method === 'POST' ? { body: encoded } : {}),
    });
    return handler[method](req);
  };
  const httpPayment = await fixture();
  let response = await callback(signed(httpPayment), 'POST');
  assert.equal(response.status, 200);
  assert.equal(await response.text(), `OK${httpPayment.inv_id}`);
  assert.match(response.headers.get('content-type'), /^text\/plain/);
  const httpPaid = await state(httpPayment);
  response = await callback(signed(httpPayment, { OutSum: '990' }));
  assert.equal(response.status, 200);
  assert.deepEqual(await state(httpPayment), httpPaid);
  check('real POST/GET handler + signature + PostgreSQL RPC: retry and six-decimal KZT');

  const httpRace = await fixture();
  const httpRaceBefore = await state(httpRace);
  const responses = await Promise.all(Array.from({ length: 8 }, (_, i) => callback(signed(httpRace), i % 2 ? 'GET' : 'POST')));
  for (const res of responses) {
    assert.equal(res.status, 200);
    assert.equal(await res.text(), `OK${httpRace.inv_id}`);
  }
  assert.equal((await state(httpRace)).balance, httpRaceBefore.balance + 5);
  check('parallel GET/POST callbacks credit once');

  const retryPayment = await fixture();
  await sql(`CREATE FUNCTION public.fail_credit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'injected'; END $$;
    CREATE TRIGGER fail_credit BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.fail_credit();`);
  const httpFailureBefore = await state(retryPayment);
  assert.equal((await callback(signed(retryPayment))).status, 503);
  assert.deepEqual(await state(retryPayment), httpFailureBefore);
  await sql('DROP TRIGGER fail_credit ON public.users; DROP FUNCTION public.fail_credit();');
  mode = 'lost_response';
  assert.equal((await callback(signed(retryPayment))).status, 503);
  const lostResponseState = await state(retryPayment);
  assert.equal(lostResponseState.balance, httpFailureBefore.balance + 5);
  mode = 'normal';
  assert.equal((await callback(signed(retryPayment))).status, 200);
  assert.deepEqual(await state(retryPayment), lostResponseState);
  assert.equal((await callback(signed(legacy))).status, 503);
  check('handler returns retryable failure; lost committed response retries without credit');

  const invalidHttp = await fixture();
  const validParams = signed(invalidHttp);
  const badParams = [
    { ...validParams, SignatureValue: '0'.repeat(32) },
    signed(invalidHttp, { OutSum: '1e3' }), signed(invalidHttp, { OutSum: 'NaN' }),
    signed(invalidHttp, { OutSum: '-990' }), signed(invalidHttp, { OutSum: '990.0000001' }),
    signed(invalidHttp, { InvId: '2147483648' }), signed(invalidHttp, { InvId: '1.5' }),
    signed(invalidHttp, { Shp_paymentId: 'bad-id' }), signed(invalidHttp, { Shp_paymentId: '' }),
    signed(invalidHttp, { Shp_orderId: randomUUID() }), signed(invalidHttp, { Shp_extra: 'ignored?' }),
    { ...validParams, SignatureValue: '' },
    [...Object.entries(validParams), ['OutSum', '990']],
    [...Object.entries(validParams), ['Shp_paymentId', invalidHttp.id]],
  ];
  const callsBefore = rpcCalls;
  for (const params of badParams) for (const method of ['GET', 'POST']) {
    assert.equal((await callback(params, method)).status, 400);
  }
  assert.equal(rpcCalls, callsBefore);
  const multipart = new FormData();
  for (const [key, value] of Object.entries(validParams)) multipart.set(key, value);
  multipart.set('OutSum', new Blob(['990']), 'amount.txt');
  assert.equal((await handler.POST(new NextRequest('http://localhost/api/payments/result', { method: 'POST', body: multipart }))).status, 400);
  assert.equal((await handler.POST(new NextRequest('http://localhost/api/payments/result', { method: 'POST', body: 'not-form', headers: { 'Content-Type': 'application/json' } }))).status, 400);
  assert.equal((await callback(signed(invalidHttp, { OutSum: '989' }))).status, 400);
  assert.equal((await callback(signed(invalidHttp, { InvId: String(invalidHttp.inv_id + 1) }))).status, 400);
  assert.equal((await callback(signed({ ...invalidHttp, id: randomUUID() }))).status, 400);
  for (const failureMode of ['transport', 'unexpected']) {
    mode = failureMode;
    assert.equal((await callback(validParams)).status, 503);
  }
  mode = 'normal';
  dbAvailable = false;
  assert.equal((await callback(validParams)).status, 503);
  dbAvailable = true;
  delete process.env.ROBOKASSA_PASSWORD2;
  assert.equal((await callback(validParams)).status, 503);
  process.env.ROBOKASSA_PASSWORD2 = secret;
  assert.equal((await state(invalidHttp)).status, 'pending');
  check('handler rejects tampering, malformed/duplicate/file/dual-target parameters; fails closed on outage');

  console.log(`PASS ${checks} payment regression groups (isolated DB; no real PostgREST/provider/Telegram)`);
} finally {
  if (started) execFileSync('pg_ctl', ['-D', `${dir}/data`, '-m', 'immediate', '-w', 'stop'], { env, stdio: 'pipe' });
  rmSync(dir, { recursive: true, force: true });
}
