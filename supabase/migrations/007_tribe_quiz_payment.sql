-- ============================================================
-- Платный доступ к результату квиза "Узнай свой род" (990₸/квиз)
-- ============================================================

ALTER TABLE tribe_quiz_results ADD COLUMN IF NOT EXISTS paid BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE tribe_quiz_results ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Платежи за квиз идут через ту же таблицу payments, что и пакеты генераций,
-- поэтому package_id должен допускать NULL для этого типа оплаты.
ALTER TABLE payments ALTER COLUMN package_id DROP NOT NULL;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS quiz_result_id UUID REFERENCES tribe_quiz_results(id);

CREATE INDEX IF NOT EXISTS idx_payments_quiz_result ON payments(quiz_result_id);
