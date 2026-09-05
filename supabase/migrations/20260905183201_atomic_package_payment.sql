-- Apply with callbacks/checkout paused and old callback workers drained.
-- NULL on historical paid rows means unknown fulfillment, NOT uncredited.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';

ALTER TABLE public.payments ADD COLUMN credited_generations integer
  CHECK (credited_generations > 0);

CREATE FUNCTION public.confirm_package_payment(
  p_payment_id uuid,
  p_inv_id integer,
  p_amount_kzt numeric
)
RETURNS text
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  payment public.payments%ROWTYPE;
  generations integer;
BEGIN
  IF p_payment_id IS NULL OR p_inv_id IS NULL OR p_inv_id <= 0
     OR p_amount_kzt IS NULL OR p_amount_kzt <= 0
     OR p_amount_kzt > 2147483647 THEN
    RAISE EXCEPTION 'Invalid payment parameters' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO payment FROM public.payments
    WHERE id = p_payment_id FOR UPDATE;
  IF NOT FOUND OR payment.inv_id IS DISTINCT FROM p_inv_id
     OR payment.amount_kzt IS DISTINCT FROM p_amount_kzt THEN
    RAISE EXCEPTION 'Payment parameters do not match' USING ERRCODE = '22023';
  END IF;

  IF payment.status = 'paid' THEN
    IF payment.credited_generations IS NULL OR payment.paid_at IS NULL THEN
      RAISE EXCEPTION 'Historical payment requires reconciliation' USING ERRCODE = '55000';
    END IF;
    RETURN 'already_paid';
  END IF;
  IF payment.status <> 'pending' THEN
    RAISE EXCEPTION 'Payment is not pending' USING ERRCODE = '22023';
  END IF;
  IF payment.credited_generations IS NOT NULL OR payment.paid_at IS NOT NULL THEN
    RAISE EXCEPTION 'Inconsistent payment requires reconciliation' USING ERRCODE = '55000';
  END IF;

  -- Existing contract stores package_id, not a purchase-time quantity snapshot.
  -- Freeze package quantities until pending invoices have been reconciled.
  SELECT p.generations INTO generations FROM public.packages p
    WHERE p.id = payment.package_id FOR SHARE;
  IF NOT FOUND OR generations IS NULL OR generations <= 0 THEN
    RAISE EXCEPTION 'Invalid payment package' USING ERRCODE = '55000';
  END IF;

  UPDATE public.payments SET status = 'paid', paid_at = now(),
    credited_generations = generations WHERE id = payment.id;
  UPDATE public.users SET paid_generations = paid_generations + generations
    WHERE id = payment.user_id AND paid_generations >= 0;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Missing user or invalid balance' USING ERRCODE = '55000';
  END IF;
  RETURN 'credited';
END;
$$;

REVOKE ALL ON FUNCTION public.confirm_package_payment(uuid, integer, numeric)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_package_payment(uuid, integer, numeric)
  TO service_role;

-- No remaining application caller should expose the unkeyed credit primitive.
REVOKE ALL ON FUNCTION public.increment_paid_generations(uuid, integer)
  FROM PUBLIC, anon, authenticated, service_role;

COMMIT;
