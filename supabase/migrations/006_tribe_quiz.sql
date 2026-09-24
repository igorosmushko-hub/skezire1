-- ============================================================
-- Tribe quiz: "Узнай свой род" — определение рода по анкете
-- ============================================================

CREATE TABLE IF NOT EXISTS tribe_quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),        -- nullable: квиз анонимный, логин нужен только для join
  answers JSONB NOT NULL,                    -- 12 сырых ответов анкеты
  rule_scores JSONB,                         -- этап A: [{tribeId, zhuzId, score}]
  suggested_tribe_ids TEXT[] NOT NULL,       -- финальный ранжированный список id родов
  llm_reasoning JSONB,                       -- полный ответ этапа B (candidates, disclaimer_ru/kk)
  llm_error TEXT,                            -- заполняется, если LLM упал и использован rule-based fallback
  joined_tribe_id TEXT,                      -- проставляется при join — трекинг конверсии тест → род
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tribe_quiz_user ON tribe_quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_tribe_quiz_created ON tribe_quiz_results(created_at DESC);
